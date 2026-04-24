# Desarrollo del Núcleo de Activos (Smart Contracts) - Fase 2

Este plan detalla la migración de la lógica de balance simulada hacia un **Smart Contract real (ERC-1155)** deplegado en Base Sepolia, integrando OpenZeppelin, Hardhat y Thirdweb v5.

## Proposed Changes

### Construcción del Smart Contract

#### [NEW] `contracts/BE4T_Vault.sol`
Se creará un contrato ERC-1155 optimizado y seguro.
- **Roles y Seguridad:** Hereda de `ERC1155`, `AccessControl` (para el rol del Sello/Admin) y `Pausable` (para detener trading en emergencias).
- **KYC Status:** Mapeo `mapping(address => bool) public isKYCVerified`. El contrato sobreescribirá el hook `_update` (o `_beforeTokenTransfer`) para revertir transferencias si el usuario emisor o receptor no está verificado (preparación ERC-3643).
- **Estructura del Activo:** 
  ```solidity
  struct SongInfo {
      uint256 maxSupply;
      uint256 currentSupply;
      uint256 pricePerToken; // en Test-USDC
      string customUri;
  }
  ```
- **`createSongAsset`:** (Solo Sello). Configura la SongInfo y emite el evento de URI dinámico con el enlace IPFS que contendrá el ISRC y el contrato legal.
- **`invest`:** El usuario especifica `id` y `quantity`. El contrato verifica el KYC, cobra el `pricePerToken * quantity` extrayéndolo de la billetera del usuario vía `IERC20.transferFrom` hacia el contrato (o el Sello), y acuña los tokens 1155.
- **`distributeRoyalties`:** Un sistema simple donde el Sello delega USDC al contrato. El contrato actualizará un `merkleRoot` o un contador `royaltiesPerShare` indexado por `id` para manejar los reclamos pro-rata.

### Infraestructura de Despliegue

#### [NEW] `hardhat.config.cjs`
- Configuración del entorno de Hardhat para compilar y desplegar en Base Sepolia.
- Soporte para verificación en Blockscout/Basescan.

#### [NEW] `scripts/deploy.js`
- Script de despliegue principal.
- Lee credenciales (.env) para financiar el gas.
- Pasa la dirección del Test-USDC al constructor.
- Imprime la dirección e invoca `hardhat verify` dinámicamente.

#### [MODIFY] `package.json`
- Se añadirán dependencias: `hardhat`, `@nomicfoundation/hardhat-toolbox`, `@openzeppelin/contracts`, `dotenv`.

---

### Integración Web3 (Frontend)

#### [MODIFY] `src/hooks/useDemoBalance.js`
Se actualizará la lógica del puente. En `isProduction` (o fase Beta Testnet), en lugar de usar localStorage, la función de compra se interceptará de la siguiente manera:

1. **Aprobación USDC:** Se construirá y enviará una transacción `approve` al contrato del Test-USDC usando SDK v5.
2. **Deploy transacción:** Se crea la transacción on-chain: `prepareContractCall({ contract: BE4TVault, method: "invest", params: [id, quantity] })`.
3. **Firma & Envío:** Se solicita la firma al `inAppWallet` del usuario.
4. **Respaldo de Base de Datos:** Tras recibir el hash del recibo on-chain, se despacha la llamada hacia `supabase.from('user_assets').upsert(...)` para reflejar la posesión instantánea (actuando como indexador de la UI antes de que el Subgraph esté listo).

## Open Questions

> [!IMPORTANT]
> - **Test-USDC:** ¿Ya existe un contrato de Test-USDC desplegado en Base Sepolia del cual vamos a leer, o quieres que el script de despliegue cree un "MockUSDC" para que la plataforma pueda acuñar dinero de prueba a los usuarios nuevos automáticamente?
> - **KYC Activo:** ¿El control KYC debería bloquear transferencias y compras *desde el día 1*, o lo dejamos en `true` por defecto para todas las direcciones hasta la Fase 3?
> - **Gestión de Regalías:** ¿Prefieres que `distributeRoyalties` envíe el dinero directamente a las wallets usando un loop, o que se acumule en el contrato y los usuarios "Reclamen" (Sistema pull: `claimRoyalties()`) para evitar altos costos de gas para el Sello?

## Verification Plan

### Automated Tests
- Compilación del Smart Contract `npx hardhat compile`.
- Despliegue en Base Sepolia a través de Alchemy/Infura RPC y verificación de etherscan API.

### Manual Verification
- Requerir tokens de prueba desde una billetera independiente.
- Ejecutar el flujo completo de "Adquirir Participación" en la demo live, aprobar la transacción con el widget de Thirdweb, mintear los tokens 1155, verificar la transferencia de USDC y observar reflejado el cambio en el balance global.
