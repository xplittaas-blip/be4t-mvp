/**
 * BE4T Web3 Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Thirdweb v5 SDK — only initialised in production mode.
 * In showcase mode: all exports are null-safe stubs.
 */
import { createThirdwebClient } from 'thirdweb';
import { base, baseSepolia } from 'thirdweb/chains';
import { isProduction, THIRDWEB_CLIENT_ID } from './env';

// ── Client singleton ──────────────────────────────────────────────────────────
export const thirdwebClient = isProduction && THIRDWEB_CLIENT_ID
    ? createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID })
    : null;

// ── Target chain ──────────────────────────────────────────────────────────────
// Switch to `base` for mainnet once contracts are audited
export const ACTIVE_CHAIN = baseSepolia;

export { base, baseSepolia };
