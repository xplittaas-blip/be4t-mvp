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
import { thirdwebClient, ACTIVE_CHAIN } from '../core/web3Client';

// ── Showcase simulation ───────────────────────────────────────────────────────
async function simulateAcquisition(asset) {
    // Fake 1.5s network delay for realism
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

// ── Production: real ERC-1155 claim ──────────────────────────────────────────
async function claimToken({ asset, account, quantity = 1 }) {
    if (!thirdwebClient) throw new Error('Web3 client not initialised');
    if (!asset.contract_address) throw new Error('No contract address for this asset');
    if (!account) throw new Error('Wallet not connected');

    // Dynamic import — only loaded in production
    const { getContract, prepareContractCall, sendTransaction } = await import('thirdweb');

    const contract = getContract({
        client:  thirdwebClient,
        chain:   ACTIVE_CHAIN,
        address: asset.contract_address,
    });

    // ERC-1155 claim(address _receiver, uint256 _tokenId, uint256 _quantity)
    const tx = prepareContractCall({
        contract,
        method: 'function claim(address _receiver, uint256 _tokenId, uint256 _quantity) external',
        params: [account.address, BigInt(0), BigInt(quantity)],
    });

    const receipt = await sendTransaction({ transaction: tx, account });

    return {
        success:    true,
        txHash:     receipt.transactionHash,
        tokenId:    0,
        qty:        quantity,
        asset:      asset.name,
        mode:       'production',
        explorerUrl: `https://sepolia.basescan.org/tx/${receipt.transactionHash}`,
    };
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * acquireToken({ asset, account, quantity })
 * Unified entry point — automatically routes to simulation or blockchain.
 */
export async function acquireToken({ asset, account, quantity = 1 }) {
    if (!isProduction) {
        return simulateAcquisition(asset);
    }
    return claimToken({ asset, account, quantity });
}
