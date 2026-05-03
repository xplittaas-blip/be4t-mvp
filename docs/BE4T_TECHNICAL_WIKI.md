# BE4T — Technical Architecture Wiki

> **Versión de Documento:** 2.0.0  
> **Clasificación:** Internal · Engineering  
> **Mantenido por:** Core Engineering Team  
> **Última actualización:** Abril 2026

---

## Tabla de Contenidos

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura de Aplicación](#3-arquitectura-de-aplicación)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Motor Financiero — The Engine](#5-motor-financiero--the-engine)
6. [Lógica del Mercado Secundario](#6-lógica-del-mercado-secundario)
7. [Gestión de Estado Global](#7-gestión-de-estado-global)
8. [Seguridad e Integridad Transaccional](#8-seguridad-e-integridad-transaccional)
9. [Infraestructura y Despliegue](#9-infraestructura-y-despliegue)
10. [Marco Regulatorio](#10-marco-regulatorio)
11. [Roadmap On-Chain](#11-roadmap-on-chain)

---

## 1. Visión General del Sistema

BE4T es una plataforma de tokenización de activos musicales reales (**RWA — Real-World Assets**). Permite fraccionamiento y trading de derechos de regalías de canciones comerciales, operando bajo un modelo de contabilidad de doble entrada que conecta matemáticamente el flujo del **fan/inversor** con el capital líquido de la **disquera/distribuidora**.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BE4T Platform                               │
│                                                                     │
│  ┌──────────┐     ┌────────────────┐     ┌──────────────────────┐  │
│  │  Fan /   │────▶│  Primary Market │────▶│  Label Ledger        │  │
│  │ Investor │     │  (Token Sale)   │     │  gross_capital ↑     │  │
│  └──────────┘     └────────────────┘     └──────────────────────┘  │
│       │                                                             │
│       │           ┌────────────────┐                               │
│       └──────────▶│ Secondary Mkt  │  P2P: Ledger neutral          │
│                   │  (Order Book)  │  B2B: Ledger gross_capital ↓  │
│                   └────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Modos de Operación

| Mode | `APP_MODE` | Descripción |
|------|-----------|-------------|
| **Showcase / Demo** | `showcase` | $50,000 USD de crédito ficticio. Sin dinero real. Ideal para pitch. |
| **Production** | `production` | Pagos reales vía Thirdweb Pay (USDC/ETH → Base L2). Supabase activo. |

La resolución del modo es **en tiempo de build** mediante la constante `__APP_MODE__` inyectada por `vite.config.js`:

```js
// src/core/env.js
export const APP_MODE    = resolveMode();
export const isProduction = APP_MODE === 'production';
export const isShowcase   = !isProduction;
```

---

## 2. Stack Tecnológico

### Frontend

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| Framework | **Vite + React** | 18.x | SPA render, HMR, bundling |
| UI Components | **React (JSX)** | — | Headless, inline styles con design tokens |
| Animaciones | **CSS Keyframes** | — | Micro-animations: pulse, slide-in, ticker |
| Tipografía | **Google Fonts · Inter** | — | Import via CSS `@import` |
| Internacionalización | **react-i18next** | — | ES / EN / PT-BR |
| Enrutado | **Estado en App.jsx** | — | SPA state-based routing (`currentPage`) |

> **Nota de arquitectura:** Se optó por inline styles + CSS modules sobre Tailwind para maximizar control granular en componentes financieros donde cada píxel de confianza visual importa.

### Backend

| Capa | Tecnología | Rol |
|------|-----------|-----|
| BaaS | **Supabase** | Auth, Postgres, Realtime, Storage |
| Base de Datos | **PostgreSQL 15** (Supabase managed) | Tablas relacionales, RLS |
| API | **Supabase JS Client** | Client-side queries con Row Level Security |
| Streaming data | **Spotify Web API** | Streams count para cálculo de regalías estimadas |

### Web3 / Blockchain

| Capa | Tecnología | Red | Rol |
|------|-----------|-----|-----|
| SDK | **Thirdweb SDK v5** | — | Checkout de pagos reales |
| Pagos | **Thirdweb Pay** | Base Mainnet (`chainId: 8453`) | USDC/ETH → compra de tokens |
| Testnet | **Base Sepolia** | — | Entorno de pruebas para smart contracts |
| Contratos (Roadmap) | **ERC-1155** | Base L2 | Representación multi-fracción de derechos |

---

## 3. Arquitectura de Aplicación

```
src/
├── App.jsx                    # Orquestador principal, routing, auth listener
├── core/
│   └── env.js                 # Configuración de entorno (build-time constants)
├── hooks/
│   └── useDemoBalance.js      # THE ENGINE — Ledger, portfolio, transacciones
├── pages/
│   ├── Marketplace.jsx        # Mercado Primario — catálogo de activos
│   ├── Portfolio.jsx          # Mis Canciones — portafolio del fan
│   ├── SecondaryMarket.jsx    # Premium Assets — Order Book P2P
│   └── LabelDashboard.jsx     # Business Dashboard — KPIs de la disquera
├── components/be4t/
│   ├── Navigation.jsx         # Navbar con routing state
│   ├── InvestmentCalculator.jsx # Calculadora de ROI + CTA de compra
│   ├── AssetDetailModal.jsx   # Modal de detalle del activo
│   ├── Footer.jsx             # Footer Porsche Dark + CNAD badge
│   └── RegulatoryModal.jsx    # Modal de Seguridad Jurídica
├── services/
│   └── supabase.js            # Cliente Supabase y helpers de query
└── contracts/
    └── (Smart contracts ABI — Roadmap)
```

### Flujo de Navegación

```
App.jsx [currentPage state]
    ├── 'explore'           → Marketplace
    ├── 'mis-canciones'     → Portfolio
    ├── 'label-dashboard'   → LabelDashboard
    ├── 'secondary-market'  → SecondaryMarket (Premium Assets)
    └── 'como-funciona'     → HowItWorks
```

La navegación se orquesta a través de eventos del DOM y props callbacks:

```js
// Desde cualquier componente deep en el árbol
document.dispatchEvent(new CustomEvent('navigate', { detail: 'mis-canciones' }));
```

---

## 4. Modelo de Datos

### 4.1 Tablas Supabase (Production)

#### `profiles`

```sql
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id),
  username     TEXT UNIQUE,
  role         TEXT DEFAULT 'investor',  -- 'investor' | 'artist' | 'label' | 'admin'
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### `tracks`

```sql
CREATE TABLE tracks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  artist           TEXT NOT NULL,
  asset_type       TEXT DEFAULT 'music',  -- 'music' | 'custom'
  token_price_usd  NUMERIC(10,4),
  total_supply     INTEGER,
  apy_estimate     NUMERIC(5,2),
  valuation_usd    NUMERIC(14,2),
  is_tokenized     BOOLEAN DEFAULT FALSE,
  cover_url        TEXT,
  metadata         JSONB,   -- spotify_streams, youtube_views, isrc, bio, etc.
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_investments`

```sql
CREATE TABLE user_investments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  track_id     UUID REFERENCES tracks(id)   ON DELETE CASCADE,
  fractions    INTEGER NOT NULL,
  cost_usd     NUMERIC(12,2) NOT NULL,
  acquired_at  TIMESTAMPTZ DEFAULT NOW(),
  is_listed    BOOLEAN DEFAULT FALSE,    -- P2P market flag
  list_price   NUMERIC(12,2),           -- P2P ask price
  is_exited    BOOLEAN DEFAULT FALSE,   -- B2B instant exit flag
  exit_value   NUMERIC(12,2),           -- Value received on exit
  UNIQUE (user_id, track_id)            -- One position per user/track
);
```

#### `label_metrics`

```sql
CREATE TABLE label_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id            UUID REFERENCES profiles(id),
  gross_capital       NUMERIC(16,2) DEFAULT 0,   -- Sum of all fan investments
  reserve_inventory   INTEGER DEFAULT 0,          -- Tokens repurchased via B2B
  mkt_savings         NUMERIC(16,2)
    GENERATED ALWAYS AS (gross_capital * 0.15) STORED,
  last_updated        TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Relaciones entre Entidades

```
profiles (1) ──────────────── (N) user_investments
tracks   (1) ──────────────── (N) user_investments
profiles (1) ──────────────── (1) label_metrics     [role: label]
tracks   (N) ──────────────── (M) label_metrics via track ownership
```

### 4.3 Estado Demo (localStorage)

En modo Showcase, el estado financiero se persiste en `localStorage` bajo tres claves versionadas:

| Clave | Tipo | Contenido |
|-------|------|-----------|
| `be4t_demo_balance` | `string` (float) | Saldo disponible del usuario |
| `be4t_demo_acquired` | `JSON object` | Map `{ [songId]: InvestmentRecord }` |
| `be4t_demo_label_ledger` | `JSON object` | `{ gross_capital, reserve_inventory }` |
| `be4t_demo_version` | `string` | `"v4-fintech"` — migración automática |

---

## 5. Motor Financiero — The Engine

El corazón de BE4T reside en `src/hooks/useDemoBalance.js`. Este hook implementa un **Ledger de Doble Entrada** que asegura coherencia matemática entre el balance del inversor y la liquidez de la disquera.

### 5.1 Tokenización de RWA (Real-World Assets)

Los derechos de autor de una canción se fragmentan en tokens digitales:

```
Valuación de la Obra:
  valuation_usd = (spotify_streams / 1,000,000) × $3,000

Token Price:
  token_price_usd = valuation_usd / total_supply

Fan Ownership:
  ownership_pct = (fractions_held / total_supply) × 100
```

**Ejemplo — "Tusa" (Karol G, 4.2B streams):**

```
valuation_usd  = 4,200 × $3,000         = $12,600,000
total_supply   = 10,000 tokens
token_price    = $12,600,000 / 10,000   = $1,260 / token

Fan compra 5 tokens:
  cost           = 5 × $1,260 = $6,300
  ownership_pct  = (5 / 10,000) × 100 = 0.05%
  monthly_royalty = $6,300 × (22% / 12) = $115.50/mes
```

### 5.2 Algoritmo del Ticker de Regalías

Las regalías se calculan con **acumulación continua** basada en el timestamp exacto de adquisición — resolución al segundo.

**Fórmula matemática:**

```
royalties_accrued(Δt) = (investment_usd × TEA/100 / 31,536,000) × Δt_seconds

Donde:
  TEA         = Tasa Efectiva Anual (APY)
  31,536,000  = Segundos en un año (365d × 24h × 3600s)
  Δt_seconds  = (Date.now() - acquiredAt_ms) / 1000
```

**Implementación exacta (`useDemoBalance.js`):**

```js
const SECONDS_PER_YEAR = 31_536_000;

// Computed on every render — never stored
const now           = Date.now();
const secondsSince  = (now - data.acquiredAt) / 1000;
const apyDecimal    = (data.apy || 12) / 100;

const earnedToDate  = (data.cost * apyDecimal / SECONDS_PER_YEAR) * secondsSince;
// → parseFloat(earnedToDate.toFixed(4))
```

> **Propiedad clave:** `earnedToDate` se recalcula en cada render desde el timestamp original. No hay estado intermedio. El fan ve regalías en tiempo real al precisión de 4 decimales.

### 5.3 Doble Ledger — Integridad del Capital

```
COMPRA PRIMARIA (Fan → Disquera)
═══════════════════════════════════════════
  DÉBITO   user.balance          -= cost
  CRÉDITO  label.gross_capital   += cost
  CREA     user_investments[id]   = { fractions, cost, acquiredAt, ... }

COMPRA P2P (Fan A → Fan B)
═══════════════════════════════════════════
  DÉBITO   buyer.balance         -= list_price
  TRANSFIERE ownership record
  label.gross_capital             = sin cambio ✓

INSTANT EXIT B2B (Fan → Disquera)
═══════════════════════════════════════════
  refund   = cost × 0.90
  CRÉDITO  user.balance          += refund
  DÉBITO   label.gross_capital   -= refund
  CRÉDITO  label.reserve_inventory += fractions
  LOCK     entry.exited           = true
```

---

## 6. Lógica del Mercado Secundario

### 6.1 Ciclo de Vida de un Token

```
[PRIMARIO]   →   [LISTADO P2P]   →   [TRANSFERIDO]
     ↓                                     ↓
[INSTANT EXIT B2B] → exited=true (locked permanently)
```

### 6.2 Instant Exit — B2B (Haircut 10%)

```js
// instantExit() — useDemoBalance.js
const refund = parseFloat((entry.cost * 0.9).toFixed(2));

setBalance(b => b + refund);
setLabelLedger(l => ({
    gross_capital:     Math.max(0, l.gross_capital - refund),
    reserve_inventory: l.reserve_inventory + entry.fractions
}));
// entry.exited = true → permanent lock
```

| Condición | Resultado |
|-----------|-----------|
| `entry.isListed === true` | Bloqueado — unlist primero |
| `entry.exited === true` | Bloqueado — token ya liquidado |
| Token válido | Refund = cost × 0.90 instantáneo |

### 6.3 Order Book P2P

```js
// SecondaryMarket.jsx
const allListings = [
    ...portfolio.filter(h => h.isListed).map(transformToListing), // propios
    ...MOCK_SELLERS  // market makers externos
];

// Sort options: 'premium' | 'apy' | 'price'
// Filter options: 'all' | 'BLUE_CHIP' | 'EMERGING'
```

| Campo | Descripción |
|-------|-------------|
| `listPrice` | Precio de venta fijado por el vendedor |
| `premium` | `((listPrice - originalCost) / originalCost) × 100` |
| `apy` | APY transferido al comprador |
| `risk` | `BLUE_CHIP` (>10 fracciones) / `EMERGING` |

---

## 7. Gestión de Estado Global

### 7.1 Arquitectura

```
useDemoBalance (hook — compartido vía import, no Context)
│
├── balance         ← React.useState → useEffect → localStorage
├── acquiredMap     ← React.useState → useEffect → localStorage
└── labelLedger     ← React.useState → useEffect → localStorage
         │
         ▼
   portfolio  ← COMPUTED (no state) — recalculado en cada render
               Garantiza regalías precisas sin datos stale
```

### 7.2 KPIs del LabelDashboard

```js
const { labelLedger } = useDemoBalance();

const grossCapital      = labelLedger.gross_capital;
const mktSavings        = grossCapital * 0.15;        // 15% ahorro publicidad
const liquidityVelocity = grossCapital / daysActive;  // USD captados/día
```

---

## 8. Seguridad e Integridad Transaccional

### 8.1 Prevención de Race Conditions

```js
// CORRECTO — closure funcional garantiza valor previo atómico
setBalance(prev => parseFloat((prev - cost).toFixed(2)));

// INCORRECTO — puede leer balance stale en renders concurrentes
setBalance(balance - cost);
```

Todos los setters de `useDemoBalance` usan el patrón `setState(prev => ...)`.

### 8.2 Pre-flight Guards

```js
const acquire = useCallback((songId, cost, fractions, songMeta) => {
    if (!isShowcase)  return { ok: false, reason: 'not-showcase' };
    if (cost <= 0)    return { ok: false, reason: 'invalid-cost' };

    const current = loadBalance(); // Lee de localStorage directamente
    if (current < cost) return { ok: false, reason: 'insufficient' };
    // ... transacción segura
}, []);
```

### 8.3 Asset Locks

| Lock | Campo | Efecto |
|------|-------|--------|
| **Listed Lock** | `isListed: true` | Bloquea Instant Exit |
| **Exited Lock** | `exited: true` | Bloquea toda operación futura |
| **Version Lock** | `be4t_demo_version` mismatch | Wipe y reinicio limpio |

---

## 9. Infraestructura y Despliegue

### 9.1 Pipeline CI/CD

```
Git Push (main)
    → GitHub → Vercel (Auto-deploy)
        → Build: vite build --mode production
            → __APP_MODE__ = VITE_APP_MODE env var
        → Deploy: charged-satellite-three.vercel.app
```

### 9.2 Variables de Entorno

| Variable | Descripción | Entorno |
|----------|-------------|---------|
| `VITE_APP_MODE` | `'production'` o `'showcase'` | Todos |
| `VITE_SUPABASE_URL` | URL proyecto Supabase | Production |
| `VITE_SUPABASE_ANON_KEY` | Anon key (RLS) | Production |
| `VITE_THIRDWEB_CLIENT_ID` | Thirdweb Pay client ID | Production |

---

## 10. Marco Regulatorio

BE4T opera bajo la **Ley de Emisión de Activos Digitales de El Salvador (2022)**, en proceso de registro formal ante la **CNAD (Comisión Nacional de Activos Digitales)**.

| Pilar | Implementación |
|-------|----------------|
| **Marco Legal** | Tokens respaldados por contratos de recaudo digitalizados |
| **Custodia** | Derechos vinculados a ISRC por canción |
| **Transparencia** | Auditoría on-chain (Roadmap Q3 2026) |
| **KYC/AML** | Supabase Auth + Thirdweb Identity en producción |

---

## 11. Roadmap On-Chain

### Fase 1 — MVP Simulado ✅ (Actual)
- [x] Ledger doble entrada en localStorage (v4-fintech)
- [x] Regalías continuas por segundo
- [x] Mercado secundario P2P + B2B Instant Exit
- [x] Business Dashboard con KPIs en tiempo real
- [x] Registro ante CNAD (en proceso)

### Fase 2 — Producción Backend (Q3 2026)
- [ ] Migrar `user_investments` → Supabase (PostgreSQL)
- [ ] Pagos USDC/ETH vía Thirdweb Pay en Base L2
- [ ] Row Level Security en todas las tablas
- [ ] Webhooks Spotify para streams en tiempo real

### Fase 3 — Full On-Chain (Q1 2027)

```solidity
// Visión — ERC-1155 Multi-fraction Royalty Token
contract BE4TRoyalties is ERC1155, Ownable {
    mapping(uint256 => uint256) public royaltyPool; // trackId → accrued
    mapping(uint256 => uint256) public totalSupply;

    // Distributor deposits royalties on-chain
    function distributeRoyalties(uint256 trackId) external payable {
        uint256 perToken = msg.value / totalSupply[trackId];
        royaltyPool[trackId] += perToken;
    }

    // Fan claims proportional royalties
    function claimRoyalties(uint256 trackId) external {
        uint256 bal    = balanceOf(msg.sender, trackId);
        uint256 payout = royaltyPool[trackId] * bal;
        // Transfer via Chainlink CCIP
    }
}
```

**Objetivos Full On-Chain:**
- Smart Contract ERC-1155 en Base Mainnet
- Payout automático via Chainlink Automation
- Liquidity pools con Uniswap V3 para pricing dinámico
- ZK-proof de propiedad de derechos (ISRC on-chain)

---

## Glosario

| Término | Definición |
|---------|-----------|
| **RWA** | Real-World Asset — activo del mundo real representado digitalmente |
| **TEA / APY** | Tasa Efectiva Anual / Annual Percentage Yield |
| **Doble Entrada** | Sistema contable donde cada transacción afecta dos cuentas |
| **Haircut B2B** | Descuento del 10% en recompras de la disquera |
| **Instant Exit** | Liquidez inmediata — tokens vendidos a disquera al 90% |
| **Gross Capital** | Suma de inversiones primarias captadas por la disquera |
| **Reserve Inventory** | Tokens recomprados via B2B, de vuelta en la disquera |
| **CNAD** | Comisión Nacional de Activos Digitales — regulador El Salvador |
| **ISRC** | International Standard Recording Code — ID único por canción |
| **Base L2** | Blockchain Layer 2 de Coinbase — red de producción |

---

> *Este documento es la fuente de verdad técnica del proyecto BE4T.*  
> *Para modificaciones, abrir un PR con label `docs: technical-wiki`.*
