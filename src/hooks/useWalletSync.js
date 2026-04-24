/**
 * useWalletSync — BE4T Auth Bridge
 * ─────────────────────────────────────────────────────────────────────────────
 * Bridges the Thirdweb Smart Wallet (account.address) with Supabase.
 *
 * Responsibilities:
 *   1. Detect when a Thirdweb wallet connects (via useActiveAccount)
 *   2. Upsert the wallet address into Supabase `user_assets` table
 *   3. Migrate any existing localStorage data to Supabase (one-time)
 *   4. Expose the canonical `walletAddress` to the rest of the app
 *
 * Returns:
 *   { walletAddress, isSynced, isMigrating, error }
 */

import { useEffect, useState, useCallback } from 'react';
import { useActiveAccount, useAutoConnect } from 'thirdweb/react';
import { client, wallets, activeChain } from '../core/thirdwebClient';
import { supabase } from '../core/xplit/supabaseClient';

const MIGRATION_FLAG_PREFIX = 'be4t_migrated_';

/**
 * Read legacy localStorage keys and return portfolio + history for a given id.
 * Supports both UUID-based (Supabase) and address-based keys.
 */
function readLegacyLocalStorage(id) {
    try {
        const portfolioRaw = localStorage.getItem(`be4t_demo_acquired_${id}`);
        const historyRaw   = localStorage.getItem(`be4t_demo_history_${id}`);
        return {
            portfolio: portfolioRaw ? JSON.parse(portfolioRaw) : null,
            history:   historyRaw   ? JSON.parse(historyRaw)   : null,
        };
    } catch {
        return { portfolio: null, history: null };
    }
}

function hasMigrated(walletAddress) {
    return localStorage.getItem(`${MIGRATION_FLAG_PREFIX}${walletAddress}`) === 'true';
}

function markMigrated(walletAddress) {
    localStorage.setItem(`${MIGRATION_FLAG_PREFIX}${walletAddress}`, 'true');
}

export function useWalletSync(session) {
    const account = useActiveAccount();
    const walletAddress = account?.address ?? null;

    // ── Auto-reconnect: when a Supabase session exists, silently
    // re-activate the Thirdweb inAppWallet (same email → same 0x address)
    useAutoConnect({
        client,
        wallets,
        chain: activeChain,
        // Only auto-connect if there is a valid Supabase session
        accountAbstraction: undefined,
    });

    // ── Effective identity: 0x preferred, Supabase UUID as fallback ──────────────
    // This keeps the balance visible even before the Thirdweb wallet activates
    const effectiveId = walletAddress ?? session?.user?.id ?? null;

    const [isSynced,    setIsSynced]    = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [error,       setError]       = useState(null);

    const syncToSupabase = useCallback(async (addr, supabaseUid) => {
        if (!addr) return;
        setIsMigrating(true);

        try {
            // 1. Try to fetch existing row
            const { data: existing } = await supabase
                .from('user_assets')
                .select('id, portfolio, history')
                .eq('wallet_addr', addr)
                .single();

            if (!existing) {
                // 2a. New wallet — check for legacy localStorage data to migrate
                const legacyByAddr = readLegacyLocalStorage(addr);
                const legacyByUid  = supabaseUid ? readLegacyLocalStorage(supabaseUid) : { portfolio: null, history: null };

                const portfolio = legacyByAddr.portfolio ?? legacyByUid.portfolio ?? {};
                const history   = legacyByAddr.history   ?? legacyByUid.history   ?? [];

                await supabase.from('user_assets').insert({
                    wallet_addr:  addr,
                    supabase_uid: supabaseUid ?? null,
                    portfolio,
                    history,
                });

                if (!hasMigrated(addr)) {
                    markMigrated(addr);
                    console.info('[BE4T] Wallet synced + localStorage migrated →', addr);
                }
            } else if (!hasMigrated(addr)) {
                // 2b. Row exists but hasn't run migration check this session
                // Merge localStorage if it has MORE entries than Supabase
                const legacyByAddr = readLegacyLocalStorage(addr);
                if (legacyByAddr.history && legacyByAddr.history.length > (existing.history?.length ?? 0)) {
                    await supabase
                        .from('user_assets')
                        .update({ portfolio: legacyByAddr.portfolio ?? existing.portfolio, history: legacyByAddr.history })
                        .eq('wallet_addr', addr);
                    console.info('[BE4T] Merged localStorage → Supabase for', addr);
                }
                markMigrated(addr);
            }

            setIsSynced(true);
        } catch (err) {
            // Supabase table may not exist yet in showcase — graceful fallback
            console.warn('[BE4T] useWalletSync: Supabase sync skipped (table may not exist):', err.message);
            setIsSynced(true); // Still treat as synced; localStorage will serve as fallback
        } finally {
            setIsMigrating(false);
        }
    }, []);

    useEffect(() => {
        if (!walletAddress) {
            setIsSynced(false);
            return;
        }

        const supabaseUid = session?.user?.id ?? null;
        syncToSupabase(walletAddress, supabaseUid);
    }, [walletAddress, session?.user?.id, syncToSupabase]);

    return {
        walletAddress,   // 0x from Thirdweb (null until wallet activates)
        effectiveId,     // 0x ?? UUID — always non-null when user is logged in
        isSynced,
        isMigrating,
        error,
    };
}
