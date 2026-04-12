/**
 * BE4T ConnectWalletButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the Thirdweb ConnectButton inside its own ThirdwebProvider.
 * Safe: mounts ThirdwebProvider only when isProduction is true.
 * In showcase mode returns null — no runtime import of thirdweb at all.
 */
import React, { Suspense, lazy } from 'react';
import { isProduction, THIRDWEB_CLIENT_ID } from '../../core/env';

// Lazy-load the real implementation so thirdweb is never bundled in showcase
const ConnectButtonImpl = lazy(() => import('./ConnectWalletButtonImpl'));

const ConnectWalletButton = () => {
    if (!isProduction || !THIRDWEB_CLIENT_ID) return null;
    return (
        <Suspense fallback={
            <button style={{
                padding: '0.4rem 1rem',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '100px',
                color: '#10b981',
                fontSize: '0.72rem', fontWeight: '700', cursor: 'default',
            }}>
                Cargando…
            </button>
        }>
            <ConnectButtonImpl />
        </Suspense>
    );
};

export default ConnectWalletButton;
