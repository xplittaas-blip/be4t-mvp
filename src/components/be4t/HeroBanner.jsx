import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Slide data ─────────────────────────────────────────────────────────────────
const SLIDES = [
    {
        id: 'b2b',
        badge: 'PARA SELLOS & ARTISTAS',
        badgeColor: '#06b6d4',
        badgeBg: 'rgba(6,182,212,0.12)',
        badgeBorder: 'rgba(6,182,212,0.3)',
        title: 'El Futuro de la\nGestión Musical',
        titleGradient: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 60%, #a855f7 100%)',
        subtitle: 'Todo comienza con la tokenización de activos musicales: integramos el valor de la música en la blockchain para empoderar a artistas, sellos discográficos y agentes autónomos. Optimizamos procesos operativos y desbloqueamos flujos de ingresos antes inaccesibles a través de la propiedad digital fraccionada.',
        cta: { label: 'Agendar Demo →', action: () => alert('Demo institucional: partners@be4t.com') },
        ctaStyle: 'border',        // white border pill
        accent: '#06b6d4',
        glow1: 'rgba(6,182,212,0.18)',
        glow2: 'rgba(139,92,246,0.10)',
        bgOverlay: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(6,182,212,0.14) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 20%, rgba(139,92,246,0.10) 0%, transparent 60%), #080812',
    },
    {
        id: 'fans',
        badge: 'PARA INVERSORES & FANS',
        badgeColor: '#a855f7',
        badgeBg: 'rgba(139,92,246,0.12)',
        badgeBorder: 'rgba(139,92,246,0.3)',
        title: 'Invierte en la\nMúsica que Amas',
        titleGradient: 'linear-gradient(135deg, #ffffff 0%, #a855f7 55%, #06b6d4 100%)',
        subtitle: 'Sé parte del éxito de tus artistas favoritos. En BE4T, transformamos los hits mundiales en activos invertibles. Participa en la economía de las regalías musicales y genera rendimientos con cada reproducción.',
        cta: { label: 'Explorar Marketplace →', action: null, page: 'explore' },
        ctaStyle: 'gradient',      // gradient fill pill
        accent: '#a855f7',
        glow1: 'rgba(139,92,246,0.18)',
        glow2: 'rgba(6,182,212,0.10)',
        bgOverlay: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(139,92,246,0.16) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 15%, rgba(6,182,212,0.08) 0%, transparent 60%), #080812',
    },
];

const INTERVAL = 8000; // 8 seconds — easy to read

// ── Subtle grid lines bg ──────────────────────────────────────────────────────
const GridBg = () => (
    <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern id="be4t-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#be4t-grid)" />
    </svg>
);

// ── HeroBanner Slider ─────────────────────────────────────────────────────────
const HeroBanner = ({ userMode, onNavigate }) => {
    const [active, setActive]   = useState(0);
    const [fading, setFading]   = useState(false);
    const [visible, setVisible] = useState(0);
    const timerRef              = useRef(null);

    const goTo = useCallback((idx) => {
        if (idx === active || fading) return;
        setFading(true);
        setTimeout(() => {
            setVisible(idx);
            setActive(idx);
            setFading(false);
        }, 420);
    }, [active, fading]);

    const next = useCallback(() => goTo((active + 1) % SLIDES.length), [active, goTo]);

    useEffect(() => {
        timerRef.current = setInterval(next, INTERVAL);
        return () => clearInterval(timerRef.current);
    }, [next]);

    const pause  = () => clearInterval(timerRef.current);
    const resume = () => { timerRef.current = setInterval(next, INTERVAL); };

    // ── Disquera mode (unchanged) ──────────────────────────────────────────
    if (userMode === 'disquera') {
        return (
            <div style={{ padding: '3.5rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '100px', padding: '0.3rem 0.85rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#2dd4bf', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Infraestructura B2B</span>
                </div>
                <h1 style={{ fontFamily: "'Inter Tight','Inter',sans-serif", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem' }}>
                    Transforma tu catálogo<br />en liquidez inmediata
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px', marginBottom: '2rem' }}>
                    Tokeniza los derechos de regalías de tu catálogo, accede a capital anticipado y despliega tu propio marketplace bajo tu marca en menos de 72 horas.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '900px', margin: '0 auto 2rem' }}>
                    {[
                        { title: 'Liquidez sin Deuda',                  desc: 'Adelanta el flujo de caja de tus regalías de los próximos 5 años mediante la securitización de activos.' },
                        { title: 'Infraestructura Marca Blanca (TaaS)', desc: 'Tu propio marketplace con tu identidad visual. Tus fans invierten en tus artistas bajo tu dominio.' },
                        { title: 'Automatización de Operaciones',       desc: 'Elimina la carga administrativa. Automatiza el cálculo de splits, reportes de regalías y distribución de pagos.' },
                        { title: 'Cumplimiento y Seguridad',            desc: 'Operamos bajo estándares de tokenización institucional (ERC-3643), garantizando cumplimiento global.' },
                    ].map(card => (
                        <div key={card.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                            <div style={{ width: '3px', height: '24px', background: 'linear-gradient(180deg,#06b6d4,#7c3aed)', borderRadius: '2px', marginBottom: '1rem' }} />
                            <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.6rem' }}>{card.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const slide = SLIDES[visible];

    return (
        <div
            onMouseEnter={pause}
            onMouseLeave={resume}
            style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: '0 0 32px 32px',
                minHeight: 'clamp(480px, 60vw, 640px)',
                display: 'flex', alignItems: 'center',
                background: slide.bgOverlay,
                transition: 'background 0.8s ease',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800;900&display=swap');

                @keyframes be4t-hero-in  {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes be4t-hero-out {
                    from { opacity: 1; transform: translateY(0); }
                    to   { opacity: 0; transform: translateY(-14px); }
                }
                @keyframes be4t-glow-pulse {
                    0%,100% { opacity: 0.6; }
                    50%     { opacity: 1; }
                }
                @keyframes be4t-progress-${INTERVAL} {
                    from { width: 0%; }
                    to   { width: 100%; }
                }

                .be4t-hero-slide {
                    animation: be4t-hero-in 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
                }
                .be4t-hero-slide.fading {
                    animation: be4t-hero-out 0.35s ease forwards;
                }

                /* ── Progress line ── */
                .be4t-h-progress-track {
                    height: 2px;
                    background: rgba(255,255,255,0.12);
                    border-radius: 2px;
                    overflow: hidden;
                    flex: 1;
                }
                .be4t-h-progress-fill {
                    height: 100%;
                    border-radius: 2px;
                    animation: be4t-progress-${INTERVAL} ${INTERVAL}ms linear forwards;
                }

                /* ── CTA hover ── */
                .be4t-hero-cta { transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease; }
                .be4t-hero-cta:hover { transform: scale(1.03) !important; opacity: 0.92; }

                /* ── Responsive ── */
                @media (max-width: 480px) {
                    .be4t-hero-title-el  { font-size: clamp(2rem, 10vw, 2.6rem) !important; }
                    .be4t-hero-subtitle  { font-size: 0.84rem !important; -webkit-line-clamp: 5; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
                    .be4t-hero-pad       { padding: 3.5rem 1.25rem 3.5rem !important; }
                    .be4t-hero-badge-el  { font-size: 0.58rem !important; }
                }
                @media (min-width: 481px) and (max-width: 767px) {
                    .be4t-hero-title-el  { font-size: clamp(2.4rem, 7vw, 3rem) !important; }
                    .be4t-hero-pad       { padding: 4rem 1.5rem !important; }
                }
            `}</style>

            {/* ── Subtle grid ── */}
            <GridBg />

            {/* ── Ambient glow blobs ── */}
            <div style={{
                position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)',
                width: '70%', height: '50%',
                background: `radial-gradient(ellipse at center, ${slide.glow1} 0%, transparent 65%)`,
                pointerEvents: 'none', animation: 'be4t-glow-pulse 4s ease-in-out infinite',
                transition: 'background 0.8s ease',
            }} />
            <div style={{
                position: 'absolute', top: '-15%', right: '-5%',
                width: '45%', height: '60%',
                background: `radial-gradient(ellipse at top right, ${slide.glow2} 0%, transparent 60%)`,
                pointerEvents: 'none',
                transition: 'background 0.8s ease',
            }} />

            {/* ── Top vignette ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, rgba(8,8,18,0.5) 0%, transparent 100%)', pointerEvents: 'none' }} />
            {/* ── Bottom vignette ── */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(8,8,18,0.6) 0%, transparent 100%)', pointerEvents: 'none' }} />

            {/* ── Slide content — centrado estilo Revelator ── */}
            <div
                key={visible}
                className={`be4t-hero-pad be4t-hero-slide${fading ? ' fading' : ''}`}
                style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', maxWidth: '1280px', margin: '0 auto',
                    padding: '5rem 2rem 5.5rem',
                    textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}
            >
                {/* ── Badge ── */}
                <div
                    className="be4t-hero-badge-el"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: slide.badgeBg,
                        border: `1px solid ${slide.badgeBorder}`,
                        borderRadius: '100px', padding: '0.35rem 1.1rem',
                        marginBottom: '1.6rem',
                        fontSize: '0.65rem', color: slide.badgeColor,
                        fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px',
                        fontFamily: "'Inter Tight','Inter',sans-serif",
                    }}
                >
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: slide.badgeColor, boxShadow: `0 0 6px ${slide.badgeColor}` }} />
                    {slide.badge}
                </div>

                {/* ── Giant headline ── */}
                <h1
                    className="be4t-hero-title-el"
                    style={{
                        fontFamily: "'Inter Tight', 'Inter', -apple-system, sans-serif",
                        fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                        fontWeight: '900',
                        letterSpacing: '-0.045em',
                        lineHeight: 1.05,
                        marginBottom: '1.5rem',
                        maxWidth: '800px',
                        background: slide.titleGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        whiteSpace: 'pre-line',   // respects \n in title string
                    }}
                >
                    {slide.title}
                </h1>

                {/* ── Subtitle ── */}
                <p
                    className="be4t-hero-subtitle"
                    style={{
                        color: 'rgba(255,255,255,0.55)',
                        fontSize: '1.05rem',
                        lineHeight: 1.72,
                        maxWidth: '640px',
                        marginBottom: '2.5rem',
                        fontWeight: '400',
                    }}
                >
                    {slide.subtitle}
                </p>

                {/* ── CTA ── */}
                <button
                    className="be4t-hero-cta"
                    onClick={() => {
                        if (slide.cta.action) { slide.cta.action(); }
                        else if (slide.cta.page && onNavigate) { onNavigate(slide.cta.page); }
                    }}
                    style={
                        slide.ctaStyle === 'border'
                            ? {
                                // Revelator-style white border pill
                                padding: '1rem 2.5rem', minHeight: '56px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.55)',
                                borderRadius: '100px',
                                color: 'white', fontWeight: '700', fontSize: '1rem',
                                cursor: 'pointer', letterSpacing: '-0.01em',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 0 0 0 transparent',
                                fontFamily: "'Inter Tight','Inter',sans-serif",
                            }
                            : {
                                // Gradient neon pill
                                padding: '1rem 2.5rem', minHeight: '56px',
                                background: 'linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4)',
                                border: 'none', borderRadius: '100px',
                                color: 'white', fontWeight: '800', fontSize: '1rem',
                                cursor: 'pointer', letterSpacing: '-0.01em',
                                boxShadow: '0 4px 32px rgba(124,58,237,0.45)',
                                fontFamily: "'Inter Tight','Inter',sans-serif",
                            }
                    }
                >
                    {slide.cta.label}
                </button>

                {/* ── Slide indicators — centrados debajo del CTA ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '3.5rem' }}>
                    {SLIDES.map((s, i) => (
                        <button
                            key={s.id}
                            onClick={() => goTo(i)}
                            aria-label={`Slide ${i + 1}`}
                            style={{
                                padding: 0, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                                background: 'transparent',
                            }}
                        >
                            {/* Progress track for active, dot for inactive */}
                            {active === i ? (
                                <div className="be4t-h-progress-track" style={{ width: '56px' }}>
                                    <div
                                        key={`${active}-fill`}
                                        className="be4t-h-progress-fill"
                                        style={{ background: `linear-gradient(90deg, ${slide.accent}, white)` }}
                                    />
                                </div>
                            ) : (
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', transition: 'background 0.3s' }} />
                            )}
                        </button>
                    ))}
                    <span style={{
                        fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)',
                        fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace',
                    }}>
                        {String(active + 1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
