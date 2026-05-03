# 📈 Plan de Integración: Sticky Sidebar, Benefit Engine & Web3

Este plan describe la arquitectura para transformar la vista de detalle en una máquina de conversión, integrando el 'Fan Status' dentro del flujo de la calculadora de retornos, y conectando la inversión final con la blockchain de Base Sepolia usando Thirdweb.

## Cambios Propuestos

### 1. Refactor de UX: Sticky Sidebar (`src/pages/SongDetail.jsx`)
- **[MODIFY] `SongDetail.jsx`:** Cambiaremos la disposición del layout de columnas para asegurar que la columna derecha actúe como un `aside` pegajoso (`position: sticky; top: 2rem;`).
- Mientras el usuario lee el "Sobre esta canción" y navega por la información del artista en la columna izquierda, la Calculadora y el Botón de Inversión se quedarán fijos acompañando la lectura.

### 2. Benefit Engine (Bóveda Integrada)
- Moveremos la sección de Beneficios (actualmente al final de la página) y la inyectaremos en la columna derecha, justo debajo de la calculadora y encima del botón de inversión final.
- **Lógica Dinámica (Slider Sync):** Modificaremos cómo la `BenefitCard` calcula su estado. Ahora el progreso no solo dependerá del saldo actual (`userBalance`), sino de los tokens que el usuario está a punto de comprar usando el slider de la calculadora (`calcAmount`). 
- **[NEW] `FanStatusPanel.jsx`**: Crearemos un componente más condensado, basado en la imagen `image_10.png`, que mostrará la lista vertical de los 3 Tiers con su estado `Locked/Unlocked` iluminándose de gris a cian neón conforme el usuario mueve el slider de la calculadora.

### 3. Integración Web3 (Thirdweb v5)
- **[MODIFY] `SongDetail.jsx` / `useInvest.js`**: El botón `Invertir en esta Canción` pasará de ser un mock de simulación a disparar una transacción on-chain real a nuestro contrato en Base Sepolia.
- Usaremos los hooks de Thirdweb (`useSendTransaction`, `prepareContractCall`) para ejecutar la función `invest(tokenId, quantity)` del contrato `BE4T_Vault.sol`.
- Si se trata de un pago con Token ERC20 (mock USDC), orquestaremos primero un `approve` y luego el `invest`.
- Una vez la transacción es confirmada on-chain, guardaremos el registro en la base de datos de Supabase (`user_assets`) y activaremos el efecto confeti sobre la tarjeta.

## Open Questions

> [!IMPORTANT]
> - **Niveles de Tiers (100, 500, 2500):** En tu requerimiento mencionas que el VIP es 2500 tokens. Anteriormente lo habíamos seteado en 250 tokens en el archivo JSON. ¿Prefieres que ejecute un script para actualizar globalmente el JSON a los nuevos valores `100`, `500` y `2500`, o usamos los valores ya establecidos?
> - **Aprobación de USDC (Web3):** Para invertir, el usuario necesita aprobar (Approve) el gasto de USDC en el contrato. ¿Quieres que hagamos un solo botón que maneje automáticamente las dos transacciones (`Approve` y luego `Invest`) usando Account Abstraction/Batching, o dos pasos explícitos en la interfaz?
