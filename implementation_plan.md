# 🎟️ Fan Benefits (Token-Gating) - Plan de Implementación

Este plan aborda la integración de la sección de beneficios exclusivos ('Exclusive Perks for Holders') dentro de cada activo del Marketplace, utilizando el diseño estilo Berlín Underground.

## Cambios Propuestos

### 1. Refactor de Data (`src/data/fallbackSongs.json`)
Ejecutaremos un script en Python para inyectar un array `perks` a todas las canciones existentes en el catálogo. Este objeto contendrá los beneficios estándar requeridos:
```json
"perks": [
  { "min_tokens": 50, "label": "Early Access to Tickets", "icon": "🎟️" },
  { "min_tokens": 150, "label": "Limited Edition Merch", "icon": "🧢" },
  { "min_tokens": 500, "label": "Studio Session Behind-the-scenes", "icon": "🎧" }
]
```
*(Nota: ajusté las cantidades de tokens para que sean alcanzables en la demo, asumiendo fracciones promedio de $3 a $10. Los números originales de 5,000 requerirían inversiones de $20,000+ USD que romperían el saldo de la demo).*

### 2. Nuevo Componente (`src/components/be4t/BenefitCard.jsx`)
Se creará un componente aislado para manejar la visualización de los Perks.
- **Lógica Dinámica:** Recibirá `userBalance` (la cantidad de fracciones o tokens que el usuario posee de ese track específico). Comparará este valor contra `min_tokens`.
- **Estética 'Berlin Underground':**
  - Fondo `bg-[#111]` o `bg-black` con bordes sutiles de cristal `border border-white/5`.
  - Tipografías crudas e industriales (Mono/Inter).
  - Efectos visuales: Estado bloqueado (ícono gris/candado) vs. Estado Desbloqueado (ícono cian neón `text-[#00FFCC]`, botón animado 'Reclamar').

### 3. Integración en `SongDetail.jsx`
- Importar y renderizar `<BenefitCard>` debajo del bloque de Retornos (`ReturnCalculator`).
- Se alimentará conectando `useDemoBalance` (o `useOnChainBalance` a futuro) consultando específicamente las `fractions` poseídas de ese `songId`.
- El botón de 'Reclamar' en modo Showcase disparará un popup nativo de éxito o `alert()` pulido.

## Open Questions

> [!IMPORTANT]
> - **Cantidades Requeridas:** Para que un usuario experimente desbloquear un beneficio en la demo, propongo que las barreras sean `50`, `150` y `500` fracciones. ¿Estás de acuerdo con estos números o prefieres mantener los originales `500`, `1000`, `5000`?
> - **UI 'Reclamar':** En el modo Demo, cuando el usuario presiona 'Reclamar', ¿quieres un Modal a pantalla completa o un simple 'Toast / Notification' que diga que se enviará el correo?

## Plan de Verificación
1. Ejecutar la demo.
2. Comprar 51 tokens de "High (feat. Apache)".
3. Verificar que la card del primer beneficio (`min_tokens: 50`) pase de gris/candado a color Cyan neón con el botón Reclamar activo, mientras que los beneficios superiores permanezcan bloqueados.
