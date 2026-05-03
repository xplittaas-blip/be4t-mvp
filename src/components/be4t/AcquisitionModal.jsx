/**
 * BE4T AcquisitionModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen overlay that handles the "Adquirir participación de regalías" flow.
 *
 * States:
 *  - confirm  → asset summary + quantity selector + CTA
 *  - loading  → neon spinner + "Confirmando en Base Sepolia..."
 *  - success  → tx hash + BaseScan link + pulse verde
 *  - error    → mensaje humanizado + retry
 *
 * Production extras:
 *  - Detects wallet via useActiveAccount (lazy thirdweb import)
 *  - If no wallet connected → shows inline ConnectButton before letting user buy
 *
 * Props:
 *  asset      — asset object (_raw from normalizeSong or compatible)
 *  onClose    — close callback
 */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAcquisition, ACQUISITION_STATUS } from '../../hooks/useAcquisition';
import { isProduction } from '../../core/env';

// Lazy-load the production wallet hook wrapper — zero cost in showcase
const WalletWrapper = lazy(() => import('./AcquisitionModalWallet'));

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = () => (
    <div style={{ position: 'relative', width: '56px', height: '56px', margin: '0 auto' }}>
        {/* Outer ring */}
        <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid rgba(16,185,129,0.12)',
            borderTopColor: '#10b981',
            animation: 'be4t-spin 0.9s linear infinite',
        }} />
        {/* Inner glow */}
        <div style={{
            position: 'absolute', inset: '8px', borderRadius: '50%',
            border: '2px solid rgba(16,185,129,0.06)',
            borderTopColor: 'rgba(16,185,129,0.4)',
            animation: 'be4t-spin 1.4s linear infinite reverse',
        }} />
        <div style={{
            position: 'absolute', inset: '18px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent)',
        }} />
    </div>
);

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmt = (n) => !n ? '—' : n >= 1e9 ? (n/1e9).toFixed(1)+'B' : n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(0)+'K' : n.toString();
const fmtUSD = (n) => isFinite(n) ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

// ── Main component ─────────────────────────────────────────────────────────────
const AcquisitionModal = ({ asset, onClose }) => {
    const { acquire, status, result, error, reset } = useAcquisition();
    const [qty,       setQty]       = useState(1);
    const [account,   setAccount]   = useState(null); // set by WalletWrapper in prod

    const tokenPrice = asset.token_price_usd || asset.price_per_token || 10;
    const totalUSD   = tokenPrice * qty;
    const apy        = asset.metadata?.yield_estimate || `${asset.roi_est || 18}%`;
    const artistName = asset.metadata?.artist || asset.artist_name || asset.name;
    const streams    = asset.metadata?.spotify_streams || asset.spotify_streams;
    const supply     = asset.total_supply || 1000;
    const available  = asset.tokens_available ?? Math.floor(supply * 0.72);

    const isIdle    = status === ACQUISITION_STATUS.IDLE;
    const isLoading = status === ACQUISITION_STATUS.LOADING;
    const isSuccess = status === ACQUISITION_STATUS.SUCCESS;
    const isError   = status === ACQUISITION_STATUS.ERROR;

    // In production: don't allow purchase if wallet not connected
    const needsWallet = isProduction && !account;

    const handleAcquire = () => {
        acquire({ asset, account: account || null, quantity: qty });
    };

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && !isLoading) onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isLoading, onClose]);

    return (
        <>
            <style>{`
                @keyframes be4t-spin       { to { transform: rotate(360deg); } }
                @keyframes be4t-pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.44); }
                    50%      { box-shadow: 0 0 0 20px rgba(16,185,129,0); }
                }
                @keyframes be4t-fade-in {
                    from { opacity: 0; transform: translateY(14px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes be4t-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .be4t-acq-cta:hover { filter: brightness(1.12); box-shadow: 0 8px 32px rgba(16,185,129,0.55) !important; }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={!isLoading ? onClose : undefined}
                style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.78)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }}
            >
                {/* Modal card */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(160deg, #0d1117 0%, #0f1520 100%)',
                        border: '1px solid rgba(16,185,129,0.22)',
                        borderRadius: '22px',
                        padding: '2rem',
                        width: '100%', maxWidth: '460px',
                        animation: 'be4t-fade-in 0.3s cubic-bezier(0.25,0.8,0.25,1)',
                        position: 'relative',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08)',
                    }}
                >
                    {/* Close button */}
                    {!isLoading && (
                        <button onClick={onClose} style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%', width: '28px', height: '28px',
                            color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1, transition: 'all 0.2s',
                        }}>✕</button>
                    )}

                    {/* ── IDLE / CONFIRM ── */}
                    {isIdle && (
                        <div>
                            {/* Mode badge */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    color:      isProduction ? '#10b981'  : '#f59e0b',
                                    background: isProduction ? 'rgba(16,185,129,0.08)'  : 'rgba(245,158,11,0.08)',
                                    border: `1px solid ${isProduction ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                    borderRadius: '100px', padding: '0.25rem 0.85rem',
                                }}>
                                    {isProduction ? '⚡ Base Sepolia — Producción' : '🎬 Demo Mode — Sin blockchain'}
                                </span>
                            </div>

                            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', marginBottom: '0.2rem', letterSpacing: '-0.04em' }}>
                                Adquirir participación
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                                {artistName} — {asset.name}
                            </p>

                            {/* Asset summary grid */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '14px', padding: '1.1rem', marginBottom: '1.25rem',
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                                    {[
                                        { label: 'Precio / Token',    value: fmtUSD(tokenPrice) },
                                        { label: 'TEA Estimado',      value: apy,                color: '#10b981' },
                                        { label: 'Streams (Mensuales)', value: fmt(streams ? Math.round(streams / 12) : null) },
                                        { label: 'Tokens Disponibles', value: `${available.toLocaleString()} / ${supply.toLocaleString()}`,
                                          color: available / supply < 0.2 ? '#fb923c' : undefined },
                                    ].map(({ label, value, color }) => (
                                        <div key={label}>
                                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{label}</div>
                                            <div style={{ fontWeight: '700', fontSize: '0.92rem', color: color || 'rgba(255,255,255,0.9)' }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity selector */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.6rem' }}>
                                    Cantidad de tokens
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {['-', '+'].map((op, i) => (
                                        <button key={op} onClick={() => setQty(q => i === 0 ? Math.max(1, q - 1) : Math.min(available, q + 1))}
                                            style={{ width: '36px', height: '36px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>
                                            {op}
                                        </button>
                                    ))}
                                    <span style={{ fontWeight: '900', fontSize: '1.5rem', minWidth: '2rem', textAlign: 'center', letterSpacing: '-0.04em' }}>{qty}</span>
                                    <span style={{ marginLeft: 'auto', fontWeight: '800', color: '#10b981', fontSize: '1.05rem' }}>{fmtUSD(totalUSD)}</span>
                                </div>
                            </div>

                            {/* ── Production: wallet check ── */}
                            {isProduction && (
                                <Suspense fallback={null}>
                                    <WalletWrapper onAccount={setAccount} />
                                </Suspense>
                            )}

                            {/* ── CTA ── */}
                            {needsWallet ? (
                                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.75rem' }}>
                                    Conecta tu wallet arriba para continuar
                                </p>
                            ) : (
                                <>
                                    <button
                                        className="be4t-acq-cta"
                                        onClick={handleAcquire}
                                        style={{
                                            width: '100%', padding: '1rem',
                                            background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
                                            border: 'none', borderRadius: '13px',
                                            color: 'white', fontWeight: '800', fontSize: '1rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 22px rgba(16,185,129,0.38)',
                                            transition: 'all 0.25s ease',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {isProduction ? `Adquirir ${qty} token${qty > 1 ? 's' : ''} →` : `Simular adquisición →`}
                                    </button>
                                    <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.6rem' }}>
                                        {isProduction
                                            ? 'Requiere wallet · Gas en ETH (Base Sepolia)'
                                            : 'Modo demo · Sin transacción real · Sin costo'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── LOADING STATE ── */}
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                            <Spinner />
                            <h3 style={{ marginTop: '1.75rem', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                                {isProduction ? 'Confirmando en Base Sepolia…' : 'Procesando adquisición demo…'}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
                                {isProduction
                                    ? 'Firmando y enviando la transacción.\nNo cierres esta ventana.'
                                    : 'Simulando la compra…'}
                            </p>
                            {/* Neon progress bar */}
                            <div style={{ marginTop: '2rem', height: '2px', background: 'rgba(16,185,129,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: '60%',
                                    background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
                                    backgroundSize: '200% 100%',
                                    animation: 'be4t-shimmer 1.5s ease infinite',
                                    borderRadius: '100px',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* ── SUCCESS STATE ── */}
                    {isSuccess && result && (
                        <div style={{ textAlign: 'center', animation: 'be4t-fade-in 0.4s ease' }}>
                            {/* Success icon */}
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #065f46, #10b981)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                animation: 'be4t-pulse-glow 1.5s ease 1',
                                fontSize: '2rem',
                                boxShadow: '0 0 40px rgba(16,185,129,0.3)',
                            }}>✓</div>

                            <h3 style={{ fontWeight: '900', fontSize: '1.3rem', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
                                ¡Adquisición exitosa!
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                Ahora eres co-propietario de{' '}
                                <strong style={{ color: 'white' }}>{result.qty} token{result.qty > 1 ? 's' : ''}</strong>{' '}
                                de <strong style={{ color: '#10b981' }}>{result.asset}</strong>
                            </p>

                            {/* TX hash card */}
                            <div style={{
                                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: '12px', padding: '1rem', marginBottom: '1rem', wordBreak: 'break-all',
                            }}>
                                <div style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                                    {result.mode === 'showcase' ? '⚡ Demo TX ID' : '🔗 Transaction Hash'}
                                </div>
                                <code style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                                    {result.txHash}
                                </code>
                            </div>

                            {result.explorerUrl && (
                                <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        marginBottom: '1.25rem', color: '#10b981', fontSize: '0.82rem', fontWeight: '700',
                                        textDecoration: 'none',
                                        padding: '0.45rem 1rem',
                                        border: '1px solid rgba(16,185,129,0.25)',
                                        borderRadius: '100px',
                                        background: 'rgba(16,185,129,0.08)',
                                    }}>
                                    Ver en BaseScan ↗
                                </a>
                            )}

                            <button onClick={onClose} style={{
                                width: '100%', padding: '0.9rem',
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: '13px', color: '#10b981',
                                fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem',
                            }}>
                                Continuar explorando
                            </button>
                        </div>
                    )}

                    {/* ── ERROR STATE ── */}
                    {isError && (
                        <div style={{ textAlign: 'center', animation: 'be4t-fade-in 0.4s ease' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem', fontSize: '1.8rem',
                            }}>⚠</div>
                            <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem', color: '#f87171', letterSpacing: '-0.02em' }}>
                                No se pudo completar
                            </h3>
                            <p style={{
                                color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem',
                                marginBottom: '1.75rem', lineHeight: 1.65,
                                background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.12)',
                                borderRadius: '10px', padding: '0.85rem',
                            }}>
                                {error}
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={reset} style={{
                                    flex: 1, padding: '0.85rem',
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))',
                                    border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px',
                                    color: '#10b981', fontWeight: '700', cursor: 'pointer',
                                }}>
                                    Reintentar
                                </button>
                                <button onClick={onClose} style={{
                                    flex: 1, padding: '0.85rem',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                    color: 'rgba(255,255,255,0.45)', fontWeight: '600', cursor: 'pointer',
                                }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AcquisitionModal;
