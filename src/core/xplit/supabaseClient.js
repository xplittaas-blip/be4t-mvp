import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Graceful degradation — app works in demo mode without Supabase
const isMissingCreds = !supabaseUrl || !supabaseAnonKey;
if (isMissingCreds) {
    console.warn('[BE4T] Supabase credentials not configured — running in demo mode (read-only).');
}

export const supabase = isMissingCreds
    ? createClient('https://placeholder.supabase.co', 'placeholder-anon-key')
    : createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseReady = !isMissingCreds;
