/**
 * AcquisitionModalWallet
 * ─────────────────────────────────────────────────────────────────────────────
 * Lazy-loaded wallet section for AcquisitionModal.
 * Uses Thirdweb's useActiveAccount to detect connected wallet.
 * If not connected, renders an inline ConnectButton.
 * Calls onAccount(account) whenever account status changes.
 */
import React, { useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { ThirdwebProvider, ConnectButton, useActiveAccount } from 'thirdweb/react';
import { baseSepolia } from 'thirdweb/chains';
import { THIRDWEB_CLIENT_ID } from '../../core/env';

const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

// Inner component — runs inside ThirdwebProvider
const Inner = ({ onAccount }) => {
    const account = useActiveAccount();

    useEffect(() => {
        onAccount(account ?? null);
    }, [account, onAccount]);

    if (account) {
        // Wallet connected — show address pill
        const addr = account.address;
        const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.6rem 1rem', marginBottom: '1rem',
                background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '100px',
            }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: '700' }}>Wallet conectada</span>
                <code style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>{short}</code>
            </div>
        );
    }

    // No wallet — show ConnectButton
    return (
        <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem', textAlign: 'center' }}>
                Conecta tu wallet para adquirir tokens reales
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ConnectButton
                    client={client}
                    chain={baseSepolia}
                    connectButton={{
                        label: 'Conectar Wallet',
                        style: {
                            padding: '0.55rem 1.5rem',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))',
                            border: '1px solid rgba(16,185,129,0.4)',
                            borderRadius: '100px',
                            color: '#10b981',
                            fontSize: '0.82rem', fontWeight: '700',
                            fontFamily: "'Inter', sans-serif",
                            cursor: 'pointer',
                        },
                    }}
                />
            </div>
        </div>
    );
};

const AcquisitionModalWallet = ({ onAccount }) => (
    <ThirdwebProvider>
        <Inner onAccount={onAccount} />
    </ThirdwebProvider>
);

export default AcquisitionModalWallet;
