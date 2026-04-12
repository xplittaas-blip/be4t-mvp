/**
 * ConnectWalletButtonImpl — Thirdweb in-app wallet with Google + Email
 * ─────────────────────────────────────────────────────────────────────────────
 * - Supports: Google OAuth + Email magic link (in-app wallet, no extension needed)  
 * - Once connected: shows user's EMAIL in a styled pill (not wallet address)
 * - ThirdwebProvider is local — does not affect the rest of the app
 */
import React, { useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import {
    ThirdwebProvider,
    ConnectButton,
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
} from 'thirdweb/react';
import { inAppWallet } from 'thirdweb/wallets';
import { baseSepolia } from 'thirdweb/chains';
import { THIRDWEB_CLIENT_ID } from '../../core/env';

const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

// Wallets: in-app wallet (email + google) — no MetaMask required
const wallets = [
    inAppWallet({
        auth: {
            options: ['google', 'email'],
        },
    }),
];

// ── Inner component: gets account context from ThirdwebProvider ───────────────
const Inner = () => {
    const account = useActiveAccount();
    const wallet  = useActiveWallet();
    const { disconnect } = useDisconnect();

    // Extract email from in-app wallet details
    const getEmail = () => {
        try {
            // Thirdweb stores the social login info on the wallet object
            const details = wallet?.getAccount?.()?.emailAddress
                         || wallet?.metadata?.email
                         || null;
            return details;
        } catch { return null; }
    };

    const email = getEmail();

    // If wallet is connected, show a custom email pill instead of the default button
    if (account && (email || account.address)) {
        const displayText = email
            ? (email.length > 22 ? email.slice(0, 20) + '…' : email)
            : `${account.address.slice(0, 6)}…${account.address.slice(-4)}`;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                    title={`Conectado como ${email || account.address}\nHaz clic para desconectar`}
                    onClick={() => disconnect(wallet)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '0.35rem 0.9rem',
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '100px',
                        color: '#4ade80',
                        fontSize: '0.68rem', fontWeight: '700',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.2s',
                        maxWidth: '200px',
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                        e.currentTarget.style.color = '#f87171';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                        e.currentTarget.style.color = '#4ade80';
                    }}
                >
                    {/* Online dot */}
                    <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: '#10b981', display: 'inline-block',
                        boxShadow: '0 0 5px #10b981', flexShrink: 0,
                    }} />
                    {displayText}
                </button>
            </div>
        );
    }

    // Not connected — show ConnectButton (modal handles Google + Email)
    return (
        <ConnectButton
            client={client}
            wallets={wallets}
            chain={baseSepolia}
            connectButton={{
                label: 'Iniciar sesión',
                style: {
                    padding: '0.35rem 0.9rem',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.12))',
                    border: '1px solid rgba(16,185,129,0.35)',
                    borderRadius: '100px',
                    color: '#10b981',
                    fontSize: '0.7rem', fontWeight: '700',
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                },
            }}
            connectModal={{
                title: 'Accede a BE4T',
                titleIcon: '',
                welcomeScreen: {
                    title: 'Plataforma de Regalías Musicales',
                    subtitle: 'Accede con tu cuenta de Google o por email — sin wallet requerida.',
                },
                showThirdwebBranding: false,
            }}
            detailsModal={{
                footer: () => null,
            }}
        />
    );
};

// ── Wrapper with ThirdwebProvider ─────────────────────────────────────────────
const ConnectWalletButtonImpl = () => (
    <ThirdwebProvider>
        <Inner />
    </ThirdwebProvider>
);

export default ConnectWalletButtonImpl;
