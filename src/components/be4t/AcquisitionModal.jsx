/**
 * BE4T AcquisitionModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen overlay that handles the "Adquirir participación de regalías" flow.
 *
 * States:
 *  - confirm  → shows asset summary + quantity selector + CTA
 *  - loading  → spinner + "Transacción en curso..."
 *  - success  → tx hash + BaseScan link + confetti pulse
 *  - error    → error message + retry
 *
 * Props:
 *  asset      — normalized asset object
 *  onClose    — close callback
 */
import React, { useState } from 'react';
import { useAcquisition, ACQUISITION_STATUS } from '../../hooks/useAcquisition';
import { isProduction, isShowcase } from '../../core/env';

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
    <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '3px solid rgba(16,185,129,0.2)',
        borderTopColor: '#10b981',
        animation: 'be4t-spin 0.8s linear infinite',
        margin: '0 auto',
    }} />
);

// ── Copy helpers ──────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1e9 ? (n/1e9).toFixed(1)+'B' : n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n?.toLocaleString?.() ?? '—';

const AcquisitionModal = ({ asset, onClose }) => {
    const { acquire, status, result, error, reset } = useAcquisition();
    const [qty, setQty] = useState(1);

    const priceUSD   = (asset.token_price_usd || 10) * qty;
    const apy        = asset.metadata?.yield_estimate || '—';
    const artistName = asset.metadata?.artist || asset.name;
    const streams    = asset.metadata?.spotify_streams;

    const handleAcquire = () => {
        // In production, account comes from Thirdweb's useActiveAccount hook
        // For now we pass null — the service handles the wallet check
        acquire({ asset, account: null, quantity: qty });
    };

    const isLoading = status === ACQUISITION_STATUS.LOADING;
    const isSuccess = status === ACQUISITION_STATUS.SUCCESS;
    const isError   = status === ACQUISITION_STATUS.ERROR;

    return (
        <>
            <style>{`
                @keyframes be4t-spin { to { transform: rotate(360deg); } }
                @keyframes be4t-pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
                    50%       { box-shadow: 0 0 0 16px rgba(16,185,129,0); }
                }
                @keyframes be4t-fade-in {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={!isLoading ? onClose : undefined}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.72)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }}
            >
                {/* Modal card */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#0f1117',
                        border: '1px solid rgba(16,185,129,0.25)',
                        borderRadius: '20px',
                        padding: '2rem',
                        width: '100%', maxWidth: '440px',
                        animation: 'be4t-fade-in 0.3s ease',
                        position: 'relative',
                    }}
                >
                    {/* Close */}
                    {!isLoading && (
                        <button onClick={onClose} style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                            fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1,
                        }}>✕</button>
                    )}

                    {/* ── CONFIRM STATE ── */}
                    {status === ACQUISITION_STATUS.IDLE && (
                        <div>
                            {/* Mode badge */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{
                                    fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase',
                                    letterSpacing: '1.5px', color: isProduction ? '#10b981' : '#f59e0b',
                                    background: isProduction ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                    border: `1px solid ${isProduction ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                    borderRadius: '100px', padding: '0.25rem 0.75rem',
                                }}>
                                    {isProduction ? '⚡ Base Sepolia — Producción' : '🎬 Demo Mode — Sin blockchain'}
                                </span>
                            </div>

                            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
                                Adquirir participación
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {artistName} — {asset.name}
                            </p>

                            {/* Asset summary */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {[
                                        { label: 'Precio / Token',  value: `$${asset.token_price_usd || 10} USD` },
                                        { label: 'APY Estimado',    value: apy, color: '#10b981' },
                                        { label: 'Streams',         value: fmt(streams) },
                                        { label: 'Supply Total',    value: (asset.total_supply || 1000).toLocaleString() },
                                    ].map(({ label, value, color }) => (
                                        <div key={label}>
                                            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{label}</div>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: color || 'white' }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity selector */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.5rem' }}>
                                    Cantidad de tokens
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>−</button>
                                    <span style={{ fontWeight: '800', fontSize: '1.4rem', minWidth: '2rem', textAlign: 'center' }}>{qty}</span>
                                    <button onClick={() => setQty(q => Math.min(100, q + 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>+</button>
                                    <span style={{ marginLeft: 'auto', fontWeight: '700', color: '#10b981' }}>${priceUSD.toFixed(2)} USD</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleAcquire}
                                style={{
                                    width: '100%', padding: '0.95rem',
                                    background: 'linear-gradient(135deg, #065f46, #10b981)',
                                    border: 'none', borderRadius: '12px',
                                    color: 'white', fontWeight: '800', fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(16,185,129,0.5)'; }}
                                onMouseOut={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.35)'; }}
                            >
                                {isProduction ? 'Ejecutar Adquisición →' : 'Simular Adquisición →'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.75rem' }}>
                                {isProduction
                                    ? 'Requiere wallet conectada · Gas en ETH (Base)'
                                    : 'Modo demo · Sin transacción real · Sin costo'}
                            </p>
                        </div>
                    )}

                    {/* ── LOADING STATE ── */}
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <Spinner />
                            <h3 style={{ marginTop: '1.5rem', fontWeight: '700', fontSize: '1.1rem' }}>
                                Transacción en curso...
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
                                {isProduction
                                    ? 'Confirmando en Base Sepolia. No cierres esta ventana.'
                                    : 'Procesando adquisición demo...'}
                            </p>
                        </div>
                    )}

                    {/* ── SUCCESS STATE ── */}
                    {isSuccess && result && (
                        <div style={{ textAlign: 'center', animation: 'be4t-fade-in 0.4s ease' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #065f46, #10b981)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                animation: 'be4t-pulse-glow 1.5s ease 1',
                                fontSize: '1.8rem',
                            }}>✓</div>
                            <h3 style={{ fontWeight: '900', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                ¡Adquisición exitosa!
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Ya eres co-propietario de <strong style={{ color: 'white' }}>{result.qty} token{result.qty > 1 ? 's' : ''}</strong> de <strong style={{ color: '#10b981' }}>{result.asset}</strong>
                            </p>
                            {/* Tx hash */}
                            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem', wordBreak: 'break-all' }}>
                                <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                                    {result.mode === 'showcase' ? 'Demo TX Hash' : 'Transaction Hash'}
                                </div>
                                <code style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{result.txHash}</code>
                            </div>
                            {result.explorerUrl && (
                                <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'block', marginBottom: '1rem', color: '#10b981', fontSize: '0.82rem', fontWeight: '600' }}>
                                    Ver en BaseScan ↗
                                </a>
                            )}
                            <button onClick={onClose} style={{
                                width: '100%', padding: '0.85rem',
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: '12px', color: '#10b981',
                                fontWeight: '700', cursor: 'pointer',
                            }}>
                                Cerrar
                            </button>
                        </div>
                    )}

                    {/* ── ERROR STATE ── */}
                    {isError && (
                        <div style={{ textAlign: 'center', animation: 'be4t-fade-in 0.4s ease' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠</div>
                            <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem', color: '#f87171' }}>
                                Error en la transacción
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={reset} style={{ flex: 1, padding: '0.8rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#10b981', fontWeight: '700', cursor: 'pointer' }}>
                                    Reintentar
                                </button>
                                <button onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', cursor: 'pointer' }}>
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
