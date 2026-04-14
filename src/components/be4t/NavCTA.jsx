/**
 * NavCTA — BE4T Header Dynamic Button (Single Source of Truth)
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces: ConnectWalletButton + Fondear button + Acceso Anticipado button
 *
 * STATE MACHINE:
 *   A — No wallet connected:
 *       → "Acceso Anticipado" (gradient) → opens Thirdweb ConnectButton
 *
 *   B — Wallet connected, onboarding NOT done:
 *       → "Activar Bóveda" (gradient with lock icon) → navigate /onboarding → waitlist
 *
 *   C — Wallet connected, onboarding done:
 *       Showcase: → "$X.XX Demo" (green balance pill) → opens demo wallet dropdown
 *       Production: → "$X.XX ETH" (blue balance pill) → opens Thirdweb PayEmbed
 *
 * Props:
 *   session           Supabase session (for onboarding_completed check)
 *   onLoginClick      () => void — opens EarlyAccessModal (fallback for non-Thirdweb)
 *   onNavigate        (page: string) => void
 *   isAdmin           boolean
 */

import React, { useState, lazy, Suspense } from 'react';
import {
    ThirdwebProvider,
    ConnectButton,
    useActiveAccount,
    useActiveWallet,
    useProfiles,
    useDisconnect,
    useWalletBalance,
} from 'thirdweb/react';
import { inAppWallet } from 'thirdweb/wallets';
import { baseSepolia } from 'thirdweb/chains';
import { client } from '../../core/thirdwebClient';
import { isShowcase, isProduction } from '../../core/env';
import { useDemoBalance } from '../../hooks/useDemoBalance';

// Lazy-load PayModal for production
const ThirdwebPayModal = isProduction
    ? lazy(() => import('./ThirdwebPayModal'))
    : null;

const wallets = [inAppWallet({ auth: { options: ['google', 'email'] } })];

const formatUSD = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ── Gradient button base style ────────────────────────────────────────────────
const CTABase = {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    padding: '0.48rem 1.1rem', minHeight: '36px',
    borderRadius: '100px', border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '800', fontSize: '0.78rem',
    letterSpacing: '-0.01em', whiteSpace: 'nowrap',
    cursor: 'pointer', transition: 'all 0.2s ease',
};

// ── Inner: reads Thirdweb context ─────────────────────────────────────────────
function NavCTAInner({ session, onNavigate, onLoginClick }) {
    const account = useActiveAccount();
    const wallet  = useActiveWallet();
    const { disconnect } = useDisconnect();
    const { data: profiles } = useProfiles({ client });
    const { balance: demoBalance } = useDemoBalance();
    const [showPay, setShowPay] = useState(false);
    const [walletMenuOpen, setWalletMenuOpen] = useState(false);

    // Real ETH balance on Base Sepolia (production only)
    const { data: ethBalance } = useWalletBalance({
        client,
        chain: baseSepolia,
        address: account?.address,
    });

    const email = profiles?.[0]?.details?.email || null;
    const displayEmail = email
        ? (email.length > 20 ? email.slice(0, 18) + '…' : email)
        : account?.address
            ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
            : null;

    // onboarding_completed from Supabase session profile
    const onboardingDone = session?.user?.user_metadata?.onboarding_completed
        || session?.user?.app_metadata?.onboarding_completed
        // Fallback: check localStorage for showcase
        || (isShowcase && localStorage.getItem('be4t_demo_onboarded') === 'true')
        || false;

    // ── STATE A: Not connected ────────────────────────────────────────────────
    if (!account) {
        return (
            <ConnectButton
                client={client}
                wallets={wallets}
                chain={baseSepolia}
                connectButton={{
                    label: 'Acceso Anticipado',
                    style: {
                        ...CTABase,
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4)',
                        backgroundSize: '200% auto',
                        color: 'white',
                        boxShadow: '0 2px 16px rgba(124,58,237,0.45)',
                    },
                }}
                connectModal={{
                    title: 'Accede a BE4T',
                    titleIcon: '',
                    welcomeScreen: {
                        title: 'Regalías Musicales en Blockchain',
                        subtitle: 'Accede con Google o Email. Sin wallet ni extensión requerida.',
                    },
                    showThirdwebBranding: false,
                }}
                detailsButton={{ style: { display: 'none' } }}
            />
        );
    }

    // ── STATE B: Connected + onboarding pending ───────────────────────────────
    if (!onboardingDone) {
        return (
            <button
                onClick={() => {
                    // Mark onboarding started; navigate to waitlist/onboarding
                    if (isShowcase) localStorage.setItem('be4t_demo_onboarded', 'true');
                    onNavigate('waitlist');
                }}
                style={{
                    ...CTABase,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: 'white',
                    boxShadow: '0 2px 14px rgba(124,58,237,0.4)',
                }}
                onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
            >
                🔐 Activar Bóveda
            </button>
        );
    }

    // ── STATE C: Connected + onboarded → Show balance ─────────────────────────
    const showcaseLabel = `${formatUSD(demoBalance)}`;
    const prodLabel     = ethBalance
        ? `${parseFloat(ethBalance.displayValue).toFixed(4)} ${ethBalance.symbol}`
        : '…';
    const balanceLabel  = isShowcase ? showcaseLabel : prodLabel;
    const balanceColor  = isShowcase ? '#4ade80' : '#38bdf8';
    const balanceBg     = isShowcase ? 'rgba(16,185,129,0.1)' : 'rgba(14,165,233,0.1)';
    const balanceBorder = isShowcase ? 'rgba(16,185,129,0.3)' : 'rgba(14,165,233,0.3)';

    return (
        <>
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => {
                        if (isProduction) setShowPay(true);
                        else setWalletMenuOpen(o => !o);
                    }}
                    style={{
                        ...CTABase,
                        background: balanceBg,
                        border: `1px solid ${balanceBorder}`,
                        color: balanceColor,
                        boxShadow: 'none',
                    }}
                    onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
                >
                    {/* Live dot */}
                    <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: balanceColor, flexShrink: 0,
                        boxShadow: `0 0 6px ${balanceColor}`,
                        animation: 'be4t-cta-pulse 2s ease infinite',
                    }} />
                    {balanceLabel}
                    {isShowcase && (
                        <span style={{ fontSize: '0.6rem', opacity: 0.6, fontWeight: '600' }}>demo</span>
                    )}
                </button>

                {/* Showcase dropdown wallet menu */}
                {isShowcase && walletMenuOpen && (
                    <div
                        style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            background: 'rgba(12,10,22,0.97)',
                            border: '1px solid rgba(139,92,246,0.25)',
                            borderRadius: '16px', padding: '0.5rem',
                            minWidth: '200px', zIndex: 500,
                            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                        }}
                        onMouseLeave={() => setWalletMenuOpen(false)}
                    >
                        {/* User info */}
                        {displayEmail && (
                            <div style={{ padding: '0.5rem 0.75rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.35rem' }}>
                                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', marginBottom: '0.15rem' }}>Conectado como</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</div>
                            </div>
                        )}
                        {/* Balance row */}
                        <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>Saldo Demo</span>
                            <span style={{ fontWeight: '800', color: '#4ade80', fontSize: '0.88rem' }}>{formatUSD(demoBalance)}</span>
                        </div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.35rem 0' }} />
                        {/* Actions */}
                        <button
                            onClick={() => { onNavigate('mis-canciones'); setWalletMenuOpen(false); }}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            🎵 Mi Portafolio Demo
                        </button>
                        <button
                            onClick={() => { disconnect(wallet); setWalletMenuOpen(false); }}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.7)', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>

            {/* Thirdweb Pay Modal (Production) */}
            {isProduction && ThirdwebPayModal && (
                <Suspense fallback={null}>
                    <ThirdwebPayModal
                        isOpen={showPay}
                        onClose={() => setShowPay(false)}
                        onSuccess={() => setShowPay(false)}
                        songName="tu cartera"
                        amountUSD={20}
                    />
                </Suspense>
            )}

            <style>{`
                @keyframes be4t-cta-pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.45; }
                }
            `}</style>
        </>
    );
}

// ── Root with ThirdwebProvider ────────────────────────────────────────────────
export default function NavCTA({ session, onNavigate, onLoginClick }) {
    return (
        <ThirdwebProvider>
            <NavCTAInner
                session={session}
                onNavigate={onNavigate}
                onLoginClick={onLoginClick}
            />
        </ThirdwebProvider>
    );
}
