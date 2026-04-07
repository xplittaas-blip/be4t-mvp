import React, { useState, useEffect, useRef } from 'react';

// ── Global keyframe injection ─────────────────────────────────────────────────
const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @keyframes hiw-pulse-ring {
        0% { transform: scale(0.9); opacity: 0.7; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(0.9); opacity: 0.7; }
    }
    @keyframes hiw-fade-up {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes hiw-slide-in-left {
        from { opacity: 0; transform: translateX(-32px); }
        to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes hiw-slide-in-right {
        from { opacity: 0; transform: translateX(32px); }
        to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes hiw-line-draw {
        from { transform: scaleY(0); }
        to   { transform: scaleY(1); }
    }
    @keyframes hiw-glow-pulse {
        0%, 100% { box-shadow: 0 0 12px var(--hiw-accent); }
        50%       { box-shadow: 0 0 28px var(--hiw-accent), 0 0 48px var(--hiw-accent)44; }
    }
`;

// ── Tech-term highlighter ─────────────────────────────────────────────────────
const T = ({ children, color = '#22d3ee' }) => (
    <strong style={{
        color,
        fontWeight: '700',
        fontFamily: "'Courier New', monospace",
        fontSize: '0.93em',
        letterSpacing: '0.02em',
        background: `${color}12`,
        borderRadius: '4px',
        padding: '1px 5px',
        border: `1px solid ${color}28`,
    }}>
        {children}
    </strong>
);

// ── Blueprint SVG icons per step ──────────────────────────────────────────────
const BlueprintIcon = ({ type, color }) => {
    const s = { stroke: color, fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const icons = {
        audit: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <rect x="6" y="8" width="44" height="40" rx="4" {...s} strokeDasharray="3 2"/>
                <path d="M14 20h28M14 28h20M14 36h14" {...s}/>
                <circle cx="42" cy="34" r="7" {...s}/>
                <path d="M47 39l4 4" {...s}/>
            </svg>
        ),
        tokenize: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <hexagon/>
                <path d="M28 8l14 8v16l-14 8-14-8V16z" {...s} strokeDasharray="3 2"/>
                <path d="M28 16v24M20 20l16 16M36 20l-16 16" {...s} opacity="0.5"/>
                <circle cx="28" cy="28" r="4" fill={color} stroke="none" opacity="0.8"/>
            </svg>
        ),
        liquidity: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <path d="M10 44V20l18-12 18 12v24" {...s} strokeDasharray="3 2"/>
                <path d="M22 44V32h12v12" {...s}/>
                <path d="M28 8v8M20 16l8-8 8 8" {...s}/>
                <circle cx="28" cy="24" r="3" fill={color} stroke="none" opacity="0.7"/>
            </svg>
        ),
        rights: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <path d="M28 6C16.954 6 8 14.954 8 26c0 6.627 3.134 12.529 8 16.32V48l6-3 6 3V42.32C33.866 38.529 37 32.627 37 26" {...s} strokeDasharray="3 2"/>
                <path d="M34 6l4 4-4 4M40 10H28" {...s}/>
                <path d="M20 26l5 5 10-10" {...s}/>
            </svg>
        ),
        smart_contract: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <rect x="8" y="14" width="40" height="28" rx="4" {...s} strokeDasharray="3 2"/>
                <path d="M16 24l4 4-4 4M26 32h14" {...s}/>
                <circle cx="44" cy="12" r="4" fill={color} stroke="none" opacity="0.7"/>
                <path d="M44 16v2M44 8v2" {...s}/>
            </svg>
        ),
        payment: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="20" {...s} strokeDasharray="3 2"/>
                <path d="M20 28h16M28 20v16" {...s}/>
                <path d="M22 22l12 12M34 22l-12 12" {...s} opacity="0.4"/>
                <circle cx="28" cy="28" r="5" fill={color} stroke="none" opacity="0.7"/>
            </svg>
        ),
        catalog: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <rect x="8" y="10" width="40" height="36" rx="4" {...s} strokeDasharray="3 2"/>
                <path d="M16 20h24M16 28h18M16 36h12" {...s}/>
                <circle cx="38" cy="32" r="8" {...s}/>
                <path d="M35 28v8l6-4z" fill={color} stroke="none" opacity="0.7"/>
            </svg>
        ),
        token_buy: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <path d="M10 36V20l18-12 18 12v16" {...s} strokeDasharray="3 2"/>
                <path d="M22 36h12v8H22z" {...s}/>
                <path d="M28 14v14M22 22l6 6 6-6" {...s}/>
                <circle cx="28" cy="28" r="3" fill={color} stroke="none" opacity="0.8"/>
            </svg>
        ),
        royalties: (
            <svg width="56" height="56" viewBox="0 0 56 56">
                <path d="M10 44l12-20 8 12 6-8 10 16" {...s} strokeDasharray="3 2"/>
                <circle cx="22" cy="24" r="3" fill={color} stroke="none" opacity="0.8"/>
                <circle cx="30" cy="36" r="3" fill={color} stroke="none" opacity="0.8"/>
                <circle cx="46" cy="44" r="3" fill={color} stroke="none" opacity="0.8"/>
                <path d="M10 12h8l-4 8z" fill={color} stroke="none" opacity="0.5"/>
            </svg>
        ),
    };
    return icons[type] || icons.audit;
};

// ── Profile data ──────────────────────────────────────────────────────────────
const PROFILES = {
    disquera: {
        label: 'Disqueras',
        emoji: '🏗️',
        accent: '#22d3ee',
        cta: { label: 'Agendar Demo B2B', action: () => alert('Demo institucional: partners@be4t.com') },
        headline: 'Liquidez Inmediata para tu Catálogo',
        subhead: 'Sin adelantos de riesgo. Sin perder el control de la distribución.',
        steps: [
            {
                icon: 'audit',
                number: '01',
                title: 'Auditoría de Catálogo',
                tagline: 'Tus masters bajo el microscopio financiero',
                body: [
                    'Mediante la ingesta de metadata vía ',
                    <T key="api" color="#22d3ee">API certificada</T>,
                    ', auditamos el rendimiento histórico de tus masters. No arriesgues tu flujo de caja en adelantos tradicionales — nuestros modelos de proyección basados en datos reales de Spotify, YouTube y TikTok determinan el valor financiero de cada canción con precisión institucional.',
                ],
            },
            {
                icon: 'tokenize',
                number: '02',
                title: 'Tokenización de Regalías',
                tagline: 'Adelanta regalías a tus artistas. Mantén el control.',
                body: [
                    'Implementamos el estándar ',
                    <T key="erc" color="#22d3ee">ERC-3643</T>,
                    ' (RWA Compliance). Usa BE4T para ',
                    <T key="adv" color="#22d3ee">adelantar regalías a tus artistas</T>,
                    ' mediante nuestra infraestructura auditada: tú mantienes el control de la distribución mientras nosotros fondeamos el crecimiento. Sin deuda, sin ceder propiedad intelectual.',
                ],
            },
            {
                icon: 'liquidity',
                number: '03',
                title: 'Marca Blanca — Tu Marketplace',
                tagline: 'Despliega bajo tu identidad. Nosotros ponemos el protocolo.',
                body: [
                    'Despliega tu propio ',
                    <T key="mp" color="#22d3ee">Marketplace de inversión</T>,
                    ' con tu identidad visual bajo nuestro protocolo auditado. Tus fans invierten en tus artistas bajo tu dominio, con la infraestructura de liquidez de BE4T en el fondo. Listo en ',
                    <T key="h" color="#22d3ee">menos de 72 horas</T>,
                    '.',
                ],
            },
        ],
    },
    artista: {
        label: 'Artistas',
        emoji: '🎤',
        accent: '#a78bfa',
        cta: { label: 'Postular Mi Hit', action: () => alert('Postular canción: artists@be4t.com') },
        headline: 'Recauda en 72 Horas, no en Meses',
        subhead: '¿Necesitas presupuesto para tu próximo video o gira? El capital está en tu comunidad.',
        steps: [
            {
                icon: 'rights',
                number: '01',
                title: 'Registro de Derechos',
                tagline: 'Tu arte queda protegido en el contrato, para siempre',
                body: [
                    'Registramos tu obra en la cadena de bloques con su ',
                    <T key="isrc" color="#a78bfa">ISRC</T>,
                    ' y metadata certificada. Tu propiedad intelectual queda sellada en el tiempo: inmutable, verificable y tuya. Nadie puede reclamar lo que el ',
                    <T key="bc" color="#a78bfa">blockchain</T>,
                    ' ya sabe que es tuyo.',
                ],
            },
            {
                icon: 'smart_contract',
                number: '02',
                title: 'Oferta de Regalías Futuras',
                tagline: 'Vende una fracción hoy. Tu creatividad sigue siendo tuya.',
                body: [
                    'Vende una fracción de tus ',
                    <T key="ry" color="#a78bfa">regalías futuras</T>,
                    ' a tus fans e inversores y recibe el capital hoy. Sin deudas bancarias, sin sellos intermediarios. Desplegamos ',
                    <T key="sc" color="#a78bfa">Smart Contracts</T>,
                    ' en Arbitrum L2 — tarifas mínimas, liquidación en segundos. Tú creas, nosotros estructuramos.',
                ],
            },
            {
                icon: 'payment',
                number: '03',
                title: 'Capital Inmediato',
                tagline: 'Presupuesto para tu gira o video en 72 horas',
                body: [
                    'Una vez completada tu oferta, recibes el capital en ',
                    <T key="h72" color="#a78bfa">72 horas</T>,
                    '. Cada stream, cada view, cada creación en TikTok activa los ',
                    <T key="or" color="#a78bfa">Oráculos de Datos</T>,
                    ' que conectan el éxito de tus canciones con tu wallet. La distribución de regalías es ',
                    <T key="auto" color="#a78bfa">automática e instantánea</T>,
                    ': tú creas, el sistema recauda, y recibes tu parte en tiempo real.',
                ],
            },
        ],
    },
    fan: {
        label: 'Inversores',
        emoji: '📈',
        accent: '#34d399',
        cta: { label: 'Explorar Top 20', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        headline: 'La Economía de la Propiedad Musical',
        subhead: 'Deja de ser un oyente. Conviértete en el dueño de tus hits.',
        steps: [
            {
                icon: 'catalog',
                number: '01',
                title: 'Explorar el Catálogo',
                tagline: 'Tu buen oído es ahora una herramienta financiera',
                body: [
                    'Navega el Top 20 de reggaetón y rock con métricas reales de ',
                    <T key="sp" color="#34d399">Spotify</T>,
                    ', ',
                    <T key="yt" color="#34d399">YouTube</T>,
                    ' y ',
                    <T key="tk" color="#34d399">TikTok</T>,
                    ' actualizadas en tiempo real. Identifica las canciones con mayor momentum de streams y ROI proyectado. Invierte en lo que ya sabes que va a pegar.',
                ],
                insight: {
                    label: 'Activo Descorrelacionado',
                    body: 'La música latina es un activo refugio. Mientras los mercados fluctúan, los streams en Latam crecen un 19.4% anual. Invierte en hits, no en especulación.',
                    stat: '+19.4%',
                    statLabel: 'Crecimiento anual de streams Latam',
                    color: '#34d399',
                },
            },
            {
                icon: 'token_buy',
                number: '02',
                title: 'Adquirir Tokens',
                tagline: 'Desde $25 USD eres copropietario de un hit',
                body: [
                    'Adquiere fracciones de los derechos de regalías a través de nuestra interfaz. Cada token representa una porción real del ',
                    <T key="cff" color="#34d399">cash flow futuro</T>,
                    ' de la canción. Sin cripto obligatoria, sin wallets complejas. Solo seleccionas, pagas y eres socio del artista.',
                ],
            },
            {
                icon: 'royalties',
                number: '03',
                title: 'Cobrar Regalías',
                tagline: 'Cada stream suma a tu balance',
                body: [
                    'Los ',
                    <T key="ora" color="#34d399">Oráculos On-Chain</T>,
                    ' conectan el éxito de Spotify, YouTube y TikTok directamente con tu wallet. El sistema distribuye las regalías recaudadas mediante ',
                    <T key="logic" color="#34d399">lógica descentralizada</T>,
                    ' de forma automática. Inviertes en cultura, ganas con tecnología.',
                ],
            },
        ],
    },
};

// ── Animated step card ────────────────────────────────────────────────────────
const StepCard = ({ step, accent, index, isEven }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    const animStyle = visible
        ? { animation: `${isEven ? 'hiw-slide-in-right' : 'hiw-slide-in-left'} 0.6s cubic-bezier(0.25,0.8,0.25,1) ${index * 0.15}s both`, opacity: 1 }
        : { opacity: 0 };

    return (
        <div ref={ref} style={{
            display: 'grid',
            gridTemplateColumns: isEven ? '1fr 80px 1fr' : '1fr 80px 1fr',
            gap: '0',
            alignItems: 'center',
            position: 'relative',
        }}>
            {/* Left side */}
            <div style={{
                ...animStyle,
                ...(isEven ? { gridColumn: 1 } : { gridColumn: 3 }),
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${accent}22`,
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                ...(isEven ? {} : { gridRow: 1 }),
            }}>
                {/* Top accent line */}
                <div style={{
                    position: 'absolute', top: 0, left: '12px', right: '12px', height: '2px',
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                }}/>

                {/* Step number */}
                <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.65rem', fontWeight: '700',
                    color: accent, letterSpacing: '2px',
                    marginBottom: '1rem', opacity: 0.8,
                }}>
                    STEP {step.number} /////
                </div>

                {/* Blueprint icon */}
                <div style={{
                    display: 'flex', justifyContent: 'center',
                    marginBottom: '1.25rem',
                    filter: `drop-shadow(0 0 12px ${accent}44)`,
                }}>
                    <BlueprintIcon type={step.icon} color={accent} />
                </div>

                {/* Title + tagline */}
                <h3 style={{
                    fontSize: '1.1rem', fontWeight: '800',
                    letterSpacing: '-0.025em', margin: '0 0 0.35rem',
                    color: 'white',
                }}>
                    {step.title}
                </h3>
                <p style={{
                    fontSize: '0.8rem', fontStyle: 'italic',
                    color: accent, margin: '0 0 1rem', fontWeight: '500',
                }}>
                    {step.tagline}
                </p>

                {/* Body */}
                <p style={{
                    fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.8, margin: 0,
                }}>
                    {step.body}
                </p>

                {/* Activo Descorrelacionado insight — renders if step defines insight */}
                {step.insight && (
                    <div style={{
                        marginTop: '1.25rem',
                        padding: '1rem',
                        background: `${step.insight.color}08`,
                        border: `1px solid ${step.insight.color}30`,
                        borderLeft: `3px solid ${step.insight.color}`,
                        borderRadius: '0 10px 10px 0',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            marginBottom: '0.5rem',
                        }}>
                            <span style={{
                                fontSize: '1.4rem', fontWeight: '900',
                                color: step.insight.color, letterSpacing: '-0.04em',
                                fontFamily: "'Inter Tight', 'Inter', sans-serif",
                            }}>
                                {step.insight.stat}
                            </span>
                            <div>
                                <div style={{
                                    fontSize: '0.6rem', fontWeight: '700',
                                    color: step.insight.color, textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}>
                                    {step.insight.label}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
                                    {step.insight.statLabel}
                                </div>
                            </div>
                        </div>
                        <p style={{
                            fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1.65, margin: 0,
                        }}>
                            {step.insight.body}
                        </p>
                    </div>
                )}
            </div>

            {/* Center column (node) — spans correctly */}
            <div style={{
                gridColumn: 2,
                ...(isEven ? {} : { gridRow: 1 }),
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 2,
            }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}33 0%, ${accent}11 60%, transparent 100%)`,
                    border: `2px solid ${accent}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.75rem', fontWeight: '700', color: accent,
                    animation: visible ? 'hiw-glow-pulse 2.5s ease-in-out infinite' : 'none',
                    '--hiw-accent': accent,
                    flexShrink: 0,
                }}>
                    {step.number}
                </div>
            </div>

            {/* Spacer on the other side */}
            <div style={{
                gridColumn: isEven ? 3 : 1,
                ...(isEven ? {} : { gridRow: 1 }),
            }} />
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const HowItWorks = ({ onNavigate }) => {
    const [activeProfile, setActiveProfile] = useState('disquera');
    const [transitioning, setTransitioning] = useState(false);
    const profile = PROFILES[activeProfile];

    const switchProfile = (key) => {
        if (key === activeProfile) return;
        setTransitioning(true);
        setTimeout(() => { setActiveProfile(key); setTransitioning(false); }, 250);
    };

    return (
        <>
            <style>{STYLES}</style>
            <section style={{
                background: '#0f1117',
                minHeight: '100vh',
                padding: '5rem 1.5rem 6rem',
                fontFamily: "'Inter', sans-serif",
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Ambient radial glows behind section */}
                <div style={{
                    position: 'absolute', top: '10%', left: '15%',
                    width: '500px', height: '500px',
                    background: `radial-gradient(circle, ${profile.accent}0a 0%, transparent 70%)`,
                    pointerEvents: 'none', transition: 'background 0.5s ease',
                }}/>
                <div style={{
                    position: 'absolute', bottom: '10%', right: '10%',
                    width: '400px', height: '400px',
                    background: `radial-gradient(circle, ${profile.accent}07 0%, transparent 70%)`,
                    pointerEvents: 'none', transition: 'background 0.5s ease',
                }}/>

                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
                    {/* ── Section label ── */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem',
                        animation: 'hiw-fade-up 0.6s ease both',
                    }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                            borderRadius: '100px', padding: '5px 16px', marginBottom: '1.5rem',
                            fontSize: '0.65rem', fontWeight: '700', color: '#a78bfa',
                            letterSpacing: '2px', textTransform: 'uppercase',
                            fontFamily: "'Courier New', monospace",
                        }}>
                            ◈ NARRATIVA TÉCNICA ◈
                        </div>

                        <h2 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                            fontWeight: '900', margin: '0 0 0.75rem',
                            letterSpacing: '-0.04em', lineHeight: 1.05,
                        }}>
                            Cómo Funciona{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                BE4T
                            </span>
                        </h2>
                        <p style={{
                            fontSize: '1rem', color: 'rgba(255,255,255,0.45)',
                            maxWidth: '480px', margin: '0 auto', lineHeight: 1.7,
                        }}>
                            Ingeniería financiera aplicada a la industria musical.
                            Selecciona tu perfil.
                        </p>
                    </div>

                    {/* ── Premium Profile Toggle ── */}
                    <div style={{
                        display: 'flex', justifyContent: 'center', marginBottom: '4rem',
                        animation: 'hiw-fade-up 0.6s 0.1s ease both',
                    }}>
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '100px', padding: '5px', gap: '4px',
                        }}>
                            {Object.entries(PROFILES).map(([key, p]) => {
                                const isActive = key === activeProfile;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => switchProfile(key)}
                                        style={{
                                            padding: '0.65rem 1.5rem',
                                            borderRadius: '100px', border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '700', fontSize: '0.88rem',
                                            fontFamily: "'Inter', sans-serif",
                                            transition: 'all 0.3s cubic-bezier(0.25,0.8,0.25,1)',
                                            background: isActive
                                                ? `linear-gradient(135deg, ${p.accent}33, ${p.accent}1a)`
                                                : 'transparent',
                                            color: isActive ? p.accent : 'rgba(255,255,255,0.4)',
                                            border: isActive ? `1px solid ${p.accent}55` : '1px solid transparent',
                                            boxShadow: isActive ? `0 0 20px ${p.accent}22` : 'none',
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        }}
                                    >
                                        <span>{p.emoji}</span>
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Profile Header ── */}
                    <div style={{
                        textAlign: 'center', marginBottom: '3.5rem',
                        opacity: transitioning ? 0 : 1,
                        transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
                        transition: 'all 0.25s ease',
                    }}>
                        <div style={{
                            fontSize: '0.65rem', fontWeight: '700',
                            color: profile.accent, letterSpacing: '2.5px',
                            textTransform: 'uppercase', marginBottom: '0.6rem',
                            fontFamily: "'Courier New', monospace",
                        }}>
                            ◈ PARA {profile.label.toUpperCase()}
                        </div>
                        <h3 style={{
                            fontSize: 'clamp(1.35rem, 3vw, 1.85rem)',
                            fontWeight: '900', letterSpacing: '-0.03em', margin: '0 0 0.5rem',
                        }}>
                            {profile.headline}
                        </h3>
                        <p style={{ fontSize: '1rem', fontStyle: 'italic', color: profile.accent, margin: 0, fontWeight: '500' }}>
                            {profile.subhead}
                        </p>
                    </div>

                    {/* ── Timeline ── */}
                    <div
                        key={activeProfile}
                        style={{
                            position: 'relative',
                            opacity: transitioning ? 0 : 1,
                            transition: 'opacity 0.25s ease',
                        }}
                    >
                        {/* Central vertical line */}
                        <div style={{
                            position: 'absolute',
                            left: '50%', top: 0, bottom: 0,
                            width: '2px',
                            background: `linear-gradient(to bottom, transparent, ${profile.accent}50, ${profile.accent}50, transparent)`,
                            transform: 'translateX(-50%)',
                            zIndex: 1,
                        }}/>

                        {/* Steps */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {profile.steps.map((step, i) => (
                                <StepCard
                                    key={`${activeProfile}-${i}`}
                                    step={step}
                                    accent={profile.accent}
                                    index={i}
                                    isEven={i % 2 === 0}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ── Contextual CTA ── */}
                    <div style={{
                        textAlign: 'center', marginTop: '4rem',
                        animation: 'hiw-fade-up 0.6s ease both',
                        opacity: transitioning ? 0 : 1,
                        transition: 'opacity 0.25s ease',
                    }}>
                        <button
                            onClick={profile.cta.action}
                            style={{
                                padding: '1rem 2.5rem',
                                background: `linear-gradient(135deg, ${profile.accent}22, ${profile.accent}44)`,
                                border: `1.5px solid ${profile.accent}`,
                                borderRadius: '14px',
                                color: profile.accent, fontWeight: '800',
                                fontSize: '1rem', cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                letterSpacing: '-0.01em',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 4px 24px ${profile.accent}22`,
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = `${profile.accent}33`; e.currentTarget.style.boxShadow = `0 8px 32px ${profile.accent}44`; }}
                            onMouseOut={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${profile.accent}22, ${profile.accent}44)`; e.currentTarget.style.boxShadow = `0 4px 24px ${profile.accent}22`; }}
                        >
                            {profile.cta.label} →
                        </button>

                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('explore')}
                                style={{
                                    marginLeft: '1rem',
                                    padding: '1rem 1.75rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '14px',
                                    color: 'rgba(255,255,255,0.5)', fontWeight: '600',
                                    fontSize: '1rem', cursor: 'pointer',
                                    fontFamily: "'Inter', sans-serif",
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                                onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                            >
                                ← Volver al Marketplace
                            </button>
                        )}
                    </div>

                    {/* ── Unified footer statement ── */}
                    <div style={{
                        marginTop: '5rem', padding: '2rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', textAlign: 'center',
                    }}>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>
                            <strong style={{ color: 'white', fontWeight: '700' }}>BE4T no es solo una plataforma;</strong>{' '}
                            es una capa de infraestructura musical donde el{' '}
                            <T color="#a78bfa">Smart Contract</T>{' '}
                            garantiza que el éxito se comparta de forma{' '}
                            <T color="#22d3ee">justa y automática</T>.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            {[
                                ['ERC-3643', '#22d3ee'], ['Arbitrum L2', '#a78bfa'],
                                ['Oráculos On-Chain', '#34d399'], ['< 2s Finality', '#f59e0b'],
                            ].map(([label, color]) => (
                                <div key={label} style={{
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '0.78rem', fontWeight: '700', color,
                                    letterSpacing: '0.5px',
                                }}>{label}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HowItWorks;
