# 🌐 BE4T Tokenization Flow (Web3 Ready)

Este documento describe la arquitectura para conectar el contrato inteligente `BE4TAsset.sol` (ERC-1155) con el componente Frontend `TokenizationModal.jsx` de BE4T.

## 1. Arquitectura del Contrato (ERC-1155)
En lugar de desplegar un contrato nuevo por cada canción o factura, BE4T utiliza un único contrato maestro `BE4TAsset` (Estándar ERC-1155 Multi-Token). 
- Cada fila en la tabla de Supabase (`assets.id`) corresponderá a un `tokenId` único en el contrato.
- Esto ahorra más del 90% en comisiones de Gas (Gas Fees) en la red Arbitrum y simplifica la liquidez B2C.

## 2. Preparación (Compilación)
Antes de integrar con la UI, el contrato debe compilarse utilizando **Hardhat** o **Foundry** para generar el archivo `ABI.json` (Application Binary Interface) y su `Bytecode`.
1. El equipo B2B desplegará `BE4TAsset.sol` **una sola vez** en la L2 Arbitrum.
2. Anotaremos su _Contract Address_ global en nuestras variables de entorno (`VITE_BE4T_CONTRACT_ADDRESS`).

## 3. Conexión con `TokenizationModal.jsx`
Actualmente, el botón "Desplegar Contrato" simula una latencia de 3 segundos y actualiza Supabase. Para volverlo real:

### A. Solicitar Firma Web3 (Metamask / Web3Auth)
En la función `handleDeploy()` de `TokenizationModal.jsx`, reemplazaremos el `setTimeout` con la inyección del proveedor Web3:

```javascript
import { ethers } from 'ethers';
import BE4TAssetABI from '../../abis/BE4TAsset.json'; // ABI generado

// 1. Detectar proveedor de billetera (Metamask)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 2. Instanciar el Contrato Maestro
const contractAddress = import.meta.env.VITE_BE4T_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, BE4TAssetABI, signer);
```

### B. Ejecutar el Minting (Emisión Real)
En vez de simular un hash, ejecutaremos la función `mintAsset` que escribimos en Solidity pasándole el ID real proveniente de Supabase:

```javascript
// 3. Solicitar ejecución a la Blockchain
// mintAsset(address account, uint256 id, uint256 amount, bytes data)
const tx = await contract.mintAsset(
    signer.address,          // Receptor (Emisor B2B)
    asset.id,                // El ID de Supabase será el Token ID
    asset.total_supply,      // Fracciones (Ej: 2500 tokens)
    "0x"                     // Datos extra (Vacío)
);

setIsDeploying(true); // Cambiando UI a "Enviando transacción a la red..."

// 4. Esperar a que los validadores L2 confirmen el bloque
const receipt = await tx.wait(); 
const realHash = receipt.hash; // Obtenemos el TX Hash en Blockchain
```

### C. Sincronización con nuestro Backend
Una vez el bloque confirme la emisión `ERC-1155`, usamos ese `realHash` para actualizar Supabase exactamente como lo venimos haciendo:

```javascript
// 5. Acuñado exitoso -> Persistimos la inmutabilidad en Postgres
const { error } = await supabase
    .from('assets')
    .update({ 
        is_tokenized: true, 
        contract_address: realHash // Aquí guardamos el TX de Arbitrum
    })
    .eq('id', asset.id);
```

## Resumen del UX para el Usuario B2B
El Emisor de Activos **nunca abandonará BE4T**. Verá el modal, pulsa "Desplegar Contrato", firmará un discreto popup de su billetera custodial (como Magic Link o Privy), la UI esperará 3 segundos leyendo el TxHash real, y el activo aparecerá automáticamente protegido criptográficamente en el explorador de la Blockchain.
