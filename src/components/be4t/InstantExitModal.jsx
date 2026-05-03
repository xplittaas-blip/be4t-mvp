import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Zap, ShieldOff } from 'lucide-react';

const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);

/**
 * InstantExitModal
 * Props:
 *   holding   — the investment record { id, name, artist, cost, apy, fractions }
 *   onConfirm — () => void — executes the exit
 *   onClose   — () => void
 */
const InstantExitModal = ({ holding, onConfirm, onClose }) => {
    const [phase, setPhase] = useState('confirm'); // 'confirm' | 'processing' | 'success'
    const [visible, setVisible] = useState(false);

    const refund  = parseFloat((holding.cost * 0.9).toFixed(2));
    const haircut = parseFloat((holding.cost * 0.1).toFixed(2));

    // Mount animation
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const handleConfirm = async () => {
        setPhase('processing');
        // Brief synthetic delay for UX realism
        await new Promise(r => setTimeout(r, 1200));
        onConfirm();
        setPhase('success');
        // Auto-close after success
        setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 2200);
    };

    const content = (
        <div
            onClick={phase === 'confirm' ? handleClose : undefined}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '440px',
                    background:
                        'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\' opacity=\'0.028\'/%3E%3C/svg%3E"), linear-gradient(160deg, #0f0f14, #0a0a0f)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.12)',
                    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    fontFamily: "'Inter', sans-serif",
                    color: 'white',
                    position: 'relative',
                }}
            >
                {/* Close */}
                {phase === 'confirm' && (
                    <button onClick={handleClose} style={{
                        position: 'absolute', top: '1.1rem', right: '1.1rem',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <X size={14} />
                    </button>
                )}

                {/* ── CONFIRM PHASE ── */}
                {phase === 'confirm' && (
                    <>
                        {/* Icon */}
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1.25rem',
                        }}>
                            <ShieldOff size={22} color="#f87171" />
                        </div>

                        <h2 style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.4rem' }}>
                            ¿Confirmar Liquidación Instantánea?
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
                            Estás a punto de vender tus derechos de{' '}
                            <strong style={{ color: 'white' }}>"{holding.name || holding.id}"</strong>{' '}
                            a la disquera. Recibirás{' '}
                            <strong style={{ color: '#10b981' }}>{fmtUSD(refund)}</strong>{' '}
                            de forma inmediata en tu saldo.
                        </p>

                        {/* Breakdown panel */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '12px', padding: '1rem',
                            marginBottom: '1.25rem',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Capital invertido</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>{fmtUSD(holding.cost)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.78rem', color: '#f87171' }}>Haircut de liquidez (−10%)</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f87171' }}>−{fmtUSD(haircut)}</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'rgba(255,255,255,0.8)' }}>Recibirás ahora</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#10b981' }}>{fmtUSD(refund)}</span>
                            </div>
                        </div>

                        {/* Warning */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                            background: 'rgba(250,204,21,0.05)',
                            border: '1px solid rgba(250,204,21,0.2)',
                            borderRadius: '10px', padding: '0.75rem 0.9rem',
                            marginBottom: '1.75rem',
                        }}>
                            <AlertTriangle size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>
                                Esta acción es <strong style={{ color: '#fbbf24' }}>irreversible</strong>. Dejarás de percibir regalías por este activo de forma permanente.
                            </span>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleClose}
                                style={{
                                    flex: 1, padding: '0.8rem',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '12px', color: 'rgba(255,255,255,0.6)',
                                    fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                style={{
                                    flex: 1.4, padding: '0.8rem',
                                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                    border: 'none',
                                    borderRadius: '12px', color: 'white',
                                    fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(220,38,38,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(220,38,38,0.35)'; }}
                            >
                                <Zap size={14} /> Vender Ahora
                            </button>
                        </div>
                    </>
                )}

                {/* ── PROCESSING PHASE ── */}
                {phase === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{
                            width: '56px', height: '56px', margin: '0 auto 1.5rem',
                            border: '3px solid rgba(255,255,255,0.08)',
                            borderTop: '3px solid #f87171',
                            borderRadius: '50%',
                            animation: 'be4t-spin 0.8s linear infinite',
                        }} />
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
                            Procesando Liquidación...
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                            Actualizando ledger · Acreditando {fmtUSD(refund)}
                        </div>
                    </div>
                )}

                {/* ── SUCCESS PHASE ── */}
                {phase === 'success' && (
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                        <div style={{
                            width: '56px', height: '56px', margin: '0 auto 1.25rem',
                            background: 'rgba(16,185,129,0.1)',
                            border: '2px solid rgba(16,185,129,0.4)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem',
                            animation: 'be4t-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                            ✓
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                            Fondos Acreditados
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem' }}>
                            <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{fmtUSD(refund)}</strong> añadidos a tu balance
                        </div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '100px', padding: '0.3rem 0.85rem',
                            fontSize: '0.65rem', color: '#10b981', fontWeight: '700',
                        }}>
                            ✓ Liquidez disponible ahora mismo
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes be4t-spin { to { transform: rotate(360deg); } }
                    @keyframes be4t-pop  { 0% { transform: scale(0.5); opacity:0; } 100% { transform: scale(1); opacity:1; } }
                `}</style>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default InstantExitModal;
