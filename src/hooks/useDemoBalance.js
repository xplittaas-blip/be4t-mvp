/**
 * useDemoBalance — BE4T Ledger System (v6 — Wallet-Anchored)
 * ─────────────────────────────────────────────────────────────────────────────
 * Balance is now anchored to a wallet address (0x...) instead of a Supabase UUID.
 * This enables true Web3 identity — same wallet, same balance, any device.
 *
 * Identity hierarchy:
 *   walletAddress (0x...)  ← PRIMARY (from Thirdweb inAppWallet)
 *   userId (UUID)          ← FALLBACK only if walletAddress is null (legacy)
 *
 * API:
 *   const { balance, acquire, acquired, portfolio, history, reset } = useDemoBalance(walletAddress);
 *
 * Balance Formula (Atomic Ledger):
 *   INITIAL_BALANCE - SUM(COMPRA) + SUM(REFUND | VENTA_P2P | REGALIA)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { isShowcase } from '../core/env';

const INITIAL_BALANCE = 50_000;
const GLOBAL_LABEL_LEDGER = 'be4t_demo_label_ledger';

// ── Storage key derivation ────────────────────────────────────────────────────
// Normalize key: strip '0x' prefix, lowercase for consistency
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
    if (!key || !isShowcase) return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Main Hook ─────────────────────────────────────────────────────────────────
export function useDemoBalance(walletAddress = null) {
    const { acquiredKey, historyKey } = getKeys(walletAddress);

    // ── State ──
    const [acquiredMap, setAcquiredMap] = useState(() => loadJSON(acquiredKey, {}));
    const [history,     setHistory]     = useState(() => loadJSON(historyKey, []));
    const [labelLedger, setLabelLedger] = useState(() => loadJSON(GLOBAL_LABEL_LEDGER, { gross_capital: 0, reserve_inventory: 0 }));

    // ── Re-sync when wallet changes ───────────────────────────────────────────
    useEffect(() => {
        if (!walletAddress) {
            setAcquiredMap({});
            setHistory([]);
            return;
        }
        const { acquiredKey: ak, historyKey: hk } = getKeys(walletAddress);
        setAcquiredMap(loadJSON(ak, {}));
        setHistory(loadJSON(hk, []));
    }, [walletAddress]);

    // ── Persist on change ─────────────────────────────────────────────────────
    useEffect(() => { saveJSON(acquiredKey, acquiredMap); }, [acquiredKey, acquiredMap]);
    useEffect(() => { saveJSON(historyKey, history); },     [historyKey, history]);
    useEffect(() => { saveJSON(GLOBAL_LABEL_LEDGER, labelLedger); }, [labelLedger]);

    // ── Atomic balance calculation (the Ledger) ───────────────────────────────
    const balance = useMemo(() => {
        if (!walletAddress) return 0; // No wallet = no balance shown
        let bal = INITIAL_BALANCE;
        for (const tx of history) {
            if (tx.type === 'COMPRA')                             bal -= tx.amount;
            if (['REFUND', 'VENTA_P2P', 'REGALIA'].includes(tx.type)) bal += tx.amount;
        }
        return parseFloat(bal.toFixed(2));
    }, [walletAddress, history]);

    // ── acquire ───────────────────────────────────────────────────────────────
    const acquire = useCallback((songId, cost, fractions = 1, songMeta = {}) => {
        if (!isShowcase)      return { ok: false, reason: 'not-showcase' };
        if (!walletAddress)   return { ok: false, reason: 'no-wallet' };
        if (cost <= 0)        return { ok: false, reason: 'invalid-cost' };
        if (balance < cost)   return { ok: false, reason: 'insufficient', balance, needed: cost };

        const costFloat = parseFloat(cost.toFixed(2));

        // 1. Log transaction
        setHistory(prev => [
            ...prev,
            {
                type:      'COMPRA',
                amount:    costFloat,
                assetId:   songId,
                assetName: songMeta.name || 'Canción',
                date:      Date.now(),
            },
        ]);

        // 2. Update portfolio map
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

        // 3. Label ledger (primary market only)
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
    const reset = useCallback(() => {
        if (!walletAddress) return;
        setHistory([]);
        setAcquiredMap({});
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
        isDemo: isShowcase,
        // Identity info
        walletAddress,
        isWalletConnected: !!walletAddress,
    };
}

export default useDemoBalance;
