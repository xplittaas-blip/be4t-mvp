/**
 * ConnectWalletButtonImpl — BE4T Social Login via Thirdweb v5
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses the correct Thirdweb v5 API:
 *   - inAppWallet() from 'thirdweb/wallets'
 *   - ConnectButton from 'thirdweb/react'
 *   - useProfiles() hook to get the email/social identity
 *   - baseSepolia chain explicitly set
 *
 * The ThirdwebProvider here is LOCAL to this component.
 * The client is created once at module level (singleton pattern).
 *
 * Thirdweb in-app wallets ACTIVATE automatically on first user login.
 * No manual Dashboard toggle required — the SDK calls the Thirdweb API
 * which registers this clientId's domain automatically.
 */
import React from 'react';
import { createThirdwebClient } from 'thirdweb';
import {
    ThirdwebProvider,
    ConnectButton,
    useActiveAccount,
    useActiveWallet,
    useProfiles,
    useDisconnect,
} from 'thirdweb/react';
import { inAppWallet } from 'thirdweb/wallets';
import { baseSepolia } from 'thirdweb/chains';
import { THIRDWEB_CLIENT_ID } from '../../core/env';

// Singleton client — created once at module load
const client = createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID,
});

// Wallet config: in-app wallet with google + email
// This configuration tells Thirdweb which auth methods to support.
// The ConnectButton modal will show exactly these options.
const wallets = [
    inAppWallet({
        auth: {
            options: ['google', 'email'],
        },
    }),
];

// ── Connected state — shows email pill ────────────────────────────────────────
const ConnectedPill = ({ account, wallet }) => {
    const { disconnect } = useDisconnect();
    // useProfiles gives us the linked social/email profile for in-app wallets
    const { data: profiles } = useProfiles({ client });

    // Get display text: prefer email from profile, fallback to address
    const email = profiles?.[0]?.details?.email
               || profiles?.[0]?.details?.phone
               || null;
    const displayText = email
        ? (email.length > 24 ? email.slice(0, 22) + '…' : email)
        : `${account.address.slice(0, 6)}…${account.address.slice(-4)}`;

    return (
        <button
            title={`Conectado como ${email || account.address}\nHaz clic para cerrar sesión`}
            onClick={() => disconnect(wallet)}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.9rem', minHeight: '32px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '100px',
                color: '#4ade80',
                fontSize: '0.68rem', fontWeight: '700',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis',
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
            {/* Live dot */}
            <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#10b981', display: 'inline-block',
                boxShadow: '0 0 6px #10b981', flexShrink: 0,
                animation: 'be4t-pulse 2s ease infinite',
            }} />
            {displayText}
        </button>
    );
};

// ── Inner — reads wallet context from ThirdwebProvider ────────────────────────
const Inner = () => {
    const account = useActiveAccount();
    const wallet  = useActiveWallet();

    if (account && wallet) {
        return <ConnectedPill account={account} wallet={wallet} />;
    }

    // Not connected — show the Thirdweb ConnectButton modal
    return (
        <ConnectButton
            client={client}
            wallets={wallets}
            chain={baseSepolia}
            // ── Connect button style ──────────────────────────────────────────
            connectButton={{
                label: 'Iniciar sesión',
                style: {
                    padding: '0.35rem 0.9rem',
                    minHeight: '32px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.12))',
                    border: '1px solid rgba(16,185,129,0.35)',
                    borderRadius: '100px',
                    color: '#10b981',
                    fontSize: '0.7rem', fontWeight: '700',
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    letterSpacing: '-0.01em',
                },
            }}
            // ── Modal config ─────────────────────────────────────────────────
            connectModal={{
                title: 'Accede a BE4T',
                titleIcon: '',
                welcomeScreen: {
                    title: 'Regalías Musicales en Blockchain',
                    subtitle: 'Accede con Google o Email. Sin wallet ni extensión requerida.',
                    img: { src: '/be4t-logo.svg', width: 80, height: 80 },
                },
                showThirdwebBranding: false,
            }}
            // ── Details button (when already connected but custom pill fails) ─
            detailsButton={{
                style: {
                    padding: '0.35rem 0.9rem',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '100px',
                    color: '#4ade80',
                    fontSize: '0.68rem', fontWeight: '700',
                },
            }}
        />
    );
};

// ── Root — provides Thirdweb context ─────────────────────────────────────────
const ConnectWalletButtonImpl = () => (
    <>
        <style>{`
            @keyframes be4t-pulse {
                0%, 100% { opacity: 1; box-shadow: 0 0 6px #10b981; }
                50% { opacity: 0.6; box-shadow: 0 0 2px #10b981; }
            }
        `}</style>
        <ThirdwebProvider>
            <Inner />
        </ThirdwebProvider>
    </>
);

export default ConnectWalletButtonImpl;
