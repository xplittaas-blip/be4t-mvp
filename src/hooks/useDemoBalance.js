/**
 * useDemoBalance — BE4T Ghost Balance System
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a fictional $50,000 USD "demo credit" for the Pitch environment.
 * Persists to localStorage so the balance survives page reloads.
 *
 * API:
 *   const { balance, acquire, acquired, portfolio, reset } = useDemoBalance();
 *   acquire(songId, cost, fractions, songMeta) → deducts from balance, saves full record
 *   acquired(songId)       → returns the investment record or false
 *   portfolio              → array of all investments with ROI data
 *   reset()                → resets to $50,000 (for testing)
 *
 * Only meaningful in showcase mode — in production, returns production stubs.
 */

import { useState, useCallback, useEffect } from 'react';
import { isShowcase } from '../core/env';

const STORAGE_KEY   = 'be4t_demo_balance';
const ACQUIRED_KEY  = 'be4t_demo_acquired';
const LABEL_LEDGER  = 'be4t_demo_label_ledger';
const VERSION_KEY   = 'be4t_demo_version';
const CURRENT_VER   = 'v4-fintech'; // Bump for fintech ledger setup
const INITIAL_BALANCE = 50_000; // $50,000 USD — strategic simulation budget

// ── Migration: wipe stale data from older versions ────────────────────────────
function migrate() {
    try {
        const ver = localStorage.getItem(VERSION_KEY);
        if (ver !== CURRENT_VER) {
            // Old version: clear everything → fresh $50k
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(ACQUIRED_KEY);
            localStorage.removeItem(LABEL_LEDGER);
            localStorage.setItem(VERSION_KEY, CURRENT_VER);
        }
    } catch {}
}

function loadBalance() {
    try {
        migrate();
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === null) return INITIAL_BALANCE;
        const n = parseFloat(v);
        // Safety: if somehow a value ≤ 0 or not a number, reset
        return (isNaN(n) || n < 0) ? INITIAL_BALANCE : n;
    } catch {
        return INITIAL_BALANCE;
    }
}

function loadAcquired() {
    try {
        const v = localStorage.getItem(ACQUIRED_KEY);
        return v ? JSON.parse(v) : {};
    } catch {
        return {};
    }
}

function loadLabelLedger() {
    try {
        const v = localStorage.getItem(LABEL_LEDGER);
        return v ? JSON.parse(v) : { gross_capital: 0, reserve_inventory: 0 };
    } catch {
        return { gross_capital: 0, reserve_inventory: 0 };
    }
}


// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDemoBalance() {
    const [balance, setBalance] = useState(loadBalance);
    const [acquiredMap, setAcquiredMap] = useState(loadAcquired);
    const [labelLedger, setLabelLedger] = useState(loadLabelLedger);

    // Persist balance
    useEffect(() => {
        if (!isShowcase) return;
        localStorage.setItem(STORAGE_KEY, balance.toString());
    }, [balance]);

    // Persist acquired map
    useEffect(() => {
        if (!isShowcase) return;
        localStorage.setItem(ACQUIRED_KEY, JSON.stringify(acquiredMap));
    }, [acquiredMap]);

    // Persist label ledger
    useEffect(() => {
        if (!isShowcase) return;
        localStorage.setItem(LABEL_LEDGER, JSON.stringify(labelLedger));
    }, [labelLedger]);

    /**
     * acquire (Buy from Primary or Secondary Market)
     * @param {string} songId     — unique song/asset identifier
     * @param {number} cost       — total cost in USD
     * @param {number} fractions  — number of tokens/fractions purchased
     * @param {object} songMeta   — { name, artist, tokenPrice, totalSupply, apy, spotifyStreams }
     * @returns {{ ok: boolean, reason?: string }}
     */
    const acquire = useCallback((songId, cost, fractions = 1, songMeta = {}) => {
        if (!isShowcase) return { ok: false, reason: 'not-showcase' };
        if (cost <= 0) return { ok: false, reason: 'invalid-cost' };

        const current = loadBalance();
        if (current < cost) {
            return { ok: false, reason: 'insufficient', balance: current, needed: cost };
        }

        // Detract from user balance
        const costFloat = parseFloat(cost.toFixed(2));
        setBalance(prev => parseFloat((prev - costFloat).toFixed(2)));

        setAcquiredMap(prev => {
            const existing = prev[songId] || {};
            return {
                ...prev,
                [songId]: {
                    // Accumulate fractions + cost if re-investing in same song
                    fractions:    (existing.fractions || 0) + fractions,
                    cost:         parseFloat(((existing.cost || 0) + cost).toFixed(2)),
                    acquiredAt:   existing.acquiredAt || Date.now(), // keep original date
                    lastAddedAt:  Date.now(),
                    isListed:     false, // Reset if they are adding more
                    // Song metadata — lock in at first purchase, update if changed
                    name:         songMeta.name   || existing.name   || 'Canción',
                    artist:       songMeta.artist || existing.artist || 'Artista',
                    tokenPrice:   songMeta.tokenPrice  || existing.tokenPrice  || 0,
                    totalSupply:  songMeta.totalSupply || existing.totalSupply || 1000,
                    apy:          songMeta.apy    || existing.apy    || 12,
                    spotifyStreams: songMeta.spotifyStreams || existing.spotifyStreams || 0,
                    coverUrl:     songMeta.coverUrl || existing.coverUrl || null,
                },
            };
        });

        // Update Label Ledger (Only for primary market purchases)
        if (!String(songId).endsWith('-p2p')) {
            setLabelLedger(prev => ({
                ...prev,
                gross_capital: parseFloat((prev.gross_capital + costFloat).toFixed(2))
            }));
        }

        return { ok: true, newBalance: parseFloat((current - costFloat).toFixed(2)) };
    }, []);

    /**
     * Check if a song has been acquired.
     * @param {string} songId
     * @returns {{ acquired: boolean, fractions: number, cost: number } | false}
     */
    const acquired = useCallback((songId) => {
        const entry = acquiredMap[songId];
        return entry ? { acquired: true, ...entry } : false;
    }, [acquiredMap]);

    /** Reset balance to state 0 */
    const reset = useCallback(() => {
        setBalance(INITIAL_BALANCE);
        setAcquiredMap({});
        setLabelLedger({ gross_capital: 0, reserve_inventory: 0 });
    }, []);

    /** Sell back immediately to Label at a 10% discount */
    const instantExit = useCallback((songId) => {
        setAcquiredMap(prev => {
            const entry = prev[songId];
            if (!entry || entry.isListed || entry.exited) return prev; // Cannot exit if listed or already exited
            
            // Refund 90% to balance
            const refund = parseFloat((entry.cost * 0.9).toFixed(2));
            setBalance(b => parseFloat((b + refund).toFixed(2)));
            
            // Label Ledger Impact
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
    }, []);

    /** List token on P2P market */
    const listOnMarket = useCallback((songId, listPrice) => {
        setAcquiredMap(prev => {
            if (!prev[songId] || prev[songId].exited) return prev;
            return {
                ...prev,
                [songId]: {
                    ...prev[songId],
                    isListed: true,
                    listPrice: parseFloat(listPrice)
                }
            };
        });
    }, []);

    /** Cancel P2P listing */
    const unlistFromMarket = useCallback((songId) => {
        setAcquiredMap(prev => {
            if (!prev[songId]) return prev;
            return {
                ...prev,
                [songId]: {
                    ...prev[songId],
                    isListed: false,
                    listPrice: 0
                }
            };
        });
    }, []);

    /** List all acquired songs with real-time ROI calculation */
    const portfolio = Object.entries(acquiredMap).map(([id, data]) => {
        const now = Date.now();
        const secondsSince = (now - (data.acquiredAt || now)) / 1000;
        const apyDecimal   = (data.apy || 12) / 100;
        const cost         = data.cost || 0;
        
        // current_royalties = (investment_amount * current_tea / 31,536,000) * seconds_since_purchase
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
        labelLedger,
        acquire,
        acquired,
        reset,
        instantExit,
        listOnMarket,
        unlistFromMarket,
        // Utility
        hasBalance: (cost) => balance >= cost,
        isDemo: isShowcase,
    };
}

export default useDemoBalance;
