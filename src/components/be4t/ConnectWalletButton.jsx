/**
 * BE4T ConnectWalletButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders in BOTH envs (pitch + real-test) as long as THIRDWEB_CLIENT_ID exists.
 * The CLIENT_ID is a public-safe domain-scoped key — safe to expose in frontend.
 *
 * Lazy-loads ConnectWalletButtonImpl so thirdweb is only bundled when used.
 */
import React, { Suspense, lazy } from 'react';
import { THIRDWEB_CLIENT_ID } from '../../core/env';

const ConnectButtonImpl = lazy(() => import('./ConnectWalletButtonImpl'));

const ConnectWalletButton = () => {
    if (!THIRDWEB_CLIENT_ID) return null;
    return (
        <Suspense fallback={
            <span style={{
                padding: '0.35rem 0.85rem',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '100px',
                color: 'rgba(16,185,129,0.5)',
                fontSize: '0.68rem', fontWeight: '600',
                cursor: 'default', whiteSpace: 'nowrap',
            }}>
                Acceso…
            </span>
        }>
            <ConnectButtonImpl />
        </Suspense>
    );
};

export default ConnectWalletButton;
