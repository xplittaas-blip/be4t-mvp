/**
 * useAcquisition — React hook for the token acquisition flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles:
 *  - Wallet connection check (production)
 *  - Transaction lifecycle: idle → loading → success → error
 *  - Mode-aware routing to acquireToken()
 *
 * Usage:
 *   const { acquire, status, result, error, reset } = useAcquisition();
 *   await acquire({ asset, account });
 */
import { useState, useCallback } from 'react';
import { acquireToken } from '../services/acquisitionService';

export const ACQUISITION_STATUS = {
    IDLE:    'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR:   'error',
};

export function useAcquisition() {
    const [status, setStatus] = useState(ACQUISITION_STATUS.IDLE);
    const [result, setResult] = useState(null);
    const [error,  setError]  = useState(null);

    const acquire = useCallback(async ({ asset, account = null, quantity = 1 }) => {
        setStatus(ACQUISITION_STATUS.LOADING);
        setResult(null);
        setError(null);

        try {
            const res = await acquireToken({ asset, account, quantity });
            setResult(res);
            setStatus(ACQUISITION_STATUS.SUCCESS);
        } catch (err) {
            setError(err.message || 'Transaction failed');
            setStatus(ACQUISITION_STATUS.ERROR);
        }
    }, []);

    const reset = useCallback(() => {
        setStatus(ACQUISITION_STATUS.IDLE);
        setResult(null);
        setError(null);
    }, []);

    return { acquire, status, result, error, reset };
}
