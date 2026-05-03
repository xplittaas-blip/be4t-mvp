/**
 * useMailchimpSubscribe — BE4T Onboarding Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the full onboarding submission flow:
 *   1. POST → /api/subscribe (Mailchimp)
 *   2. On 200: UPDATE profiles.onboarding_completed = true in Supabase
 *   3. Returns { subscribe, loading, error, success }
 *
 * Usage:
 *   const { subscribe, loading, error, success } = useMailchimpSubscribe();
 *   await subscribe({ email, fname, country, music_genre, investment_range });
 */

import { useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../core/env';

// Lazy-create Supabase client only when needed (avoids import cycle)
let _supabase = null;
async function getSupabase() {
    if (_supabase) return _supabase;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    const { createClient } = await import('@supabase/supabase-js');
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
}

/**
 * @typedef  {Object} SubscribePayload
 * @property {string}  email             — Required
 * @property {string}  [fname]           — First name or wallet fragment
 * @property {string}  [country]         — e.g. "España"
 * @property {string}  [music_genre]     — e.g. "Reggaetón"
 * @property {string}  [investment_range] — e.g. "$100-$500"
 * @property {string}  [source]          — "be4t-mvp" | "charged-satellite"
 * @property {string[]} [tags]           — Extra Mailchimp tags
 * @property {string}  [supabaseUserId]  — auth.users.id for Supabase update
 */

export function useMailchimpSubscribe() {
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);
    const [success, setSuccess]   = useState(false);

    /**
     * @param {SubscribePayload} payload
     * @returns {Promise<{ ok: boolean, subscribed?: boolean, warning?: string }>}
     */
    const subscribe = async (payload) => {
        setLoading(true);
        setError(null);

        const {
            email,
            fname            = '',
            country          = '',
            music_genre      = '',
            investment_range = '',
            source           = typeof window !== 'undefined' ? window.location.hostname : 'be4t',
            tags             = [],
            supabaseUserId   = null,
        } = payload;

        // ── 1. Call /api/subscribe ────────────────────────────────────────────
        let result = { ok: false };
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    fname,
                    country,
                    music_genre,
                    investment_range,
                    source,
                    tags,
                }),
            });

            result = await res.json();

            if (!result.ok) {
                // Endpoint returned an actual error (4xx/5xx) — soft-fail
                console.warn('[BE4T] subscribe warning:', result);
            }
        } catch (fetchErr) {
            // Network failure — do NOT block user, just log
            console.error('[BE4T] /api/subscribe network error:', fetchErr.message);
            result = { ok: true, warning: 'Network error — subscription skipped' };
        }

        // ── 2. Update Supabase onboarding_completed ───────────────────────────
        // This runs regardless of Mailchimp result (non-blocking marketing step)
        if (supabaseUserId) {
            try {
                const sb = await getSupabase();
                if (sb) {
                    const { error: sbErr } = await sb
                        .from('profiles')
                        .update({
                            onboarding_completed: true,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', supabaseUserId);

                    if (sbErr) {
                        console.warn('[BE4T] Supabase onboarding update failed:', sbErr.message);
                    } else {
                        console.info('[BE4T] ✓ onboarding_completed = true for', supabaseUserId);
                    }
                }
            } catch (sbErr) {
                console.warn('[BE4T] Supabase update skipped:', sbErr.message);
            }
        }

        // ── 3. Finalize ───────────────────────────────────────────────────────
        setLoading(false);
        setSuccess(true);
        return result;
    };

    return { subscribe, loading, error, success };
}

export default useMailchimpSubscribe;
