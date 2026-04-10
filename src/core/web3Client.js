/**
 * BE4T Web3 Client — lazy & safe
 * ─────────────────────────────────────────────────────────────────────────────
 * Does NOT import thirdweb at module level to avoid crashing the app.
 * All thirdweb usage is deferred to when it's actually needed.
 */
import { isProduction, THIRDWEB_CLIENT_ID } from './env';

export const BASE_CHAIN_ID  = 8453;   // Base Mainnet
export const BASE_SEPOLIA_ID = 84532; // Base Sepolia (testnet)
export const ACTIVE_CHAIN_ID = BASE_SEPOLIA_ID;

/**
 * Lazily creates and caches the Thirdweb client.
 * Returns null in showcase mode or if Client ID is missing.
 */
let _clientCache = undefined;

export async function getThirdwebClient() {
    if (!isProduction || !THIRDWEB_CLIENT_ID) return null;
    if (_clientCache !== undefined) return _clientCache;

    try {
        const { createThirdwebClient } = await import('thirdweb');
        const { baseSepolia }          = await import('thirdweb/chains');
        _clientCache = {
            client: createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID }),
            chain:  baseSepolia,
        };
    } catch (err) {
        console.error('[BE4T] Thirdweb failed to initialise:', err.message);
        _clientCache = null;
    }

    return _clientCache;
}

// Sync accessor — only available after getThirdwebClient() has been awaited
export const thirdwebClient = null; // placeholder; use getThirdwebClient() instead
