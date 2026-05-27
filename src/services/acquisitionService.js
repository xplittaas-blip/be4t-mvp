/**
 * BE4T Acquisition Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the "Adquirir participación de regalías" flow.
 *
 * Showcase mode: returns a simulated success (no blockchain).
 * Production mode: calls the ERC-1155 claim function via Thirdweb.
 *
 * Usage:
 *   import { acquireToken } from 'services/acquisitionService';
 *   const result = await acquireToken({ asset, account, quantity: 1 });
 */
import { isProduction } from '../core/env';
import { getThirdwebClient } from '../core/web3Client';

// ── Showcase simulation ───────────────────────────────────────────────────────
async function simulateAcquisition(asset) {
    await new Promise(r => setTimeout(r, 1500));
    return {
        success: true,
        txHash:  '0xDEMO_' + Math.random().toString(16).slice(2, 18).toUpperCase(),
        tokenId: 0,
        qty:     1,
        asset:   asset.name,
        mode:    'showcase',
    };
}

// ── Production: real USDC approve + Vault invest ──────────────────────────
async function claimToken({ asset, account, quantity = 1, totalPrice = null }) {
    const web3 = await getThirdwebClient();
    if (!web3) throw new Error('Web3 client not initialised');
    if (!account) throw new Error('Wallet not connected');

    const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
    const USDC_ADDRESS  = import.meta.env.VITE_USDC_ADDRESS;
    
    if (!VAULT_ADDRESS || !USDC_ADDRESS) {
        throw new Error("Faltan variables de entorno para los contratos de producción");
    }

    const { getContract, prepareContractCall, sendTransaction } = await import('thirdweb');

    const usdcContract = getContract({
        client:  web3.client,
        chain:   web3.chain,
        address: USDC_ADDRESS,
    });
    
    const vaultContract = getContract({
        client:  web3.client,
        chain:   web3.chain,
        address: VAULT_ADDRESS,
    });

    // Estimate total price based on token price if not provided
    const fallbackPrice = asset.price || asset.token_price_usd || 10;
    const finalTotal = totalPrice ?? (quantity * fallbackPrice);
    
    const totalUSDC = BigInt(Math.floor(finalTotal * 1000000));

    // 1. Approve USDC
    const approveTx = prepareContractCall({
        contract: usdcContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [VAULT_ADDRESS, totalUSDC]
    });
    await sendTransaction({ transaction: approveTx, account });

    // 2. Invest in Vault
    const investTx = prepareContractCall({
        contract: vaultContract,
        method: "function invest(uint256 id, uint256 quantity)",
        params: [BigInt(asset.id || 1), BigInt(quantity)]
    });
    const receipt = await sendTransaction({ transaction: investTx, account });

    return {
        success:    true,
        txHash:     receipt.transactionHash,
        tokenId:    asset.id || 1,
        qty:        quantity,
        asset:      asset.name || asset.title || 'asset',
        mode:       'production',
        explorerUrl: `https://sepolia.basescan.org/tx/${receipt.transactionHash}`,
    };
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * acquireToken({ asset, account, quantity })
 * Unified entry point — automatically routes to simulation or blockchain.
 */
export async function acquireToken({ asset, account, quantity = 1, totalPrice = null }) {
    if (!isProduction) {
        return simulateAcquisition(asset);
    }
    return claimToken({ asset, account, quantity, totalPrice });
}
