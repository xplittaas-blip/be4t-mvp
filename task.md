# Hardhat & Smart Contracts Setup

- [x] Install Hardhat and OpenZeppelin dependencies (`hardhat`, `@nomicfoundation/hardhat-toolbox`, `@openzeppelin/contracts`, `dotenv`).
- [x] Initialize Hardhat configuration (`hardhat.config.cjs`).
- [x] Create `contracts/MockUSDC.sol` (ERC20 with faucet function).
- [x] Create `contracts/BE4T_Vault.sol` (ERC1155 with AccessControl, Pausable, KYC restriction, invest, and pull-based royalty claiming).
- [x] Create `scripts/deploy.js` to deploy both contracts to Base Sepolia and output their addresses.
- [x] Add `.env.example` variables for Hardhat (Private Key, Base Sepolia RPC, Blockscout API Key).
- [x] Verify local compilation (`npx hardhat compile`).
