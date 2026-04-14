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

const STORAGE_KEY = 'be4t_demo_balance';
const ACQUIRED_KEY = 'be4t_demo_acquired';
const INITIAL_BALANCE = 50_000; // $50,000 USD — strategic simulation budget

function loadBalance() {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === null) return INITIAL_BALANCE;
        const n = parseFloat(v);
        return isNaN(n) ? INITIAL_BALANCE : Math.max(0, n);
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

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDemoBalance() {
    const [balance, setBalance]   = useState(loadBalance);
    const [acquiredMap, setAcquiredMap] = useState(loadAcquired);

    // Persist balance to localStorage on change
    useEffect(() => {
        if (!isShowcase) return;
        try { localStorage.setItem(STORAGE_KEY, balance.toString()); } catch {}
    }, [balance]);

    // Persist acquired map on change
    useEffect(() => {
        if (!isShowcase) return;
        try { localStorage.setItem(ACQUIRED_KEY, JSON.stringify(acquiredMap)); } catch {}
    }, [acquiredMap]);

    /**
     * Try to acquire fractions of a song.
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

        const newBalance = parseFloat((current - cost).toFixed(2));
        setBalance(newBalance);
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

        return { ok: true, newBalance };
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

    /** Reset balance to $100 (dev helper) */
    const reset = useCallback(() => {
        setBalance(INITIAL_BALANCE);
        setAcquiredMap({});
    }, []);

    /** List all acquired songs with real-time ROI calculation */
    const portfolio = Object.entries(acquiredMap).map(([id, data]) => {
        const daysSince    = (Date.now() - (data.acquiredAt || Date.now())) / (1000 * 60 * 60 * 24);
        const dailyRate    = (data.apy || 12) / 100 / 365;
        const earnedToDate = data.cost * dailyRate * daysSince;
        const ownershipPct = (data.totalSupply > 0)
            ? (data.fractions / data.totalSupply) * 100
            : 0;
        return {
            id,
            ...data,
            daysSince:    Math.floor(daysSince),
            earnedToDate: parseFloat(earnedToDate.toFixed(4)),
            ownershipPct: parseFloat(ownershipPct.toFixed(4)),
        };
    });

    return {
        balance,
        acquire,
        acquired,
        reset,
        portfolio,
        // Utility
        hasBalance: (cost) => balance >= cost,
        isDemo: isShowcase,
    };
}

export default useDemoBalance;
