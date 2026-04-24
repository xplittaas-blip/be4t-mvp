/**
 * useDemoBalance — BE4T Ghost Balance System (v5-Ledger)
 * ─────────────────────────────────────────────────────────────────────────────
 * Atomic ledger based simulation. Balance is calculated dynamically from an 
 * append-only transaction history rather than a static Number.
 * 
 * Supports user-isolation via `userId`.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { isShowcase } from '../core/env';

const INITIAL_BALANCE = 50_000;

export function useDemoBalance(userId = null) {
    const GLOBAL_LABEL_LEDGER  = `be4t_demo_label_ledger`;
    const getAcquiredKey = () => userId ? `be4t_demo_acquired_${userId}` : null;
    const getHistoryKey  = () => userId ? `be4t_demo_history_${userId}`  : null;

    // ── Loaders ──
    const [acquiredMap, setAcquiredMap] = useState(() => {
        if (!userId) return {};
        try {
            const v = localStorage.getItem(getAcquiredKey());
            return v ? JSON.parse(v) : {};
        } catch { return {}; }
    });

    const [history, setHistory] = useState(() => {
        if (!userId) return [];
        try {
            const v = localStorage.getItem(getHistoryKey());
            return v ? JSON.parse(v) : [];
        } catch { return []; }
    });

    const [labelLedger, setLabelLedger] = useState(() => {
        try {
            const v = localStorage.getItem(GLOBAL_LABEL_LEDGER);
            return v ? JSON.parse(v) : { gross_capital: 0, reserve_inventory: 0 };
        } catch {
            return { gross_capital: 0, reserve_inventory: 0 };
        }
    });

    // ── Re-sync on userId change ──
    useEffect(() => {
        if (!userId) {
            setAcquiredMap({});
            setHistory([]);
            return;
        }
        try {
            const acq = localStorage.getItem(getAcquiredKey());
            const hist = localStorage.getItem(getHistoryKey());
            setAcquiredMap(acq ? JSON.parse(acq) : {});
            setHistory(hist ? JSON.parse(hist) : []);
        } catch {}
    }, [userId]);

    // ── Persist ──
    useEffect(() => {
        if (!isShowcase || !userId) return;
        localStorage.setItem(getAcquiredKey(), JSON.stringify(acquiredMap));
    }, [acquiredMap, userId]);

    useEffect(() => {
        if (!isShowcase || !userId) return;
        localStorage.setItem(getHistoryKey(), JSON.stringify(history));
    }, [history, userId]);

    useEffect(() => {
        if (!isShowcase) return;
        localStorage.setItem(GLOBAL_LABEL_LEDGER, JSON.stringify(labelLedger));
    }, [labelLedger]);

    // ── Ledger Calculation ──
    const balance = useMemo(() => {
        if (!userId) return 0; // Require login
        
        let bal = INITIAL_BALANCE;
        for (const tx of history) {
            if (tx.type === 'COMPRA') bal -= tx.amount;
            if (tx.type === 'VENTA_P2P' || tx.type === 'REFUND') bal += tx.amount;
            if (tx.type === 'REGALIA') bal += tx.amount;
        }
        return parseFloat(bal.toFixed(2));
    }, [userId, history]);

    /**
     * acquire (Buy from Primary or Secondary Market)
     */
    const acquire = useCallback((songId, cost, fractions = 1, songMeta = {}) => {
        if (!isShowcase) return { ok: false, reason: 'not-showcase' };
        if (!userId) return { ok: false, reason: 'not-authenticated' };
        if (cost <= 0) return { ok: false, reason: 'invalid-cost' };

        if (balance < cost) {
            return { ok: false, reason: 'insufficient', balance, needed: cost };
        }

        const costFloat = parseFloat(cost.toFixed(2));

        // 1. History Log
        setHistory(prev => [
            ...prev,
            { type: 'COMPRA', amount: costFloat, assetId: songId, assetName: songMeta.name || 'Canción', date: Date.now() }
        ]);

        // 2. Acquired Map
        setAcquiredMap(prev => {
            const existing = prev[songId] || {};
            return {
                ...prev,
                [songId]: {
                    ...existing,
                    fractions:    (existing.fractions || 0) + fractions,
                    cost:         parseFloat(((existing.cost || 0) + cost).toFixed(2)),
                    acquiredAt:   existing.acquiredAt || Date.now(),
                    lastAddedAt:  Date.now(),
                    isListed:     false,
                    name:         songMeta.name || existing.name || 'Canción',
                    artist:       songMeta.artist || existing.artist || 'Artista',
                    tokenPrice:   songMeta.tokenPrice || existing.tokenPrice || 0,
                    totalSupply:  songMeta.totalSupply || existing.totalSupply || 1000,
                    apy:          songMeta.apy || existing.apy || 12,
                    spotifyStreams: songMeta.spotifyStreams || existing.spotifyStreams || 0,
                    coverUrl:     songMeta.coverUrl || existing.coverUrl || null,
                },
            };
        });

        // 3. Update Label Ledger
        if (!String(songId).endsWith('-p2p')) {
            setLabelLedger(prev => ({
                ...prev,
                gross_capital: parseFloat((prev.gross_capital + costFloat).toFixed(2))
            }));
        }

        return { ok: true, newBalance: parseFloat((balance - costFloat).toFixed(2)) };
    }, [balance, userId]);

    const acquired = useCallback((songId) => {
        const entry = acquiredMap[songId];
        return entry ? { acquired: true, ...entry } : false;
    }, [acquiredMap]);

    const reset = useCallback(() => {
        if (!userId) return;
        setHistory([]);
        setAcquiredMap({});
        // We leave Label Ledger intact or reset it? Let's leave it for global demo.
    }, [userId]);

    /** Sell back immediately to Label at a 10% discount */
    const instantExit = useCallback((songId) => {
        setAcquiredMap(prev => {
            const entry = prev[songId];
            if (!entry || entry.isListed || entry.exited) return prev;
            
            const refund = parseFloat((entry.cost * 0.9).toFixed(2));
            
            // 1. History Log
            setHistory(h => [
                ...h,
                { type: 'REFUND', amount: refund, assetId: songId, assetName: entry.name, date: Date.now() }
            ]);
            
            // 2. Label Ledger
            setLabelLedger(ledge => ({
                ...ledge,
                gross_capital: Math.max(0, parseFloat((ledge.gross_capital - refund).toFixed(2))),
                reserve_inventory: ledge.reserve_inventory + entry.fractions
            }));

            return {
                ...prev,
                [songId]: { ...entry, exited: true }
            };
        });
    }, [userId]);

    /** List token on P2P market */
    const listOnMarket = useCallback((songId, listPrice) => {
        setAcquiredMap(prev => {
            if (!prev[songId] || prev[songId].exited) return prev;
            return {
                ...prev,
                [songId]: { ...prev[songId], isListed: true, listPrice: parseFloat(listPrice) }
            };
        });
    }, []);

    /** Cancel P2P listing */
    const unlistFromMarket = useCallback((songId) => {
        setAcquiredMap(prev => {
            if (!prev[songId]) return prev;
            return {
                ...prev,
                [songId]: { ...prev[songId], isListed: false, listPrice: 0 }
            };
        });
    }, []);

    /** List all acquired songs with real-time ROI */
    const portfolio = Object.entries(acquiredMap).map(([id, data]) => {
        const now = Date.now();
        const secondsSince = (now - (data.acquiredAt || now)) / 1000;
        const apyDecimal   = (data.apy || 12) / 100;
        const cost         = data.cost || 0;
        
        const earnedToDate = (cost * apyDecimal / 31536000) * secondsSince;
        const ownershipPct = (data.totalSupply > 0)
            ? (data.fractions / data.totalSupply) * 100
            : 0;

        return {
            id,
            ...data,
            earnedToDate: parseFloat(earnedToDate.toFixed(4)),
            ownershipPct: parseFloat(ownershipPct.toFixed(4)),
        };
    });

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
        isDemo: isShowcase,
    };
}

export default useDemoBalance;
