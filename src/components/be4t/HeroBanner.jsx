import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Slide data ─────────────────────────────────────────────────────────────────
const SLIDES = [
    {
        id: 'royalties',
        badge: 'REGALÍAS MUSICALES',
        badgeColor: '#10b981',
        badgeBg: 'rgba(16,185,129,0.1)',
        badgeBorder: 'rgba(16,185,129,0.3)',
        title: 'Haz que la música\ntrabaje para ti',
        titleGradient: 'linear-gradient(135deg, #ffffff 0%, #10b981 60%, #06b6d4 100%)',
        subtitle: 'Compra derechos de canciones y recibe regalías trimestrales directamente en tu cuenta.',
        cta: { label: 'Ver Activos →', action: null, page: 'explore' },
        ctaStyle: 'gradient-green',
        accent: '#10b981',
        glow1: 'rgba(16,185,129,0.16)',
        glow2: 'rgba(6,182,212,0.08)',
        bgOverlay: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(16,185,129,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 20%, rgba(6,182,212,0.08) 0%, transparent 60%), #080812',
    },
    {
        id: 'latam',
        badge: 'MERCADO EN CRECIMIENTO',
        badgeColor: '#06b6d4',
        badgeBg: 'rgba(6,182,212,0.1)',
        badgeBorder: 'rgba(6,182,212,0.3)',
        title: 'Diversifica con\nel éxito de Latam',
        titleGradient: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 55%, #6366f1 100%)',
        subtitle: 'Invierte en un mercado que crece al 19% anual y protege tu capital de la volatilidad.',
        cta: { label: 'Explorar Yields →', action: null, page: 'explore' },
        ctaStyle: 'gradient',
        accent: '#06b6d4',
        glow1: 'rgba(6,182,212,0.18)',
        glow2: 'rgba(99,102,241,0.10)',
        bgOverlay: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(6,182,212,0.14) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 15%, rgba(99,102,241,0.10) 0%, transparent 60%), #080812',
    },
    {
        id: 'ip',
        badge: 'PROPIEDAD INTELECTUAL',
        badgeColor: '#a855f7',
        badgeBg: 'rgba(168,85,247,0.1)',
        badgeBorder: 'rgba(168,85,247,0.3)',
        title: 'Sé dueño legal de\nla propiedad intelectual',
        titleGradient: 'linear-gradient(135deg, #ffffff 0%, #a855f7 55%, #06b6d4 100%)',
        subtitle: 'Adquiere fracciones de derechos de artistas emergentes y participa de sus ganancias de por vida.',
        cta: { label: 'Invertir ahora →', action: null, page: 'explore' },
        ctaStyle: 'gradient',
        accent: '#a855f7',
        glow1: 'rgba(168,85,247,0.18)',
        glow2: 'rgba(6,182,212,0.10)',
        bgOverlay: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(168,85,247,0.14) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 15%, rgba(6,182,212,0.08) 0%, transparent 60%), #080812',
    },
];

const INTERVAL    = 9000; // 9s auto-advance
const SWIPE_THRESHOLD = 50; // px to confirm swipe intent
const VELOCITY_THRESHOLD = 0.3; // px/ms — fast flick counts even < threshold

// ── Subtle grid bg ─────────────────────────────────────────────────────────────
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

// ── CTA style helper ───────────────────────────────────────────────────────────
function ctaStyle(style) {
    const base = {
        padding: '0.9rem 2rem',
        minHeight: '52px',
        border: 'none', borderRadius: '100px',
        color: 'white', fontWeight: '800',
        fontSize: 'clamp(0.88rem, 2.5vw, 1rem)',
        cursor: 'pointer', letterSpacing: '-0.01em',
        fontFamily: "'Inter Tight','Inter',sans-serif",
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
    };
    if (style === 'border') return { ...base, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)' };
    if (style === 'gradient-green') return { ...base, background: 'linear-gradient(135deg, #065f46, #10b981)', boxShadow: '0 4px 32px rgba(16,185,129,0.4)' };
    return { ...base, background: 'linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4)', boxShadow: '0 4px 32px rgba(124,58,237,0.45)' };
}

// ── HeroBanner with native touch swipe ────────────────────────────────────────
const HeroBanner = ({ userMode, onNavigate }) => {
    const [active,  setActive]  = useState(0);
    const [dragX,   setDragX]   = useState(0);   // live drag offset px
    const [isDragging, setIsDragging] = useState(false);
    const timerRef   = useRef(null);
    const touchStart = useRef(null); // { x, y, t }
    const containerRef = useRef(null);

    // ── Navigate to slide ──────────────────────────────────────────────────────
    const goTo = useCallback((idx) => {
        const clamped = Math.max(0, Math.min(SLIDES.length - 1, idx));
        setActive(clamped);
        setDragX(0);
    }, []);

    const next = useCallback(() => goTo((active + 1) % SLIDES.length), [active, goTo]);
    const prev = useCallback(() => goTo((active - 1 + SLIDES.length) % SLIDES.length), [active, goTo]);

    // ── Auto-advance ───────────────────────────────────────────────────────────
    const resetTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(next, INTERVAL);
    }, [next]);

    useEffect(() => {
        timerRef.current = setInterval(next, INTERVAL);
        return () => clearInterval(timerRef.current);
    }, [next]);

    // ── Touch handlers — unified pointer + touch ───────────────────────────────
    const onTouchStart = useCallback((e) => {
        const t = e.touches?.[0] ?? e;
        touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
        setIsDragging(true);
        clearInterval(timerRef.current); // pause auto-advance while dragging
    }, []);

    const onTouchMove = useCallback((e) => {
        if (!touchStart.current) return;
        const t = e.touches?.[0] ?? e;
        const dx = t.clientX - touchStart.current.x;
        const dy = t.clientY - touchStart.current.y;
        // If more horizontal than vertical, prevent page scroll
        if (Math.abs(dx) > Math.abs(dy)) {
            e.preventDefault?.();
            setDragX(dx);
        }
    }, []);

    const onTouchEnd = useCallback((e) => {
        if (!touchStart.current) return;
        const t = e.changedTouches?.[0] ?? e;
        const dx = t.clientX - touchStart.current.x;
        const dt = Date.now() - touchStart.current.t;
        const velocity = Math.abs(dx) / dt; // px/ms

        // Commit swipe if far enough OR fast enough (flick)
        if (dx < -SWIPE_THRESHOLD || (dx < 0 && velocity > VELOCITY_THRESHOLD)) {
            next();
        } else if (dx > SWIPE_THRESHOLD || (dx > 0 && velocity > VELOCITY_THRESHOLD)) {
            prev();
        } else {
            // Snap back
            setDragX(0);
        }

        setIsDragging(false);
        touchStart.current = null;
        resetTimer();
    }, [next, prev, resetTimer]);

    // ── Mouse drag fallback (desktop) ─────────────────────────────────────────
    const onMouseDown = useCallback((e) => {
        touchStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
        setIsDragging(true);
        clearInterval(timerRef.current);
    }, []);

    const onMouseMove = useCallback((e) => {
        if (!touchStart.current || !isDragging) return;
        setDragX(e.clientX - touchStart.current.x);
    }, [isDragging]);

    const onMouseUp = useCallback((e) => {
        onTouchEnd({ changedTouches: null, clientX: e.clientX });
    }, [onTouchEnd]);

    // ── Disquera mode (unchanged) ──────────────────────────────────────────────
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

    // ── Slide strip transform ──────────────────────────────────────────────────
    // translateX moves the strip: -active * 100% + dragX offset
    const stripX = `calc(${-active * 100}% + ${dragX}px)`;
    const slide  = SLIDES[active];

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: '0 0 32px 32px',
                minHeight: 'clamp(420px, 55vw, 620px)',
                background: slide.bgOverlay,
                transition: 'background 0.8s ease',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'pan-y', // allow vertical scroll, intercept horizontal
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800;900&display=swap');

                @keyframes be4t-glow-pulse {
                    0%,100% { opacity: 0.6; }
                    50%     { opacity: 1;   }
                }
                @keyframes be4t-slide-in-right { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
                @keyframes be4t-slide-in-left  { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }

                .be4t-h-progress-track { height: 2px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; flex: 1; }
                .be4t-h-progress-fill  { height: 100%; border-radius: 2px; }
                @keyframes be4t-prog { from { width: 0%; } to { width: 100%; } }

                .be4t-hero-cta { transition: transform 0.18s ease, box-shadow 0.18s ease; }
                .be4t-hero-cta:hover { transform: scale(1.04) !important; }
                .be4t-hero-cta:active { transform: scale(0.97) !important; }

                /* Swipe hint — fades out after 3s on mobile */
                @keyframes be4t-swipe-hint { 0%,100%{opacity:0} 20%,80%{opacity:1} }

                /* ── Mobile ── */
                @media (max-width: 480px) {
                    .be4t-hero-title-el  { font-size: clamp(1.75rem, 8.5vw, 2.4rem) !important; }
                    .be4t-hero-subtitle  { font-size: 0.82rem !important; line-height: 1.6 !important; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
                    .be4t-hero-pad       { padding: 3rem 1.25rem 3.5rem !important; }
                    .be4t-hero-badge-el  { font-size: 0.55rem !important; padding: 0.3rem 0.75rem !important; }
                }
                @media (min-width: 481px) and (max-width: 767px) {
                    .be4t-hero-title-el  { font-size: clamp(2.2rem, 6.5vw, 2.9rem) !important; }
                    .be4t-hero-pad       { padding: 3.5rem 1.5rem !important; }
                }
            `}</style>

            <GridBg />

            {/* ── Glow blobs (follow active slide color) ── */}
            <div style={{ position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)', width: '70%', height: '50%', background: `radial-gradient(ellipse at center, ${slide.glow1} 0%, transparent 65%)`, pointerEvents: 'none', animation: 'be4t-glow-pulse 4s ease-in-out infinite', transition: 'background 0.8s ease' }} />
            <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '45%', height: '60%', background: `radial-gradient(ellipse at top right, ${slide.glow2} 0%, transparent 60%)`, pointerEvents: 'none', transition: 'background 0.8s ease' }} />

            {/* ── Vignettes ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, rgba(8,8,18,0.5) 0%, transparent 100%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(8,8,18,0.6) 0%, transparent 100%)', pointerEvents: 'none' }} />

            {/* ── Slide STRIP — horizontal flex, each slide is 100% wide ── */}
            <div
                style={{
                    display: 'flex',
                    width: `${SLIDES.length * 100}%`,
                    transform: `translateX(${stripX})`,
                    // Smooth snap when releasing, but raw follow during drag
                    transition: isDragging ? 'none' : 'transform 0.42s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    willChange: 'transform',
                    position: 'relative', zIndex: 1,
                }}
            >
                {SLIDES.map((s, i) => (
                    <div
                        key={s.id}
                        className="be4t-hero-pad"
                        style={{
                            // Each slide: 1/(N slides) of strip = 100vw effectively
                            width: `${100 / SLIDES.length}%`,
                            flexShrink: 0,
                            padding: '5rem 2rem 5.5rem',
                            textAlign: 'center',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            // Fade non-active slides (subtle depth cue)
                            opacity: i === active ? 1 : 0.35,
                            transition: 'opacity 0.4s ease',
                            pointerEvents: i === active ? 'auto' : 'none',
                        }}
                    >
                        {/* Badge */}
                        <div
                            className="be4t-hero-badge-el"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                background: s.badgeBg, border: `1px solid ${s.badgeBorder}`,
                                borderRadius: '100px', padding: '0.35rem 1.1rem',
                                marginBottom: '1.4rem',
                                fontSize: '0.65rem', color: s.badgeColor,
                                fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px',
                                fontFamily: "'Inter Tight','Inter',sans-serif",
                            }}
                        >
                            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: s.badgeColor, boxShadow: `0 0 6px ${s.badgeColor}` }} />
                            {s.badge}
                        </div>

                        {/* Headline */}
                        <h1
                            className="be4t-hero-title-el"
                            style={{
                                fontFamily: "'Inter Tight', 'Inter', -apple-system, sans-serif",
                                fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
                                fontWeight: '900', letterSpacing: '-0.045em', lineHeight: 1.05,
                                marginBottom: '1.4rem', maxWidth: '800px',
                                background: s.titleGradient,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                whiteSpace: 'pre-line',
                            }}
                        >
                            {s.title}
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="be4t-hero-subtitle"
                            style={{
                                color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem',
                                lineHeight: 1.72, maxWidth: '640px', marginBottom: '2.2rem', fontWeight: '400',
                            }}
                        >
                            {s.subtitle}
                        </p>

                        {/* CTA */}
                        <button
                            className="be4t-hero-cta"
                            onClick={() => {
                                if (s.cta.action) { s.cta.action(); }
                                else if (s.cta.page && onNavigate) { onNavigate(s.cta.page); }
                            }}
                            style={ctaStyle(s.ctaStyle)}
                        >
                            {s.cta.label}
                        </button>

                        {/* Slide indicators — only rendered in active slide to avoid duplicates */}
                        {i === active && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '3.2rem' }}>
                                {SLIDES.map((sl, j) => (
                                    <button
                                        key={sl.id}
                                        onClick={(e) => { e.stopPropagation(); goTo(j); resetTimer(); }}
                                        aria-label={`Slide ${j + 1}`}
                                        style={{ padding: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'transparent', touchAction: 'manipulation' }}
                                    >
                                        {active === j ? (
                                            <div className="be4t-h-progress-track" style={{ width: '52px' }}>
                                                <div
                                                    key={`${active}-fill`}
                                                    className="be4t-h-progress-fill"
                                                    style={{ background: `linear-gradient(90deg, ${s.accent}, white)`, animation: `be4t-prog ${INTERVAL}ms linear forwards` }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', transition: 'background 0.3s' }} />
                                        )}
                                    </button>
                                ))}
                                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
                                    {String(active + 1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Swipe hint — visible once on mobile, fades away ── */}
            <div style={{
                position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px', padding: '0.28rem 0.75rem',
                zIndex: 2, pointerEvents: 'none',
                animation: 'be4t-swipe-hint 3s ease 1.5s 1 forwards',
                opacity: 0,
            }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                </svg>
                <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Desliza</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M14 5l7 7M14 19l7-7"/>
                </svg>
            </div>

            {/* ── Trust chip — Powered by Blockchain ── */}
            <div style={{
                position: 'absolute', bottom: '1.25rem', right: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px', padding: '0.3rem 0.8rem',
                zIndex: 2, pointerEvents: 'none',
            }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    Powered by Blockchain &middot; Legal
                </span>
            </div>
        </div>
    );
};

export default HeroBanner;
