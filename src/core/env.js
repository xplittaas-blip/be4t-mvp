/**
 * BE4T Environment Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * VITE_APP_MODE = 'showcase'   → demo mode (static data, no blockchain)
 * VITE_APP_MODE = 'production' → live mode (Supabase + Thirdweb/Base)
 */

/**
 * Read VITE_APP_MODE safely — works in both Vite and plain Node.
 * Falls back to 'showcase' if not set (safe for pitch deploys).
 */
function getAppMode() {
    try {
        const mode = import.meta?.env?.VITE_APP_MODE;
        return mode === 'production' ? 'production' : 'showcase';
    } catch {
        return 'showcase';
    }
}

export const APP_MODE    = getAppMode();
export const isShowcase  = APP_MODE !== 'production';
export const isProduction = APP_MODE === 'production';

/* Credentials — safe to read in both modes */
export const SUPABASE_URL      = (() => { try { return import.meta.env.VITE_SUPABASE_URL      || ''; } catch { return ''; } })();
export const SUPABASE_ANON_KEY = (() => { try { return import.meta.env.VITE_SUPABASE_ANON_KEY || ''; } catch { return ''; } })();
export const THIRDWEB_CLIENT_ID = (() => { try { return import.meta.env.VITE_THIRDWEB_CLIENT_ID || ''; } catch { return ''; } })();

export const BASE_CHAIN_ID = 8453;
export const ENV_LABEL = isProduction ? '⚡ LIVE' : '🎬 DEMO';

if (typeof window !== 'undefined') {
    console.info(`[BE4T] Mode: ${APP_MODE.toUpperCase()} ${ENV_LABEL}`);
}
