/**
 * BE4T ConnectWalletButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Showcase mode: renders a styled "Demo" badge — no wallet, no errors.
 * Production mode: renders the Thirdweb ConnectButton with Email/Google/Web3.
 *
 * Usage:
 *   <ConnectWalletButton />
 */
import React from 'react';
import { isProduction } from '../../core/env';
import { thirdwebClient, ACTIVE_CHAIN } from '../../core/web3Client';

// ── Showcase stub ─────────────────────────────────────────────────────────────
const ShowcaseBadge = () => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.45rem 0.9rem',
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '8px',
        fontSize: '0.72rem', fontWeight: '700',
        color: '#10b981', letterSpacing: '0.5px',
        textTransform: 'uppercase',
    }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        Demo Mode
    </div>
);

// ── Production: lazy-load Thirdweb to avoid bundle bloat in showcase ──────────
let ThirdwebConnectButton = null;

async function loadThirdwebButton() {
    if (ThirdwebConnectButton) return ThirdwebConnectButton;
    const mod = await import('thirdweb/react');
    ThirdwebConnectButton = mod.ConnectButton;
    return ThirdwebConnectButton;
}

// ── Main component ────────────────────────────────────────────────────────────
const ConnectWalletButton = () => {
    const [ButtonComponent, setButtonComponent] = React.useState(null);

    React.useEffect(() => {
        if (!isProduction) return;
        loadThirdwebButton().then(setButtonComponent);
    }, []);

    if (!isProduction) return <ShowcaseBadge />;

    if (!thirdwebClient) {
        return (
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,165,0,0.8)', padding: '0.45rem 0.9rem', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '8px' }}>
                ⚠ Missing Client ID
            </div>
        );
    }

    if (!ButtonComponent) {
        return (
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', padding: '0.45rem 0.9rem' }}>
                Loading…
            </div>
        );
    }

    return (
        <ButtonComponent
            client={thirdwebClient}
            chain={ACTIVE_CHAIN}
            connectModal={{
                title: 'Conecta tu cuenta',
                titleIconUrl: '/be4t-logo.svg',
                welcomeScreen: {
                    title: 'BE4T — Terminal Financiero',
                    subtitle: 'Adquiere derechos de canciones y recibe regalías de por vida.',
                },
            }}
            connectButton={{
                label: 'Conectar Wallet',
                style: {
                    background: 'linear-gradient(135deg, #065f46, #10b981)',
                    border: 'none', borderRadius: '8px',
                    color: 'white', fontWeight: '700', fontSize: '0.82rem',
                    padding: '0.45rem 1rem',
                    cursor: 'pointer',
                },
            }}
            detailsButton={{
                style: {
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '8px',
                    color: '#10b981',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                },
            }}
        />
    );
};

export default ConnectWalletButton;
