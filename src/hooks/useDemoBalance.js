/**
 * useDemoBalance — BE4T Ledger System (v7 — Hybrid Persistence)
 * ─────────────────────────────────────────────────────────────────────────────
 * Balance is anchored to a wallet address (0x...).
 *
 * Persistence Strategy (Layered):
 *   1. Supabase `user_assets` table — PRIMARY when isSupabaseReady + walletAddress
 *   2. localStorage                 — FALLBACK / CACHE (always written)
 *   3. In-memory state              — always reactive
 *
 * This means demo users who sign in with Google get REAL persistence:
 * their portfolio survives cache clears, incognito sessions, and device changes.
 *
 * Balance Formula (Atomic Ledger):
 *   INITIAL_BALANCE - SUM(COMPRA) + SUM(REFUND | VENTA_P2P | REGALIA)
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { isShowcase } from '../core/env';
import { supabase, isSupabaseReady } from '../core/xplit/supabaseClient';

const INITIAL_BALANCE   = 50_000;
const GLOBAL_LABEL_LEDGER = 'be4t_demo_label_ledger';
const SUPABASE_DEBOUNCE_MS = 1500; // Batch writes to Supabase

// ── Address normalization ─────────────────────────────────────────────────────
function normalizeAddr(addr) {
    if (!addr) return null;
    return addr.toLowerCase().replace(/^0x/, '');
}

function getKeys(walletAddress) {
    const key = normalizeAddr(walletAddress);
    if (!key) return { acquiredKey: null, historyKey: null };
    return {
        acquiredKey: `be4t_demo_acquired_${key}`,
        historyKey:  `be4t_demo_history_${key}`,
    };
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────
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

// ── Supabase persistence ──────────────────────────────────────────────────────
async function fetchFromSupabase(walletAddress) {
    if (!isSupabaseReady || !walletAddress) return null;
    try {
        const { data, error } = await supabase
            .from('user_assets')
            .select('portfolio, history')
            .eq('wallet_addr', walletAddress.toLowerCase())
            .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data || null;
    } catch (err) {
        console.warn('[BE4T] Supabase fetch skipped:', err.message);
        return null;
    }
}

async function saveToSupabase(walletAddress, portfolio, history) {
    if (!isSupabaseReady || !walletAddress) return;
    try {
        await supabase.from('user_assets').upsert(
            { wallet_addr: walletAddress.toLowerCase(), portfolio, history, updated_at: new Date().toISOString() },
            { onConflict: 'wallet_addr' }
        );
    } catch (err) {
        console.warn('[BE4T] Supabase write skipped:', err.message);
    }
}

// ── Main Hook ─────────────────────────────────────────────────────────────────
export function useDemoBalance(walletAddress = null) {
    const { acquiredKey, historyKey } = getKeys(walletAddress);

    // State — initialized from localStorage (instant, no flicker)
    const [acquiredMap, setAcquiredMap] = useState(() => loadJSON(acquiredKey, {}));
    const [history,     setHistory]     = useState(() => loadJSON(historyKey, []));
    const [labelLedger, setLabelLedger] = useState(() => loadJSON(GLOBAL_LABEL_LEDGER, { gross_capital: 0, reserve_inventory: 0 }));
    const [isLoaded,    setIsLoaded]    = useState(false); // true after Supabase load attempt

    // Debounce ref for batched Supabase writes
    const supabaseTimer = useRef(null);

    // ── Load from Supabase on wallet change (hydrate over localStorage) ────────
    useEffect(() => {
        if (!walletAddress) {
            setAcquiredMap({});
            setHistory([]);
            setIsLoaded(true);
            return;
        }

        // Immediately load from localStorage
        const { acquiredKey: ak, historyKey: hk } = getKeys(walletAddress);
        setAcquiredMap(loadJSON(ak, {}));
        setHistory(loadJSON(hk, []));

        // Then hydrate from Supabase (may have more up-to-date data)
        fetchFromSupabase(walletAddress).then(data => {
            if (data) {
                // Supabase wins if it has more history entries (more authoritative)
                const localHistory = loadJSON(hk, []);
                if (data.history && data.history.length >= localHistory.length) {
                    setHistory(data.history);
                    saveJSON(hk, data.history);
                }
                if (data.portfolio && Object.keys(data.portfolio).length >= Object.keys(loadJSON(ak, {})).length) {
                    setAcquiredMap(data.portfolio);
                    saveJSON(ak, data.portfolio);
                }
            }
            setIsLoaded(true);
        });
    }, [walletAddress]);

    // ── Persist changes: localStorage (instant) + Supabase (debounced) ─────────
    useEffect(() => {
        saveJSON(acquiredKey, acquiredMap);
        // Debounced Supabase write
        if (walletAddress && isLoaded) {
            clearTimeout(supabaseTimer.current);
            supabaseTimer.current = setTimeout(() => {
                saveToSupabase(walletAddress, acquiredMap, history);
            }, SUPABASE_DEBOUNCE_MS);
        }
    }, [acquiredKey, acquiredMap]);

    useEffect(() => {
        saveJSON(historyKey, history);
        if (walletAddress && isLoaded) {
            clearTimeout(supabaseTimer.current);
            supabaseTimer.current = setTimeout(() => {
                saveToSupabase(walletAddress, acquiredMap, history);
            }, SUPABASE_DEBOUNCE_MS);
        }
    }, [historyKey, history]);

    useEffect(() => {
        saveJSON(GLOBAL_LABEL_LEDGER, labelLedger);
    }, [labelLedger]);

    // Cleanup debounce on unmount
    useEffect(() => () => clearTimeout(supabaseTimer.current), []);

    // ── Atomic balance calculation ─────────────────────────────────────────────
    const balance = useMemo(() => {
        if (!walletAddress) return 0;
        let bal = INITIAL_BALANCE;
        for (const tx of history) {
            if (tx.type === 'COMPRA')                                      bal -= tx.amount;
            if (['REFUND', 'VENTA_P2P', 'REGALIA'].includes(tx.type))     bal += tx.amount;
        }
        return parseFloat(bal.toFixed(2));
    }, [walletAddress, history]);

    // ── acquire ───────────────────────────────────────────────────────────────
    const acquire = useCallback((songId, cost, fractions = 1, songMeta = {}) => {
        if (!isShowcase)    return { ok: false, reason: 'not-showcase' };
        if (!walletAddress) return { ok: false, reason: 'no-wallet' };
        if (cost <= 0)      return { ok: false, reason: 'invalid-cost' };
        if (balance < cost) return { ok: false, reason: 'insufficient', balance, needed: cost };

        const costFloat = parseFloat(cost.toFixed(2));

        setHistory(prev => [
            ...prev,
            { type: 'COMPRA', amount: costFloat, assetId: songId, assetName: songMeta.name || 'Canción', date: Date.now() },
        ]);

        setAcquiredMap(prev => {
            const ex = prev[songId] || {};
            return {
                ...prev,
                [songId]: {
                    ...ex,
                    fractions:     (ex.fractions || 0) + fractions,
                    cost:          parseFloat(((ex.cost || 0) + cost).toFixed(2)),
                    acquiredAt:    ex.acquiredAt || Date.now(),
                    lastAddedAt:   Date.now(),
                    isListed:      false,
                    name:          songMeta.name        || ex.name        || 'Canción',
                    artist:        songMeta.artist      || ex.artist      || 'Artista',
                    tokenPrice:    songMeta.tokenPrice  || ex.tokenPrice  || 0,
                    totalSupply:   songMeta.totalSupply || ex.totalSupply || 1000,
                    apy:           songMeta.apy         || ex.apy         || 12,
                    spotifyStreams: songMeta.spotifyStreams || ex.spotifyStreams || 0,
                    coverUrl:      songMeta.coverUrl    || ex.coverUrl    || null,
                },
            };
        });

        if (!String(songId).endsWith('-p2p')) {
            setLabelLedger(prev => ({
                ...prev,
                gross_capital: parseFloat((prev.gross_capital + costFloat).toFixed(2)),
            }));
        }

        return { ok: true, newBalance: parseFloat((balance - costFloat).toFixed(2)) };
    }, [balance, walletAddress]);

    // ── acquired ──────────────────────────────────────────────────────────────
    const acquired = useCallback((songId) => {
        const entry = acquiredMap[songId];
        return entry ? { acquired: true, ...entry } : false;
    }, [acquiredMap]);

    // ── reset ─────────────────────────────────────────────────────────────────
    const reset = useCallback(async () => {
        if (!walletAddress) return;
        setHistory([]);
        setAcquiredMap({});
        if (isSupabaseReady) {
            await supabase.from('user_assets')
                .update({ portfolio: {}, history: [] })
                .eq('wallet_addr', walletAddress.toLowerCase());
        }
    }, [walletAddress]);

    // ── instantExit ───────────────────────────────────────────────────────────
    const instantExit = useCallback((songId) => {
        setAcquiredMap(prev => {
            const entry = prev[songId];
            if (!entry || entry.isListed || entry.exited) return prev;

            const refund = parseFloat((entry.cost * 0.9).toFixed(2));

            setHistory(h => [
                ...h,
                { type: 'REFUND', amount: refund, assetId: songId, assetName: entry.name, date: Date.now() },
            ]);

            setLabelLedger(ledge => ({
                ...ledge,
                gross_capital:     Math.max(0, parseFloat((ledge.gross_capital - refund).toFixed(2))),
                reserve_inventory: ledge.reserve_inventory + entry.fractions,
            }));

            return { ...prev, [songId]: { ...entry, exited: true } };
        });
    }, [walletAddress]);

    // ── listOnMarket ──────────────────────────────────────────────────────────
    const listOnMarket = useCallback((songId, listPrice) => {
        setAcquiredMap(prev => {
            if (!prev[songId] || prev[songId].exited) return prev;
            return { ...prev, [songId]: { ...prev[songId], isListed: true, listPrice: parseFloat(listPrice) } };
        });
    }, []);

    // ── unlistFromMarket ──────────────────────────────────────────────────────
    const unlistFromMarket = useCallback((songId) => {
        setAcquiredMap(prev => {
            if (!prev[songId]) return prev;
            return { ...prev, [songId]: { ...prev[songId], isListed: false, listPrice: 0 } };
        });
    }, []);

    // ── portfolio (computed) ──────────────────────────────────────────────────
    const portfolio = useMemo(() => Object.entries(acquiredMap).map(([id, data]) => {
        const now          = Date.now();
        const secondsSince = (now - (data.acquiredAt || now)) / 1000;
        const apyDecimal   = (data.apy || 12) / 100;
        const cost         = data.cost || 0;
        const earnedToDate = (cost * apyDecimal / 31_536_000) * secondsSince;
        const ownershipPct = data.totalSupply > 0 ? (data.fractions / data.totalSupply) * 100 : 0;

        return {
            id,
            ...data,
            earnedToDate: parseFloat(earnedToDate.toFixed(4)),
            ownershipPct: parseFloat(ownershipPct.toFixed(4)),
        };
    }), [acquiredMap]);

    return {
        balance,
        acquiredMap,
        portfolio,
        history,
        labelLedger,
        acquire,
        acquired,
        reset,
        instantExit,
        listOnMarket,
        unlistFromMarket,
        hasBalance: (cost) => balance >= cost,
        // Identity
        walletAddress,
        isWalletConnected: !!walletAddress,
        // Persistence state (useful for UI indicators)
        isLoaded,
        isPersisted: isSupabaseReady && !!walletAddress,
        isDemo: isShowcase,
    };
}

export default useDemoBalance;
