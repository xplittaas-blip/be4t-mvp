/**
 * BE4T Environment Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * APP_MODE is resolved at BUILD TIME by vite.config.js → define: { __APP_MODE__ }
 *
 * Resolution order (in vite.config.js):
 *   1. VITE_APP_MODE env var (from Vercel dashboard or .env file)
 *   2. Vite --mode flag     ('production' → 'production', else 'showcase')
 *   3. Fallback             → 'showcase' (safe for demos / pitch)
 */

function resolveMode() {
    // __APP_MODE__ is a build-time constant injected by vite.config.js define
    // eslint-disable-next-line no-undef
    if (typeof __APP_MODE__ !== 'undefined') return String(__APP_MODE__).trim();

    // Fallback: read at runtime (dev server, SSR, test env)
    try {
        return (import.meta?.env?.VITE_APP_MODE || 'showcase').trim();
    } catch {
        return 'showcase';
    }
}

export const APP_MODE     = resolveMode();
export const isProduction  = APP_MODE === 'production';
export const isShowcase    = !isProduction;

export const SUPABASE_URL       = (() => { try { return import.meta.env.VITE_SUPABASE_URL      || ''; } catch { return ''; } })();
export const SUPABASE_ANON_KEY  = (() => { try { return import.meta.env.VITE_SUPABASE_ANON_KEY  || ''; } catch { return ''; } })();
export const THIRDWEB_CLIENT_ID = (() => { try { return import.meta.env.VITE_THIRDWEB_CLIENT_ID || ''; } catch { return ''; } })();

export const BASE_CHAIN_ID  = 8453;
export const ENV_LABEL      = isProduction ? '⚡ LIVE' : '🎬 DEMO';

if (typeof window !== 'undefined') {
    console.info(`[BE4T] Mode: ${APP_MODE.toUpperCase()} | ${ENV_LABEL}`);
}
