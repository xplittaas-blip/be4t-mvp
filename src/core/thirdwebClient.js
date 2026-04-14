/**
 * BE4T — Thirdweb Client Singleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the Thirdweb client instance.
 * Import `client` from here instead of calling createThirdwebClient() per-file.
 *
 * Safe in both showcase and production modes:
 *   - In showcase: client is created but wallet features are not triggered
 *   - In production: used for ConnectButton, PayEmbed, transactions
 */
import { createThirdwebClient } from 'thirdweb';
import { THIRDWEB_CLIENT_ID } from './env';

export const client = createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID || 'e96be70a9e07ba78c44a7eb82ae58d59',
});

export default client;
