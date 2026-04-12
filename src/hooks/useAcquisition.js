/**
 * useAcquisition — React hook for the token acquisition flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles:
 *  - Wallet connection check (production)
 *  - Transaction lifecycle: idle → loading → success → error
 *  - Mode-aware routing to acquireToken()
 *  - Humanized error messages in Spanish (no raw blockchain codes)
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

// ── Humanize blockchain error messages ───────────────────────────────────────
function humanizeError(err) {
    const msg = (err?.message || err?.reason || String(err)).toLowerCase();

    // Wallet / user actions
    if (msg.includes('user rejected') || msg.includes('user denied') || msg.includes('rejected the request'))
        return 'Cancelaste la transacción. Inténtalo de nuevo cuando estés listo.';

    if (msg.includes('wallet not connected') || msg.includes('no wallet') || msg.includes('not connected'))
        return 'Conecta tu wallet antes de continuar.';

    // Funds
    if (msg.includes('insufficient funds') || msg.includes('insufficient balance'))
        return 'Saldo insuficiente en tu wallet. Necesitas más ETH en Base para cubrir el costo + gas.';

    // Gas
    if (msg.includes('gas') || msg.includes('out of gas') || msg.includes('gas price'))
        return 'No se pudo estimar el gas. Asegúrate de tener ETH suficiente en Base Sepolia.';

    // Contract / revert
    if (msg.includes('execution reverted') || msg.includes('revert') || msg.includes('contract'))
        return 'El contrato rechazó la transacción. Es posible que los tokens estén agotados o no tengas acceso.';

    // Network / timeout
    if (msg.includes('network') || msg.includes('timeout') || msg.includes('could not connect'))
        return 'Error de red. Revisa tu conexión e inténtalo de nuevo.';

    // Wrong network
    if (msg.includes('wrong network') || msg.includes('chain') || msg.includes('unsupported'))
        return 'Red incorrecta. Por favor cambia tu wallet a Base Sepolia.';

    // Generic/unknown
    return 'Ocurrió un error inesperado. Por favor inténtalo de nuevo.';
}

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

            // Post-TX: notify backend to sync tokens_available in Supabase
            if (res.mode === 'production' && res.txHash) {
                try {
                    await fetch('/api/update-token-supply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            assetId: asset.id,
                            qty:     quantity,
                            txHash:  res.txHash,
                        }),
                    });
                } catch (_) {
                    // Non-critical — Supabase sync failure doesn't block the user
                    console.warn('[BE4T] Supabase supply sync failed (non-critical)');
                }
            }
        } catch (err) {
            setError(humanizeError(err));
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
