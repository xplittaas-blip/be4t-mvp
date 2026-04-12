/**
 * useUserRole — fetches the current user's role from Supabase profiles
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns: { role, isAdmin, isInvestor, loading }
 *
 * - In showcase mode: returns role='investor', isAdmin=false (safe default)
 * - In production: calls get_my_role() RPC for efficiency (single round-trip)
 * - Caches role in memory while session is active
 *
 * Usage:
 *   const { isAdmin, role, loading } = useUserRole(session);
 */
import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseReady } from '../core/xplit/supabaseClient';

// Admin email override — works even if the DB isn't set up yet
const ADMIN_EMAILS = [
    'juan@be4t.io',
    'admin@be4t.io',
    'xplittaas@gmail.com',
];

export function useUserRole(session) {
    const [role,    setRole]    = useState(null);
    const [loading, setLoading] = useState(false);
    const prevUid = useRef(null);

    useEffect(() => {
        const uid = session?.user?.id;

        // Reset when session changes
        if (uid !== prevUid.current) {
            prevUid.current = uid;
            setRole(null);
        }

        if (!uid) {
            setRole(null);
            return;
        }

        // Email-based admin override (works without Supabase profiles)
        const email = (session.user.email || '').toLowerCase();
        if (ADMIN_EMAILS.includes(email)) {
            setRole('admin');
            return;
        }

        // In showcase mode or if Supabase isn't configured, default to investor
        if (!isSupabaseReady) {
            setRole('investor');
            return;
        }

        // Fetch from Supabase via RPC (fastest: single round-trip, no JOIN)
        let cancelled = false;
        setLoading(true);

        supabase
            .rpc('get_my_role')
            .then(({ data, error }) => {
                if (cancelled) return;
                if (error) {
                    console.warn('[BE4T] get_my_role failed, defaulting to investor:', error.message);
                    setRole('investor');
                } else {
                    setRole(data || 'investor');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [session?.user?.id]);

    const resolvedRole = role || 'investor';

    return {
        role:       resolvedRole,
        isAdmin:    resolvedRole === 'admin',
        isInvestor: resolvedRole === 'investor',
        loading,
    };
}
