/**
 * useDemoBalance — BE4T Ghost Balance System
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a fictional $100 USD "demo credit" for the Pitch environment.
 * Persists to localStorage so the balance survives page reloads.
 *
 * API:
 *   const { balance, acquire, acquired, reset } = useDemoBalance();
 *   acquire(songId, cost)  → deducts from balance, marks song acquired
 *   acquired(songId)       → returns true if song already acquired
 *   reset()                → resets to $100 (for testing)
 *
 * Only meaningful in showcase mode — in production, returns production stubs.
 */

import { useState, useCallback, useEffect } from 'react';
import { isShowcase } from '../core/env';

const STORAGE_KEY = 'be4t_demo_balance';
const ACQUIRED_KEY = 'be4t_demo_acquired';
const INITIAL_BALANCE = 100; // $100 USD

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
     * Try to acquire `fractions` of a song.
     * @param {string} songId   — unique song/asset identifier
     * @param {number} cost     — total cost in USD
     * @param {number} fractions
     * @returns {{ ok: boolean, reason?: string }}
     */
    const acquire = useCallback((songId, cost, fractions = 1) => {
        if (!isShowcase) return { ok: false, reason: 'not-showcase' };
        if (cost <= 0) return { ok: false, reason: 'invalid-cost' };

        const current = loadBalance();
        if (current < cost) {
            return { ok: false, reason: 'insufficient', balance: current, needed: cost };
        }

        const newBalance = parseFloat((current - cost).toFixed(2));
        setBalance(newBalance);
        setAcquiredMap(prev => ({
            ...prev,
            [songId]: {
                fractions: (prev[songId]?.fractions || 0) + fractions,
                cost:      ((prev[songId]?.cost || 0) + cost),
                acquiredAt: Date.now(),
            },
        }));

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

    /** List all acquired songs */
    const portfolio = Object.entries(acquiredMap).map(([id, data]) => ({ id, ...data }));

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
