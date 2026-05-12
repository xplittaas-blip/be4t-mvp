import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Shield } from 'lucide-react';

/**
 * AuthGateModal — High-impact auth intercept for BE4T.
 * Triggered when a guest tries to interact with any asset.
 * Props:
 *   isOpen      {bool}
 *   onClose     {fn}
 *   onLogin     {fn}  — opens the real AuthModal
 *   songName    {string} optional — name of the song they tried to access
 */
const AuthGateModal = ({ isOpen, onClose, onLogin, songName }) => {
    const [mounted, setMounted] = useState(false);

    // Animate in
    useEffect(() => {
        if (isOpen) {
            const t = requestAnimationFrame(() => setMounted(true));
            return () => cancelAnimationFrame(t);
        } else {
            setMounted(false);
        }
    }, [isOpen]);

    // Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }}
        >
            <style>{`
                @keyframes be4t-gate-glow {
                    0%, 100% { box-shadow: 0 0 24px rgba(0,242,255,0.35), 0 0 60px rgba(0,242,255,0.1); }
                    50%       { box-shadow: 0 0 40px rgba(0,242,255,0.55), 0 0 80px rgba(0,242,255,0.2); }
                }
                @keyframes be4t-shield-pulse {
                    0%, 100% { transform: scale(1);   filter: drop-shadow(0 0 8px rgba(0,242,255,0.6)); }
                    50%       { transform: scale(1.08); filter: drop-shadow(0 0 18px rgba(0,242,255,0.95)); }
                }
                @keyframes be4t-gate-slide-up {
                    from { transform: translateY(28px) scale(0.97); opacity: 0; }
                    to   { transform: translateY(0)    scale(1);    opacity: 1; }
                }
                .be4t-gate-btn-primary:hover {
                    transform: translateY(-2px) scale(1.02) !important;
                    box-shadow: 0 0 0 1px rgba(0,242,255,0.6), 0 8px 40px rgba(0,242,255,0.45) !important;
                }
                .be4t-gate-btn-ghost:hover {
                    background: rgba(255,255,255,0.08) !important;
                    color: rgba(255,255,255,0.7) !important;
                }
            `}</style>

            {/* Card */}
            <div style={{
                position: 'relative',
                width: '100%', maxWidth: '460px',
                background: 'linear-gradient(145deg, rgba(10,10,18,0.98) 0%, rgba(16,10,30,0.98) 100%)',
                border: '1px solid transparent',
                backgroundClip: 'padding-box',
                borderRadius: '24px',
                padding: '2.5rem 2.25rem',
                animation: mounted ? 'be4t-gate-slide-up 0.35s cubic-bezier(0.34,1.2,0.64,1) forwards' : 'none',
                /* Gradient border via pseudo-element workaround using outline */
                outline: '1px solid rgba(0,242,255,0.22)',
                outlineOffset: '-1px',
                boxShadow: '0 0 0 1px rgba(139,92,246,0.12), 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1, transition: 'all 0.2s',
                    }}
                    aria-label="Cerrar"
                >×</button>

                {/* Icon */}
                <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, rgba(0,242,255,0.15), rgba(0,0,0,0) 70%)',
                    border: '1px solid rgba(0,242,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.75rem',
                    animation: 'be4t-gate-glow 3s ease-in-out infinite',
                }}>
                    <Shield
                        size={32}
                        color="#00F2FF"
                        style={{ animation: 'be4t-shield-pulse 3s ease-in-out infinite' }}
                    />
                </div>

                {/* Headline */}
                <h2 style={{
                    margin: '0 0 0.75rem',
                    fontFamily: "'Inter Tight', 'Inter', sans-serif",
                    fontSize: '1.65rem', fontWeight: '800',
                    letterSpacing: '-0.03em', lineHeight: 1.2,
                    textAlign: 'center', color: '#ffffff',
                }}>
                    Asegura tu lugar<br />
                    <span style={{
                        background: 'linear-gradient(90deg, #00F2FF 0%, #8B5CF6 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>en la industria.</span>
                </h2>

                {/* Body */}
                <p style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.92rem', lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.55)',
                    textAlign: 'center',
                }}>
                    Para transformar la música en tu activo y desbloquear
                    los beneficios de la Bóveda, debes estar identificado.
                </p>

                {songName && (
                    <p style={{
                        margin: '0 0 2rem',
                        fontSize: '0.8rem', textAlign: 'center',
                        color: 'rgba(0,242,255,0.6)',
                    }}>
                        Intentando acceder a <strong style={{ color: '#00F2FF' }}>"{songName}"</strong>
                    </p>
                )}
                {!songName && <div style={{ marginBottom: '2rem' }} />}

                {/* Perks preview — 3 bullet points */}
                <div style={{
                    background: 'rgba(0,242,255,0.04)',
                    border: '1px solid rgba(0,242,255,0.1)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.75rem',
                    display: 'flex', flexDirection: 'column', gap: '0.65rem',
                }}>
                    {[
                        ['🎵', 'Royalties proporcionales al streaming real'],
                        ['🔐', 'Acceso exclusivo a la Bóveda de Perks'],
                        ['📊', 'Dashboard de rendimiento en tiempo real'],
                    ].map(([icon, text]) => (
                        <div key={text} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)',
                        }}>
                            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                            <span>{text}</span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <button
                    className="be4t-gate-btn-primary"
                    onClick={() => { onClose(); onLogin?.(); }}
                    style={{
                        width: '100%', padding: '0.95rem',
                        background: 'linear-gradient(90deg, #00C9D4 0%, #00F2FF 50%, #8B5CF6 100%)',
                        backgroundSize: '200% 100%',
                        border: 'none', borderRadius: '14px',
                        color: '#0a0a12', fontWeight: '900', fontSize: '1rem',
                        cursor: 'pointer', letterSpacing: '-0.01em',
                        boxShadow: '0 0 0 1px rgba(0,242,255,0.3), 0 4px 24px rgba(0,242,255,0.25)',
                        transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        marginBottom: '0.75rem',
                    }}
                >
                    <Shield size={16} />
                    Iniciar Sesión / Unirse a BE4T
                </button>

                {/* Ghost dismiss */}
                <button
                    className="be4t-gate-btn-ghost"
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '0.6rem',
                        background: 'transparent', border: 'none',
                        color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem',
                        cursor: 'pointer', borderRadius: '10px',
                        transition: 'all 0.2s',
                    }}
                >
                    Explorar sin cuenta
                </button>
            </div>
        </div>,
        document.body
    );
};

export default AuthGateModal;
