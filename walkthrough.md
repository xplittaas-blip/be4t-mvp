# 🎧 Fase 2: BE4T_Vault & Web3 Ledger

La fundación técnica para la Fase 2 en Base Sepolia está construida e integrada al repositorio. Ahora la plataforma está técnicamente equipada para mintear tokens fraccionados reales.

## ¿Qué se ha implementado?

### 1. Hardhat y OpenZeppelin en el Repositorio
Se ha configurado un entorno completo de compilación de Solidity v0.8.24 (Cancun EVM EVM-compatible) directamente en la carpeta raíz.
* Se ha generado el archivo `hardhat.config.cjs` apuntando al RPC de Base Sepolia y con soporte nativo de Blockscout para la verificación del código fuente.

### 2. MockUSDC (Moneda de Pruebas BE4T)
Dado que a veces es difícil obtener USDC oficial en redes Testnet (o la liquidez falla), he creado un contrato `MockUSDC`.
* Cuenta con seis decimales, estándar del USDC real.
* Tiene un mecanismo `faucet()` restringido al rol de Dueño (Owner), de modo de que el administrador pueda enviar saldo a voluntad a las billeteras de Demo InAppWallet que usen los inversionistas.

### 3. BE4T_Vault (El Smart Contract RWA Principal)
El Smart Contract es un hibrido institucional. Utiliza el estándar **ERC-1155** (Multi-Token Standard).

> [!TIP]
> **Componentes del Contrato:**
> - **KYC Gating:** Se hace uso del método `_update` heredado de OpenZeppelin v5 para truncar transferencias secundarias si el address receptor no está validado (`isKYCVerified`). Posee también el método `manualVerify(address)`.
> - **Mint & Buy (invest):** Reclama los USDC usando `safeTransferFrom` y emite tokens de la canción basándose en la disponibilidad. 
> - **Metadatos y Transparencia:** La función `uri(id)` está expuesta y soporta el enlace dinámico al hash maestro legal en IPFS.
> - **Sistema PULL de Regalías:** En lugar de emitir cientos de micropagos con alto Gas (método Push), las regalías se depositan usando `distributeRoyalties`. Cada holder retira libre y pro-porcionalmente usando `claimRoyalties(id)`, calculando su alícuota en tiempo real respecto al global de tokens emitidos. 

### 4. Setup de Variables de Entorno
El archivo `.env.example` y `.env.local.example` se actualizaron con los bloques requeridos por el script:
```env
# ── Hardhat / Smart Contracts ───────────────────────────────────────────────
PRIVATE_KEY=0xYourPrivateKeyHere
BASE_SEPOLIA_RPC=https://sepolia.base.org
BLOCKSCOUT_API_KEY=YourBlockscoutApiKey
```

## Siguientes Pasos (Ejecución del Usuario)

Antes de avanzar con el rediseño del hook frontend de Inversión (el refactor de `useDemoBalance.js`), necesitamos desplegar estos contratos para obtener sus direcciones definitivas y embeberlas en las variables de entorno de React.

1. Añade tu `PRIVATE_KEY` en el archivo `.env.local`. (Debe tener algo de ETH de Base Sepolia para el gas).
2. Ejecuta en tu terminal el script de despliegue:
   ```bash
   npx hardhat run scripts/deploy.js --network base-sepolia
   ```
3. El script imprimirá 2 direcciones (`MockUSDC` y `BE4T_Vault`). Pásamelas por aquí y procederé a engancharlas con el SDK de Thirdweb en el Frontend.
