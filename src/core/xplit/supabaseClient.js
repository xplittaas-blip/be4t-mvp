import { createClient } from '@supabase/supabase-js';
import { isShowcase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../env';

// In showcase mode we skip Supabase entirely — no network calls, no errors
const isMissingCreds = !SUPABASE_URL || !SUPABASE_ANON_KEY;

if (isShowcase) {
    console.info('[BE4T] Showcase mode — Supabase disabled, using static asset data.');
} else if (isMissingCreds) {
    console.warn('[BE4T] Production mode but Supabase credentials missing — check .env');
}

// In showcase mode we still export a client (thin placeholder) so imports don't break,
// but it will never be called for real data in showcase.
export const supabase = (isShowcase || isMissingCreds)
    ? createClient('https://placeholder.supabase.co', 'placeholder-anon-key')
    : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseReady = !isShowcase && !isMissingCreds;
