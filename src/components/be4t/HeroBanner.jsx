import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Slide data ─────────────────────────────────────────────────────────────────
const SLIDES = [
    {
        id: 'b2b',
        badge: '🏢 PARA SELLOS & ARTISTAS',
        badgeColor: '#06b6d4',
        title: ['El Futuro de la', 'Gestión Musical'],
        titleGradient: 'linear-gradient(90deg, #06b6d4 0%, #a855f7 60%, #7c3aed 100%)',
        subtitle: 'Todo comienza con la tokenización de activos musicales: integramos el valor de la música en la blockchain para empoderar a artistas, sellos discográficos y agentes autónomos. Optimizamos procesos operativos y desbloqueamos flujos de ingresos antes inaccesibles a través de la propiedad digital fraccionada.',
        cta: { label: 'Agendar Demo →', action: () => alert('📩 Demo institucional: partners@be4t.com'), primary: true },
        accent: '#06b6d4',
        bgOverlay: 'linear-gradient(135deg, #040c18 0%, #060e22 40%, #08111a 100%)',
        waveColor1: '#0891b2',
        waveColor2: '#06b6d4',
    },
    {
        id: 'fans',
        badge: '🎵 PARA INVERSORES & FANS',
        badgeColor: '#a855f7',
        title: ['Invierte en la', 'Música que Amas'],
        titleGradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 40%, #06b6d4 100%)',
        subtitle: 'Sé parte del éxito de tus artistas favoritos. En BE4T, transformamos los hits mundiales en activos invertibles. Participa en la economía de las regalías musicales y genera rendimientos con cada reproducción.',
        cta: { label: 'Explorar Marketplace →', action: null, primary: false, page: 'explore' },
        accent: '#a855f7',
        bgOverlay: 'linear-gradient(135deg, #0f0820 0%, #0a1628 40%, #060d1f 100%)',
        waveColor1: '#7c3aed',
        waveColor2: '#a855f7',
    },
];

const INTERVAL = 5000; // 5 seconds

// ── Waveform SVG ──────────────────────────────────────────────────────────────
const WaveformBg = ({ color1, color2 }) => (
    <svg
        style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%', opacity: 0.28, pointerEvents: 'none' }}
        viewBox="0 0 660 400" preserveAspectRatio="xMidYMid slice"
    >
        <defs>
            <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color1} stopOpacity="0" />
                <stop offset="45%" stopColor={color1} stopOpacity="0.7" />
                <stop offset="100%" stopColor={color2} stopOpacity="0.5" />
            </linearGradient>
        </defs>
        {[35,70,55,115,85,155,65,125,100,165,75,105,145,65,90,130,55,80,150,95,65,125,85,110,155,75,55,120,90,70,140,100].map((h, i) => (
            <rect key={i} x={i * 21} y={(400 - h) / 2} width="11" height={h} rx="6"
                fill="url(#wg1)" opacity={0.4 + (i % 4) * 0.15} />
        ))}
        <text x="490" y="90"  fontSize="48" fill={`${color2}88`}>♪</text>
        <text x="560" y="165" fontSize="32" fill={`${color1}66`}>♫</text>
        <text x="465" y="240" fontSize="40" fill={`${color2}55`}>♩</text>
        <text x="530" y="310" fontSize="26" fill={`${color1}44`}>♬</text>
    </svg>
);

// ── HeroBanner Slider ─────────────────────────────────────────────────────────
const HeroBanner = ({ userMode, onNavigate }) => {
    const [active, setActive]     = useState(0);
    const [fading, setFading]     = useState(false);
    const [visible, setVisible]   = useState(0); // which slide is rendered while fade plays
    const timerRef                = useRef(null);

    const goTo = useCallback((idx) => {
        if (idx === active || fading) return;
        setFading(true);
        setTimeout(() => {
            setVisible(idx);
            setActive(idx);
            setFading(false);
        }, 420); // fade duration
    }, [active, fading]);

    const next = useCallback(() => goTo((active + 1) % SLIDES.length), [active, goTo]);

    // Auto-advance
    useEffect(() => {
        timerRef.current = setInterval(next, INTERVAL);
        return () => clearInterval(timerRef.current);
    }, [next]);

    // Pause on hover
    const pause = () => clearInterval(timerRef.current);
    const resume = () => { timerRef.current = setInterval(next, INTERVAL); };

    if (userMode === 'disquera') {
        // Keep existing disquera view
        return (
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '900px', margin: '0 auto 2rem' }}>
                    {[
                        { icon: '💳', iconBg: 'linear-gradient(135deg, #7c3aed, #a855f7)', title: 'Liquidez sin Deuda', desc: 'Adelanta el flujo de caja de tus regalías de los próximos 5 años mediante la securitización de activos.' },
                        { icon: '🌐', iconBg: 'linear-gradient(135deg, #0891b2, #06b6d4)', title: 'Infraestructura Marca Blanca (TaaS)', desc: 'Tu propio marketplace con tu identidad visual. Tus fans invierten en tus artistas bajo tu dominio.' },
                        { icon: '⚙️', iconBg: 'linear-gradient(135deg, #059669, #34d399)', title: 'Automatización de Operaciones', desc: 'Elimina la carga administrativa. Automatiza el cálculo de splits, reportes de regalías y distribución de pagos.' },
                        { icon: '🛡️', iconBg: 'linear-gradient(135deg, #b45309, #f59e0b)', title: 'Cumplimiento y Seguridad', desc: 'Operamos bajo estándares de tokenización institucional (ERC-3643), garantizando cumplimiento global.' },
                    ].map(card => (
                        <div key={card.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem' }}>{card.icon}</div>
                            <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.6rem' }}>{card.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', maxWidth: '620px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem' }}>¿Listo para escalar tu operación?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Agenda una demo personalizada con nuestro equipo.</p>
                    <button style={{ padding: '0.85rem 2rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                        onClick={() => alert('📩 Demo institucional: partners@be4t.com')}>
                        Solicitar Demo de Xplit B2B →
                    </button>
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
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '0 0 28px 28px',
                minHeight: 'clamp(380px, 55vw, 520px)',
                display: 'flex', alignItems: 'center',
            }}
        >
            {/* CSS for keyframes + responsive */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800;900&display=swap');
                @keyframes be4t-fade-in  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes be4t-fade-out { from { opacity: 1; transform: translateY(0); }  to { opacity: 0; transform: translateY(-10px); } }
                @keyframes be4t-progress { from { width: 0%; } to { width: 100%; } }
                .be4t-slide-content {
                    animation: be4t-fade-in 0.45s ease forwards;
                }
                .be4t-slide-content.fading {
                    animation: be4t-fade-out 0.35s ease forwards;
                }
                .be4t-progress-bar {
                    height: 3px;
                    background: rgba(255,255,255,0.25);
                    border-radius: 100px;
                    overflow: hidden;
                }
                .be4t-progress-fill {
                    height: 100%;
                    border-radius: 100px;
                    animation: be4t-progress ${INTERVAL}ms linear forwards;
                }
                .be4t-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    border: none; cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }
                .be4t-nav-arrow {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: white; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.1rem; z-index: 10;
                    transition: all 0.2s ease;
                    backdropFilter: blur(8px);
                }
                .be4t-nav-arrow:hover {
                    background: rgba(255,255,255,0.18);
                    border-color: rgba(255,255,255,0.3);
                }
                @media (max-width: 480px) {
                    .be4t-hero-title  { font-size: clamp(1.7rem, 8vw, 2.2rem) !important; }
                    .be4t-hero-sub    { font-size: 0.83rem !important; -webkit-line-clamp: 4; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
                    .be4t-nav-arrow   { display: none !important; }
                    .be4t-hero-pad    { padding: 2.5rem 1rem 3rem !important; }
                    .be4t-hero-badge  { font-size: 0.6rem !important; }
                }
                @media (min-width: 481px) and (max-width: 767px) {
                    .be4t-hero-title  { font-size: clamp(2rem, 6vw, 2.6rem) !important; }
                    .be4t-hero-sub    { font-size: 0.88rem !important; }
                    .be4t-hero-pad    { padding: 3rem 1.25rem !important; }
                }
            `}</style>

            {/* ── Background ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: slide.bgOverlay,
                transition: 'background 0.5s ease',
            }}>
                {/* Radial glow */}
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%',
                    width: '60%', height: '140%',
                    background: `radial-gradient(ellipse at center, ${slide.accent}18 0%, transparent 70%)`,
                    transition: 'background 0.5s ease',
                }} />
                {/* Waveform */}
                <WaveformBg color1={slide.waveColor1} color2={slide.waveColor2} />
                {/* Vignette bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(10,10,16,0.85) 0%, transparent 100%)' }} />
            </div>

            {/* ── Slide content ── */}
            <div
                className={`be4t-hero-pad be4t-slide-content${fading ? ' fading' : ''}`}
                style={{
                    position: 'relative', zIndex: 1,
                    maxWidth: '1280px', margin: '0 auto',
                    padding: '4rem 2rem 4.5rem',
                    width: '100%',
                }}
                key={visible} // remount triggers re-animation
            >
                {/* Badge */}
                <div className="be4t-hero-badge" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: `${slide.accent}22`,
                    border: `1px solid ${slide.accent}55`,
                    borderRadius: '100px', padding: '0.3rem 0.9rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.68rem', color: slide.badgeColor,
                    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px',
                }}>
                    {slide.badge}
                </div>

                {/* Title */}
                <h1
                    className="be4t-hero-title"
                    style={{
                        fontFamily: "'Inter Tight', 'Inter', -apple-system, sans-serif",
                        fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                        fontWeight: '900',
                        letterSpacing: '-0.04em',
                        lineHeight: 1.08,
                        marginBottom: '1.1rem',
                        maxWidth: '640px',
                        background: slide.titleGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    {slide.title[0]}<br />{slide.title[1]}
                </h1>

                {/* Subtitle */}
                <p
                    className="be4t-hero-sub"
                    style={{
                        color: 'rgba(255,255,255,0.62)',
                        fontSize: '0.95rem',
                        lineHeight: 1.72,
                        maxWidth: '520px',
                        marginBottom: '2rem',
                    }}
                >
                    {slide.subtitle}
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => {
                        if (slide.cta.action) { slide.cta.action(); }
                        else if (slide.cta.page && onNavigate) { onNavigate(slide.cta.page); }
                    }}
                    style={{
                        padding: '0.9rem 2rem',
                        minHeight: '52px',
                        background: slide.id === 'b2b'
                            ? 'linear-gradient(135deg, #0891b2, #06b6d4)'
                            : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        border: 'none', borderRadius: '14px',
                        color: 'white', fontWeight: '800', fontSize: '1rem',
                        cursor: 'pointer', letterSpacing: '-0.01em',
                        boxShadow: slide.id === 'b2b'
                            ? '0 4px 24px rgba(6,182,212,0.35)'
                            : '0 4px 24px rgba(139,92,246,0.4)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    {slide.cta.label}
                </button>

                {/* ── Progress + Dots ── */}
                <div style={{ marginTop: '2.5rem', maxWidth: '520px' }}>
                    {/* Progress bar */}
                    <div className="be4t-progress-bar" style={{ marginBottom: '0.85rem' }}>
                        <div
                            key={`${active}-progress`} // reset animation on slide change
                            className="be4t-progress-fill"
                            style={{ background: `linear-gradient(90deg, ${slide.waveColor1}, ${slide.waveColor2})` }}
                        />
                    </div>

                    {/* Dots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {SLIDES.map((s, i) => (
                            <button
                                key={s.id}
                                className="be4t-dot"
                                onClick={() => goTo(i)}
                                style={{
                                    width: active === i ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: active === i ? '4px' : '50%',
                                    background: active === i
                                        ? `linear-gradient(90deg, ${slide.waveColor1}, ${slide.waveColor2})`
                                        : 'rgba(255,255,255,0.25)',
                                }}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginLeft: '0.5rem' }}>
                            {active + 1} / {SLIDES.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Arrow Navigation ── */}
            <button
                className="be4t-nav-arrow"
                onClick={() => goTo((active - 1 + SLIDES.length) % SLIDES.length)}
                style={{ left: '1rem' }}
                aria-label="Anterior"
            >‹</button>
            <button
                className="be4t-nav-arrow"
                onClick={() => goTo((active + 1) % SLIDES.length)}
                style={{ right: '1rem' }}
                aria-label="Siguiente"
            >›</button>
        </div>
    );
};

export default HeroBanner;
