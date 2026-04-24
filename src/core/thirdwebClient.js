/**
 * BE4T — Thirdweb Client Singleton (v2 — Global Provider Ready)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the Thirdweb client, wallets config, and chain.
 * Import these instead of re-constructing per-component.
 *
 * Usage:
 *   import { client, wallets, activeChain } from './core/thirdwebClient';
 */
import { createThirdwebClient } from 'thirdweb';
import { baseSepolia, base } from 'thirdweb/chains';
import { inAppWallet } from 'thirdweb/wallets';
import { THIRDWEB_CLIENT_ID, isProduction } from './env';

// ── Thirdweb Client ───────────────────────────────────────────────────────────
export const client = createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID || 'e96be70a9e07ba78c44a7eb82ae58d59',
});

// ── Chain: Base Sepolia for demo/testnet, Base Mainnet for production ─────────
export const activeChain = isProduction ? base : baseSepolia;

// ── Wallets: inAppWallet only (email + Google) — Account Abstraction ready ───
// inAppWallet creates an invisible Smart Account for the user.
// No seed phrase, no extension needed — pure Web2 UX.
export const wallets = [
    inAppWallet({
        auth: {
            options: ['google', 'email'],
        },
    }),
];

export default client;
