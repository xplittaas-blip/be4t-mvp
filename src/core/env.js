/**
 * BE4T Environment Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * VITE_APP_MODE = 'showcase'   → demo mode (static data, no blockchain)
 * VITE_APP_MODE = 'production' → live mode (Supabase + Thirdweb/Base)
 *
 * Usage anywhere in the app:
 *   import { APP_MODE, isShowcase, isProduction } from '@/core/env';
 */

export const APP_MODE = import.meta.env.VITE_APP_MODE || 'showcase';

export const isShowcase   = APP_MODE === 'showcase';
export const isProduction = APP_MODE === 'production';

// Supabase — only meaningful in production
export const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Thirdweb / Base network (production)
export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || '';
export const BASE_CHAIN_ID      = 8453; // Ethereum L2 — Base Mainnet

// Handy label for UI badges / console logs
export const ENV_LABEL = isProduction ? '⚡ LIVE' : '🎬 DEMO';

if (import.meta.env.DEV) {
    console.info(`[BE4T] App mode: ${APP_MODE.toUpperCase()} ${ENV_LABEL}`);
}
