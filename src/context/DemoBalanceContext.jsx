import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { isShowcase } from '../core/env';
import { supabase } from '../core/xplit/supabaseClient';

const DemoBalanceContext = createContext(null);

const INITIAL_BALANCE  = 50_000;
const GLOBAL_LEDGER_KEY = 'be4t_demo_label_ledger';
const DEMO_GUEST_KEY    = 'be4t_guest_preview';

// Helpers
function normalizeKey(id) {
    if (!id) return null;
    return id.toLowerCase().replace(/^0x/, '');
}
function lsKeys(id) {
    const k = normalizeKey(id);
    if (!k) return { acquiredKey: null, historyKey: null };
    return { acquiredKey: `be4t_demo_acquired_${k}`, historyKey: `be4t_demo_history_${k}` };
}
function loadJSON(key, fallback) {
    if (!key) return fallback;
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
}
function saveJSON(key, value) {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

async function dbLoad(userId) {
    if (!userId || userId === DEMO_GUEST_KEY) return null;
    try {
        const { data, error } = await supabase
            .from('user_assets')
            .select('portfolio, history')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) {
            console.warn('[DemoBalanceContext] dbLoad error:', error.message);
            return null;
        }
        return data;
    } catch (e) {
        console.error('[DemoBalanceContext] dbLoad exception:', e);
        return null;
    }
}

async function dbSave(userId, walletAddr, portfolio, history) {
    if (!userId || userId === DEMO_GUEST_KEY) return;
    try {
        const payload = {
            user_id: userId,
            wallet_addr: walletAddr ? walletAddr.toLowerCase() : null,
            portfolio,
            history,
            updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('user_assets').upsert(payload, { onConflict: 'user_id' });
        if (error) console.warn('[DemoBalanceContext] dbSave error:', error.message);
    } catch (e) {
        console.error('[DemoBalanceContext] dbSave exception:', e);
    }
}

export function DemoBalanceProvider({ children, userId, walletAddress }) {
    const effectiveId = userId || (isShowcase ? DEMO_GUEST_KEY : null);
    const { acquiredKey, historyKey } = lsKeys(effectiveId);

    const [isLoading, setIsLoading] = useState(true);
    const [isPersisted, setIsPersisted] = useState(false);
    const [acquiredMap, setAcquiredMap] = useState({});
    const [history, setHistory] = useState([]);
    const [labelLedger, setLabelLedger] = useState(() => loadJSON(GLOBAL_LEDGER_KEY, { gross_capital: 0, reserve_inventory: 0 }));

    // Use a ref to store current state for immediate sync without closure staleness
    const stateRef = useRef({ acquiredMap: {}, history: [] });

    // Sync ref with state
    useEffect(() => {
        stateRef.current = { acquiredMap, history };
    }, [acquiredMap, history]);

    // ── LOAD Identity ──────────────────────────────────────────────────────────
    useEffect(() => {
        let isCancelled = false;
        setIsLoading(true);

        if (!effectiveId) {
            setAcquiredMap({});
            setHistory([]);
            setIsPersisted(false);
            setIsLoading(false);
            return;
        }

        // 1. Instant local load
        const ak = lsKeys(effectiveId).acquiredKey;
        const hk = lsKeys(effectiveId).historyKey;
        const localA = loadJSON(ak, {});
        const localH = loadJSON(hk, []);
        
        setAcquiredMap(localA);
        setHistory(localH);

        if (effectiveId === DEMO_GUEST_KEY) {
            setIsPersisted(false);
            setIsLoading(false);
            return;
        }

        // 2. Authoritative DB load
        dbLoad(userId).then(remote => {
            if (isCancelled) return;
            if (!remote) {
                console.info('[DemoBalanceContext] No remote data for user:', userId);
                setIsLoading(false);
                return;
            }
            
            const dbA = remote.portfolio || {};
            const dbH = remote.history || [];
            
            // Merge: whichever has more history wins
            const finalA = Object.keys(dbA).length >= Object.keys(localA).length ? dbA : localA;
            const finalH = dbH.length >= localH.length ? dbH : localH;

            setAcquiredMap(finalA);
            setHistory(finalH);
            saveJSON(ak, finalA);
            saveJSON(hk, finalH);
            setIsPersisted(true);
            setIsLoading(false);
            console.info('[DemoBalanceContext] Synced with DB for user:', userId);
        });

        return () => { isCancelled = true; };
    }, [effectiveId, userId]);

    // ── LocalStorage auto-sync ───────────────────────────────────────────────
    useEffect(() => {
        if (!effectiveId) return;
        const { acquiredKey: ak, historyKey: hk } = lsKeys(effectiveId);
        saveJSON(ak, acquiredMap);
        saveJSON(hk, history);
    }, [acquiredMap, history, effectiveId]);

    const balance = useMemo(() => {
        if (!effectiveId) return 0;
        let bal = INITIAL_BALANCE;
        for (const tx of history) {
            if (tx.type === 'COMPRA') bal -= tx.amount;
            if (['REFUND', 'VENTA_P2P', 'REGALIA'].includes(tx.type)) bal += tx.amount;
        }
        return parseFloat(bal.toFixed(2));
    }, [effectiveId, history]);

    const persistNow = useCallback(async (newA, newH) => {
        if (!userId || userId === DEMO_GUEST_KEY) return;
        await dbSave(userId, walletAddress, newA, newH);
        setIsPersisted(true);
    }, [userId, walletAddress]);

    const acquire = useCallback((songId, cost, fractions = 1, songMeta = {}) => {
        const costFloat = parseFloat(cost.toFixed(2));
        if (balance < costFloat) return { ok: false, reason: 'insufficient' };

        const newTx = {
            type: 'COMPRA',
            amount: costFloat,
            assetId: songId,
            assetName: songMeta.name || 'Canción',
            date: Date.now()
        };

        // We use functional updates and local variables to ensure persistence gets the exact right data
        setHistory(prevH => {
            const nextH = [...prevH, newTx];
            setAcquiredMap(prevA => {
                const ex = prevA[songId] || {};
                const nextA = {
                    ...prevA,
                    [songId]: {
                        ...ex,
                        fractions: (ex.fractions || 0) + fractions,
                        cost: parseFloat(((ex.cost || 0) + costFloat).toFixed(2)),
                        acquiredAt: ex.acquiredAt || Date.now(),
                        name: songMeta.name || ex.name || 'Canción',
                        artist: songMeta.artist || ex.artist || 'Artista',
                        apy: songMeta.apy || ex.apy || 12,
                        coverUrl: songMeta.coverUrl || ex.coverUrl || null,
                    }
                };
                // Immediate DB sync
                persistNow(nextA, nextH);
                return nextA;
            });
            return nextH;
        });

        return { ok: true, newBalance: parseFloat((balance - costFloat).toFixed(2)) };
    }, [balance, persistNow]);

    const portfolio = useMemo(() => Object.entries(acquiredMap).map(([id, data]) => {
        const secondsSince = (Date.now() - (data.acquiredAt || Date.now())) / 1000;
        const earned = (data.cost * (data.apy / 100) / 31536000) * secondsSince;
        return {
            id,
            ...data,
            earnedToDate: parseFloat(earned.toFixed(4)),
        };
    }), [acquiredMap]);

    const value = {
        balance,
        portfolio,
        history,
        acquire,
        isLoading,
        isPersisted,
        reset: () => {
            setAcquiredMap({});
            setHistory([]);
            if (userId) dbSave(userId, walletAddress, {}, []);
        },
        acquired: (songId) => acquiredMap[songId] ? { acquired: true, ...acquiredMap[songId] } : false
    };

    return <DemoBalanceContext.Provider value={value}>{children}</DemoBalanceContext.Provider>;
}

export const useDemoBalanceGlobal = () => {
    const context = useContext(DemoBalanceContext);
    if (!context) throw new Error('useDemoBalanceGlobal must be used within a DemoBalanceProvider');
    return context;
};
