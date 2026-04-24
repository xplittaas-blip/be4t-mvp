import { createClient } from '@supabase/supabase-js';
import { isShowcase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../env';

// Credentials check — must have both URL and key to connect
const isMissingCreds = !SUPABASE_URL || !SUPABASE_ANON_KEY;

// HYBRID MODE:
// In showcase, we still connect to Supabase if credentials are present.
// This enables real persistence for demo users (their portfolio survives cache clears).
// Only falls back to placeholder when credentials are truly missing.
if (isShowcase && !isMissingCreds) {
    console.info('[BE4T] Showcase + Supabase — hybrid persistence enabled.');
} else if (isShowcase && isMissingCreds) {
    console.info('[BE4T] Showcase mode — localStorage only (no Supabase credentials).');
} else if (!isShowcase && isMissingCreds) {
    console.warn('[BE4T] Production mode but Supabase credentials missing — check .env');
}

// Use real Supabase client whenever credentials are available (showcase OR production)
export const supabase = isMissingCreds
    ? createClient('https://placeholder.supabase.co', 'placeholder-anon-key')
    : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// isSupabaseReady: true when a real Supabase connection exists
export const isSupabaseReady = !isMissingCreds;
