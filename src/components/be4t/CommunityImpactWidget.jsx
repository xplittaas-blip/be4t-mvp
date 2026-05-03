/**
 * CommunityImpactWidget.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tarea 1: Widget de 'Impacto de Comunidad' para cada página de canción.
 * Shows: active investors, fan-driven growth estimate, share-to-earn CTA.
 *
 * Tarea 2: 'Share to Earn' button — triggers native share sheet or
 * shows a styled modal with deep link + thank-you feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import { isShowcase } from '../../core/env';

// ── Deterministic pseudo-random seeded to songId ──────────────────────────────
function seeded(songId, offset = 0) {
    let h = 5381;
    const s = String(songId || 'be4t') + offset;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
    return Math.abs(h);
}

// ── Live investor counter (ticks up slowly) ───────────────────────────────────
function useLiveCounter(base, intervalMs = 18000) {
    const [count, setCount] = useState(base);
    useEffect(() => {
        const id = setInterval(() => {
            setCount(c => c + Math.floor(Math.random() * 3)); // +0, +1, or +2 per interval
        }, intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return count;
}

// ── Share modal ───────────────────────────────────────────────────────────────
const ShareSuccessToast = ({ song, onDismiss }) => (
    <div style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
        border: '1px solid rgba(16,185,129,0.4)',
        borderRadius: '16px', padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        maxWidth: '420px', width: 'calc(100vw - 3rem)',
        animation: 'shareToastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        color: 'white', fontFamily: "'Inter', sans-serif",
    }}>
        <style>{`
            @keyframes shareToastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.94); }
                to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
            }
        `}</style>
        <span style={{ fontSize: '1.5rem' }}>🎉</span>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '2px' }}>
                ¡Gracias por impulsar tu activo!
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                Cada stream cuenta para tu retorno mensual.
                Compartir <strong style={{ color: '#10b981' }}>{song?.title || 'esta canción'}</strong> genera
                visibilidad que aumenta el flujo de las regalías.
            </div>
        </div>
        <button
            onClick={onDismiss}
            style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: '1.1rem', cursor: 'pointer', flexShrink: 0, padding: '2px 4px',
            }}
        >✕</button>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CommunityImpactWidget = ({ song, investorsCount: propInvestors }) => {
    const [showToast, setShowToast]   = useState(false);
    const [shareState, setShareState] = useState('idle'); // idle | sharing | done

    // Seeded realistic investor count based on songId
    const baseInvestors = propInvestors
        || ((seeded(song?.id, 1) % 600) + 120);   // 120–720 range
    const liveInvestors = useLiveCounter(baseInvestors);

    // Fan-driven growth estimate: 0.3%–2.1% added by community promotion
    const fanGrowthPct  = (((seeded(song?.id, 7) % 18) + 3) / 10).toFixed(1); // 0.3–2.1%
    const marketingUSD  = ((seeded(song?.id, 13) % 8000) + 2000); // $2k–$10k saved

    // Monthly projected earnings per investor (based on APY 12-15%)
    const avgAPY         = 12 + ((seeded(song?.id, 3) % 30) / 10); // 12.0–15.0%
    const avgInvestment  = 500; // typical demo ticket
    const monthlyPerUser = (avgInvestment * avgAPY / 100 / 12).toFixed(2);

    const handleShare = async () => {
        setShareState('sharing');
        const shareUrl  = window.location.href;
        const shareText = `🎵 Acabo de invertir en "${song?.title || 'este hit'}" de ${song?.artist || 'mi artista favorito'} vía BE4T. Mi inversión genera regalías en tiempo real — ¡el futuro de la música! 🚀`;

        try {
            if (navigator.share) {
                await navigator.share({ title: 'BE4T — Inversión Musical', text: shareText, url: shareUrl });
            } else {
                // Fallback: copy to clipboard + open Twitter
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                    '_blank', 'noopener,noreferrer'
                );
            }
            setShareState('done');
            setShowToast(true);
            setTimeout(() => { setShareState('idle'); setShowToast(false); }, 6000);
        } catch {
            setShareState('idle');
        }
    };

    return (
        <>
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                padding: '1.5rem',
                marginTop: '1.5rem',
                fontFamily: "'Inter', sans-serif",
            }}>
                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '1rem' }}>🌐</span>
                    <h3 style={{
                        fontSize: '0.75rem', fontWeight: '800', margin: 0,
                        textTransform: 'uppercase', letterSpacing: '1.5px',
                        color: 'rgba(255,255,255,0.5)',
                    }}>
                        Impacto de Comunidad
                    </h3>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)',
                        borderRadius: '100px', padding: '2px 8px',
                        fontSize: '0.58rem', color: '#10b981', fontWeight: '700',
                        marginLeft: 'auto',
                    }}>
                        <span style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: '#10b981', display: 'inline-block',
                            animation: 'be4t-nav-pulse 1.8s ease infinite',
                        }} />
                        LIVE
                    </span>
                </div>

                {/* ── Stat grid ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem', marginBottom: '1.25rem',
                }}>
                    {/* Investors */}
                    <div style={{
                        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)',
                        borderRadius: '14px', padding: '1rem 0.75rem', textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.04em',
                            color: '#a855f7', fontFamily: "'Courier New', monospace",
                            textShadow: '0 0 12px rgba(168,85,247,0.4)',
                        }}>
                            {liveInvestors.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: '600' }}>
                            Inversores activos
                        </div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(168,85,247,0.7)', marginTop: '2px' }}>
                            promocionando este hit
                        </div>
                    </div>

                    {/* Fan Growth */}
                    <div style={{
                        background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)',
                        borderRadius: '14px', padding: '1rem 0.75rem', textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.04em',
                            color: '#10b981', fontFamily: "'Courier New', monospace",
                            textShadow: '0 0 12px rgba(16,185,129,0.4)',
                        }}>
                            +{fanGrowthPct}%
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: '600' }}>
                            Crecimiento de fans
                        </div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(16,185,129,0.7)', marginTop: '2px' }}>
                            impulsado por marketing viral
                        </div>
                    </div>

                    {/* Monthly per user */}
                    <div style={{
                        background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)',
                        borderRadius: '14px', padding: '1rem 0.75rem', textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.04em',
                            color: '#06b6d4', fontFamily: "'Courier New', monospace",
                            textShadow: '0 0 12px rgba(6,182,212,0.35)',
                        }}>
                            ${monthlyPerUser}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: '600' }}>
                            Regalías/mes promedio
                        </div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(6,182,212,0.7)', marginTop: '2px' }}>
                            por inversor activo
                        </div>
                    </div>
                </div>

                {/* ── Marketing savings bar ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                    padding: '0.85rem 1rem', marginBottom: '1.25rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                            📣 Ahorro en Marketing de Fans
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', lineHeight: 1.4 }}>
                            La comunidad de inversores genera{' '}
                            <span style={{ color: '#f97316', fontWeight: '800' }}>
                                ${marketingUSD.toLocaleString()} USD
                            </span>{' '}
                            en promoción orgánica estimada este mes.
                        </div>
                    </div>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📊</span>
                </div>

                {/* ── Share to Earn CTA ── */}
                <button
                    onClick={handleShare}
                    disabled={shareState === 'sharing'}
                    style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        background: shareState === 'done'
                            ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                            : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
                        backgroundSize: '200% auto',
                        border: 'none', borderRadius: '14px',
                        color: 'white', fontWeight: '800', fontSize: '0.9rem',
                        cursor: shareState === 'sharing' ? 'wait' : 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: shareState === 'done'
                            ? '0 4px 20px rgba(16,185,129,0.4)'
                            : '0 4px 20px rgba(124,58,237,0.4)',
                        letterSpacing: '-0.01em',
                    }}
                    onMouseOver={e => { if (shareState === 'idle') { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundPosition = 'right center'; } }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundPosition = 'left center'; }}
                >
                    {shareState === 'done'
                        ? '✅ ¡Activo impulsado! Tu red está generando streams'
                        : shareState === 'sharing'
                        ? '⏳ Abriendo...'
                        : '📲 Compartir para Impulsar mi Inversión'}
                </button>

                <p style={{
                    textAlign: 'center', fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)',
                    margin: '0.6rem 0 0', lineHeight: 1.5,
                }}>
                    Cada share = más streams = mayor flujo de regalías para tu inversión
                    {isShowcase && ' · Modo simulación'}
                </p>
            </div>

            {/* ── Toast ── */}
            {showToast && <ShareSuccessToast song={song} onDismiss={() => setShowToast(false)} />}
        </>
    );
};

export default CommunityImpactWidget;
