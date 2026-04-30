import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ── Perk rich metadata (images via gradient art + emoji) ──────────────────────
const PERK_DETAIL = {
    'Preventa VIP': {
        gradient: 'linear-gradient(135deg, #1a0533 0%, #3b0764 50%, #0c0a1a 100%)',
        accent: '#00FFCC',
        glow: 'rgba(0,255,204,0.3)',
        bg: 'rgba(0,255,204,0.08)',
        border: 'rgba(0,255,204,0.3)',
        detailDescription: 'Recibes un código único de preventa 24 horas antes que el público general. Prioridad total en la selección de asientos para el próximo concierto del artista.',
        terms: 'El código se envía al email registrado 7 días antes del evento. Válido para 1 compra de máximo 4 entradas. No transferible.',
        unlockAmount: 100,
    },
    'Merch Edición Limitada': {
        gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #0f0a1a 100%)',
        accent: '#a855f7',
        glow: 'rgba(168,85,247,0.3)',
        bg: 'rgba(168,85,247,0.08)',
        border: 'rgba(168,85,247,0.3)',
        detailDescription: 'Gorra snapback premium + Vinilo 7" edición numerada y firmada a mano por el artista. Producción limitada a 500 unidades mundiales.',
        terms: 'Envío a domicilio en 4-6 semanas tras confirmar la inversión. Incluye certificado de autenticidad y número de serie único.',
        unlockAmount: 500,
    },
    'VIP Backstage Session': {
        gradient: 'linear-gradient(135deg, #1a1000 0%, #78350f 50%, #0a0800 100%)',
        accent: '#f59e0b',
        glow: 'rgba(245,158,11,0.3)',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.3)',
        detailDescription: 'Meet & Greet privado con el artista en el backstage. Acceso a la prueba de sonido 2 horas antes del show y sesión de fotos exclusiva con polaroid.',
        terms: 'Limitado a 10 inversores por concierto. Coordinación por email 2 semanas antes del evento. Requiere verificación de identidad.',
        unlockAmount: 2500,
    },
};

// ── Perk images (hero art using CSS gradients + icon) ─────────────────────────
const PerkHeroArt = ({ perk, detail }) => (
    <div style={{
        width: '100%',
        height: '180px',
        borderRadius: '16px 16px 0 0',
        background: detail.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    }}>
        {/* Neon glow orb */}
        <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${detail.glow} 0%, transparent 70%)`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }} />
        {/* Main icon */}
        <span style={{ fontSize: '5rem', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
            {perk.icon}
        </span>
        {/* Tier badge */}
        <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: detail.bg,
            border: `1px solid ${detail.border}`,
            borderRadius: '100px',
            padding: '4px 10px',
            fontSize: '0.55rem',
            fontWeight: '800',
            letterSpacing: '0.15em',
            color: detail.accent,
            textTransform: 'uppercase',
        }}>
            TIER · {perk.category}
        </div>
        {/* Token requirement */}
        <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px',
            padding: '4px 10px',
            fontSize: '0.6rem',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.7)',
        }}>
            {perk.min_tokens.toLocaleString()}+ tokens requeridos
        </div>
    </div>
);

// ── Perk Modal ────────────────────────────────────────────────────────────────
const PerkModal = ({ perk, isUnlocked, calcAmount, tokenPrice, onClose, onScrollToSlider }) => {
    const detail = PERK_DETAIL[perk.label] || {};
    const tokensNeeded = perk.min_tokens;
    const currentTotal = Math.floor(calcAmount / tokenPrice);
    const tokensShort = Math.max(0, tokensNeeded - currentTotal);
    const amountShort = Math.ceil(tokensShort * tokenPrice);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                animation: 'perkModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
        >
            <style>{`
                @keyframes perkModalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(12px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
                @keyframes perkShimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
            `}</style>

            {/* Modal card */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    borderRadius: '20px',
                    background: 'rgba(8,8,20,0.95)',
                    border: `1px solid ${detail.border || 'rgba(255,255,255,0.1)'}`,
                    boxShadow: `0 0 60px ${detail.glow || 'rgba(0,0,0,0.5)'}`,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Hero art */}
                <PerkHeroArt perk={perk} detail={detail} />

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>

                    {/* Title row */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            color: 'white',
                            margin: '0 0 4px',
                            letterSpacing: '-0.02em',
                        }}>
                            {perk.label}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                            {perk.description}
                        </p>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1rem' }} />

                    {/* Detail description */}
                    <p style={{
                        fontSize: '0.85rem',
                        lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.72)',
                        margin: '0 0 1rem',
                    }}>
                        {detail.detailDescription}
                    </p>

                    {/* Terms */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        marginBottom: '1.25rem',
                    }}>
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.6 }}>
                            <span style={{ fontWeight: '700', color: 'rgba(255,255,255,0.45)' }}>Términos:</span>{' '}
                            {detail.terms}
                        </p>
                    </div>

                    {/* CTA */}
                    {isUnlocked ? (
                        <div style={{
                            background: detail.bg,
                            border: `1px solid ${detail.border}`,
                            borderRadius: '14px',
                            padding: '14px 20px',
                            textAlign: 'center',
                            boxShadow: `0 0 20px ${detail.glow}`,
                        }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🎉</div>
                            <div style={{ fontWeight: '800', color: detail.accent, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                                ¡Beneficio Asegurado!
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                                Completa tu inversión para recibirlo
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => { onClose(); setTimeout(() => onScrollToSlider?.(), 100); }}
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                background: `linear-gradient(135deg, ${detail.accent}22 0%, ${detail.accent}11 100%)`,
                                border: `1px solid ${detail.border}`,
                                borderRadius: '14px',
                                color: detail.accent,
                                fontWeight: '800',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                letterSpacing: '-0.01em',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 0 20px ${detail.glow}`,
                                backgroundSize: '200% auto',
                                animation: 'perkShimmer 3s linear infinite',
                            }}
                        >
                            Invertir ${amountShort.toLocaleString()} más para desbloquear →
                        </button>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                    }}
                >
                    ✕
                </button>
            </div>
        </div>,
        document.body
    );
};

// ── Main FanStatusPanel ───────────────────────────────────────────────────────
export default function FanStatusPanel({
    perks = [],
    currentTokens = 0,
    projectedTokens = 0,
    calcAmount = 0,
    tokenPrice = 10,
    onScrollToSlider,
}) {
    const [activePerk, setActivePerk] = useState(null);
    const totalTokens = (currentTokens || 0) + (projectedTokens || 0);
    const unlockedCount = perks.filter(p => totalTokens >= p.min_tokens).length;

    // Find the next locked perk
    const nextLockedPerk = perks.find(p => totalTokens < p.min_tokens);
    const tokensToNext = nextLockedPerk ? nextLockedPerk.min_tokens - totalTokens : 0;
    const amountToNext = nextLockedPerk ? Math.ceil(tokensToNext * tokenPrice) : 0;
    const progressPct = nextLockedPerk
        ? Math.min(100, (totalTokens / nextLockedPerk.min_tokens) * 100)
        : 100;

    const handleClose = useCallback(() => setActivePerk(null), []);

    const TIER_COLORS = {
        FAN:   { accent: '#00FFCC', glow: 'rgba(0,255,204,0.15)', border: 'rgba(0,255,204,0.35)' },
        SOCIO: { accent: '#a855f7', glow: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.35)' },
        VIP:   { accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
    };

    return (
        <>
            <div style={{
                background: 'rgba(5,5,15,0.9)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '16px',
                width: '100%',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{
                        fontSize: '0.58rem',
                        fontWeight: '800',
                        letterSpacing: '0.12em',
                        color: '#00FFCC',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                        <span style={{ fontSize: '0.9rem' }}>✨</span>
                        TU ESTATUS: BENEFICIOS EXCLUSIVOS
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                        {unlockedCount}/{perks.length}
                    </span>
                </div>

                {/* Progress bar to next perk */}
                {nextLockedPerk && totalTokens > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{
                            height: '4px',
                            background: 'rgba(255,255,255,0.07)',
                            borderRadius: '100px',
                            overflow: 'hidden',
                            marginBottom: '6px',
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${progressPct}%`,
                                background: 'linear-gradient(90deg, #00FFCC, #a855f7)',
                                borderRadius: '100px',
                                boxShadow: '0 0 8px rgba(0,255,204,0.5)',
                                transition: 'width 0.5s cubic-bezier(0.25,0.8,0.25,1)',
                            }} />
                        </div>
                        <p style={{
                            fontSize: '0.6rem',
                            color: '#00FFCC',
                            margin: 0,
                            fontWeight: '600',
                            letterSpacing: '0.02em',
                        }}>
                            ⚡ ¡Estás a solo <strong>${amountToNext.toLocaleString()}</strong> de desbloquear <strong>{nextLockedPerk.label}</strong>!
                        </p>
                    </div>
                )}

                {/* Tier cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {perks.map((perk, idx) => {
                        const isUnlocked = totalTokens >= perk.min_tokens;
                        const colors = TIER_COLORS[perk.category] || TIER_COLORS.FAN;
                        const detail = PERK_DETAIL[perk.label] || {};

                        return (
                            <button
                                key={idx}
                                onClick={() => setActivePerk({ perk, isUnlocked })}
                                style={{
                                    all: 'unset',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    borderRadius: '12px',
                                    padding: '12px 14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.35s cubic-bezier(0.25,0.8,0.25,1)',
                                    background: isUnlocked
                                        ? `linear-gradient(135deg, ${colors.glow} 0%, transparent 100%)`
                                        : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${isUnlocked ? colors.border : 'rgba(255,255,255,0.05)'}`,
                                    boxShadow: isUnlocked ? `0 0 20px ${colors.glow}` : 'none',
                                    filter: isUnlocked ? 'none' : 'grayscale(70%)',
                                    opacity: isUnlocked ? 1 : 0.6,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = isUnlocked ? `0 4px 24px ${colors.glow}` : '0 4px 16px rgba(0,0,0,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.opacity = isUnlocked ? '1' : '0.6';
                                    e.currentTarget.style.filter = isUnlocked ? 'none' : 'grayscale(70%)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = isUnlocked ? `0 0 20px ${colors.glow}` : 'none';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    flexShrink: 0,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                    background: isUnlocked ? colors.glow : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${isUnlocked ? colors.border : 'transparent'}`,
                                    boxShadow: isUnlocked ? `0 0 12px ${colors.glow}` : 'none',
                                }}>
                                    {perk.icon}
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                    <div style={{
                                        fontSize: '0.52rem',
                                        fontWeight: '700',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        color: isUnlocked ? colors.accent : 'rgba(255,255,255,0.3)',
                                        marginBottom: '2px',
                                    }}>
                                        TIER · {perk.category} · {perk.min_tokens.toLocaleString()}+ tokens
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        color: isUnlocked ? 'white' : 'rgba(255,255,255,0.45)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {perk.label}
                                    </div>
                                    <div style={{
                                        fontSize: '0.62rem',
                                        color: 'rgba(255,255,255,0.3)',
                                        marginTop: '1px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {perk.description}
                                    </div>
                                </div>

                                {/* Status + arrow */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                                    <div style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        background: isUnlocked ? colors.glow : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${isUnlocked ? colors.border : 'rgba(255,255,255,0.08)'}`,
                                        color: isUnlocked ? colors.accent : 'rgba(255,255,255,0.25)',
                                        fontWeight: '800',
                                    }}>
                                        {isUnlocked ? '✓' : '🔒'}
                                    </div>
                                    <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)' }}>ver</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                {unlockedCount < perks.length ? (
                    <div style={{
                        marginTop: '10px',
                        textAlign: 'center',
                        fontSize: '0.55rem',
                        fontWeight: '700',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.2)',
                    }}>
                        Toca un beneficio para ver los detalles →
                    </div>
                ) : (
                    <div style={{
                        marginTop: '10px',
                        textAlign: 'center',
                        fontSize: '0.62rem',
                        fontWeight: '800',
                        color: '#00FFCC',
                        letterSpacing: '0.08em',
                        textShadow: '0 0 12px rgba(0,255,204,0.6)',
                    }}>
                        🎉 TODOS LOS PERKS DESBLOQUEADOS
                    </div>
                )}
            </div>

            {/* Modal portal */}
            {activePerk && (
                <PerkModal
                    perk={activePerk.perk}
                    isUnlocked={activePerk.isUnlocked}
                    calcAmount={calcAmount}
                    tokenPrice={tokenPrice}
                    onClose={handleClose}
                    onScrollToSlider={onScrollToSlider}
                />
            )}
        </>
    );
}
