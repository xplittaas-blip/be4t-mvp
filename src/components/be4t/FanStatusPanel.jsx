import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── Perk rich metadata (images via gradient art + emoji) ──────────────────────
const PERK_DETAIL = {
    'Preventa VIP': {
        badgeUrl: '/fan_perk_badge_cyan_1777822449925.png',
        accent: '#00f0ff',
        glow: 'rgba(0, 240, 255, 0.4)',
        detailDescription: 'Recibes un código único de preventa 24 horas antes que el público general. Prioridad total en la selección de asientos para el próximo concierto del artista.',
        terms: 'El código se envía al email registrado 7 días antes del evento. Válido para 1 compra de máximo 4 entradas. No transferible.',
        unlockAmount: 100,
    },
    'Merch Edición Limitada': {
        badgeUrl: '/socio_perk_badge_blue_1777822472492.png',
        accent: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.4)',
        detailDescription: 'Gorra snapback premium + Vinilo 7" edición numerada y firmada a mano por el artista. Producción limitada a 500 unidades mundiales.',
        terms: 'Envío a domicilio en 4-6 semanas tras confirmar la inversión. Incluye certificado de autenticidad y número de serie único.',
        unlockAmount: 500,
    },
    'VIP Backstage Session': {
        badgeUrl: '/vip_perk_badge_gold_1777822496831.png',
        accent: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.4)',
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
        background: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    }}>
        <img src={detail.badgeUrl} alt={perk.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Tier badge */}
        <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.6)',
            border: `1px solid ${detail.accent}`,
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

    // Audio Feedback for Unlocks
    const prevUnlockedCount = useRef(unlockedCount);
    useEffect(() => {
        if (unlockedCount > prevUnlockedCount.current && unlockedCount > 0) {
            const audio = new Audio('https://cdn.freesound.org/previews/411/411460_5121236-lq.mp3');
            audio.volume = 0.4;
            audio.play().catch(() => {});
        }
        prevUnlockedCount.current = unlockedCount;
    }, [unlockedCount]);

    // Find the next locked perk
    const nextLockedPerk = perks.find(p => totalTokens < p.min_tokens);
    const tokensToNext = nextLockedPerk ? nextLockedPerk.min_tokens - totalTokens : 0;
    const amountToNext = nextLockedPerk ? Math.ceil(tokensToNext * tokenPrice) : 0;
    const progressPct = nextLockedPerk
        ? Math.min(100, (totalTokens / nextLockedPerk.min_tokens) * 100)
        : 100;

    const handleClose = useCallback(() => setActivePerk(null), []);

    const TIER_COLORS = {
        FAN:   { accent: '#00f0ff', glow: 'rgba(0, 240, 255, 0.15)', border: 'rgba(0, 240, 255, 0.35)' },
        SOCIO: { accent: '#3b82f6', glow: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)' },
        VIP:   { accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.35)' },
    };

    return (
        <>
            <style>{`
                @keyframes shimmerPulse {
                    0% { background-position: 200% center; box-shadow: 0 0 8px rgba(0,255,204,0.4); }
                    100% { background-position: -200% center; box-shadow: 0 0 16px rgba(0,255,204,0.8); }
                }
                @keyframes fomoBlink {
                    0% { opacity: 1; text-shadow: 0 0 8px rgba(0,255,204,0.8); }
                    100% { opacity: 0.7; text-shadow: none; }
                }
            `}</style>
            <div style={{
                background: 'rgba(5,5,15,0.9)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '16px',
                width: '100%',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{
                        fontSize: '0.62rem',
                        fontWeight: '800',
                        letterSpacing: '0.12em',
                        color: '#00f0ff',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                        🔒 BÓVEDA DE <span style={{ color: 'white' }}>EXCLUSIVIDAD</span>
                    </span>
                    <span style={{ 
                        fontSize: '0.8rem', 
                        color: unlockedCount === perks.length ? '#00f0ff' : 'rgba(255,255,255,0.4)', 
                        fontFamily: 'monospace',
                        fontWeight: '800',
                        transition: 'color 0.3s ease'
                    }}>
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
                                background: 'linear-gradient(90deg, #00FFCC 0%, #a855f7 50%, #00FFCC 100%)',
                                backgroundSize: '200% auto',
                                borderRadius: '100px',
                                boxShadow: '0 0 8px rgba(0,255,204,0.5)',
                                transition: 'width 0.5s cubic-bezier(0.25,0.8,0.25,1)',
                                animation: progressPct > 0 ? 'shimmerPulse 2s linear infinite' : 'none',
                            }} />
                        </div>
                        <p style={{
                            fontSize: '0.6rem',
                            color: progressPct > 90 ? '#00FFCC' : 'rgba(255,255,255,0.7)',
                            margin: 0,
                            fontWeight: progressPct > 90 ? '800' : '600',
                            letterSpacing: '0.02em'
                        }}>
                            {!nextLockedPerk ? '¡Nivel máximo alcanzado!' : `Estás a solo ${nextLockedPerk?.min_tokens - totalTokens} tokens del nivel ${nextLockedPerk?.label}`}
                        </p>
                    </div>
                )}

                {/* Tier cards horizontal grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {perks.map((perk, idx) => {
                        const isUnlocked = totalTokens >= perk.min_tokens;
                        const isNext = !isUnlocked && nextLockedPerk?.label === perk.label;
                        const colors = TIER_COLORS[perk.category] || TIER_COLORS.FAN;
                        const detail = PERK_DETAIL[perk.label] || {};

                        return (
                            <button
                                key={idx}
                                onClick={() => setActivePerk({ perk, isUnlocked })}
                                style={{
                                    all: 'unset',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    borderRadius: '16px',
                                    padding: '16px 10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    background: isUnlocked
                                        ? `linear-gradient(135deg, rgba(15,10,40,0.8) 0%, rgba(10,15,40,0.8) 100%)`
                                        : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${isUnlocked ? colors.accent : isNext ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                    boxShadow: isUnlocked ? `0 0 20px ${colors.glow}` : isNext ? '0 0 15px rgba(0,240,255,0.1)' : 'none',
                                    filter: isUnlocked ? 'none' : 'grayscale(100%) blur(1px)',
                                    opacity: isUnlocked ? 1 : 0.5,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    position: 'relative',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = `0 12px 30px ${colors.glow}`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = isUnlocked ? `0 0 20px ${colors.glow}` : 'none';
                                }}
                            >
                                {/* Badge Image */}
                                <div style={{
                                    width: '65px',
                                    height: '65px',
                                    borderRadius: '50%',
                                    marginBottom: '12px',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
                                }}>
                                    <img 
                                        src={detail.badgeUrl} 
                                        alt={perk.label} 
                                        className="perk-badge-coin"
                                        style={{ border: `2px solid ${colors.accent}` }}
                                    />
                                    {isUnlocked && (
                                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a0a0a', fontSize: '0.65rem', color: 'black' }}>
                                            ✓
                                        </div>
                                    )}
                                    {!isUnlocked && (
                                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>
                                            🔒
                                        </div>
                                    )}
                                </div>

                                {/* Label */}
                                <div style={{
                                    fontSize: '0.5rem',
                                    fontWeight: '800',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: colors.accent,
                                    marginBottom: '4px'
                                }}>
                                    {perk.category}
                                </div>
                                <div style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    marginBottom: '2px',
                                    lineHeight: 1.2
                                }}>
                                    {perk.label}
                                </div>
                                <div style={{
                                    fontSize: '0.58rem',
                                    color: 'rgba(255,255,255,0.4)',
                                    lineHeight: 1.3
                                }}>
                                    {perk.min_tokens}+ tk
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
