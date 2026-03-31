import React from 'react';

const HeroBanner = ({ userMode, onNavigate }) => {
    if (userMode === 'disquera') {
        // Xplit Infrastructure page (screenshot 2)
        return (
            <div style={{
                max: '1280px', margin: '0 auto', padding: '3rem 1.5rem',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '900px', margin: '0 auto 2rem' }}>
                    {[
                        {
                            icon: '💳',
                            iconBg: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            title: 'Liquidez sin Deuda',
                            desc: 'Adelanta el flujo de caja de tus regalías de los próximos 5 años mediante la securitización de activos. Obtén el capital hoy para firmar nuevos talentos o expandir tu operación.',
                        },
                        {
                            icon: '🌐',
                            iconBg: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                            title: 'Infraestructura Marca Blanca (TaaS)',
                            desc: 'Te entregamos tu propio marketplace con tu identidad visual. Tus fans invierten en tus artistas bajo tu dominio, fortaleciendo tu ecosistema directo al consumidor (D2C).',
                        },
                        {
                            icon: '⚙️',
                            iconBg: 'linear-gradient(135deg, #059669, #34d399)',
                            title: 'Automatización de Operaciones',
                            desc: "Elimina la carga administrativa. Nuestra tecnología automatiza el cálculo de 'splits', la generación de reportes de regalías y la distribución de pagos a miles de micro-inversores con un solo clic.",
                            extra: (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" /></svg>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#2DD4BF"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" /></svg>
                                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.25rem' }}>Conexión vía API certificada para auditoría de regalías</span>
                                </div>
                            ),
                        },
                        {
                            icon: '🛡️',
                            iconBg: 'linear-gradient(135deg, #b45309, #f59e0b)',
                            title: 'Cumplimiento y Seguridad',
                            desc: 'Operamos bajo estándares de tokenización institucional (ERC-3643), garantizando que cada participación sea legalmente recuperable, auditable y cumpla con las normativas globales de activos digitales.',
                        },
                    ].map((card) => (
                        <div key={card.title} style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px', padding: '1.5rem',
                        }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: card.iconBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem', marginBottom: '1rem',
                            }}>{card.icon}</div>
                            <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.6rem' }}>{card.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
                            {card.extra}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{
                    textAlign: 'center', padding: '2.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px',
                    maxWidth: '620px', margin: '0 auto',
                }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem' }}>¿Listo para escalar tu operación?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Agenda una demo personalizada con nuestro equipo y descubre cómo Xplit puede integrarse con tu infraestructura existente.
                    </p>
                    <button
                        style={{
                            padding: '0.85rem 2rem',
                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            border: 'none', borderRadius: '12px',
                            color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                        }}
                        onClick={() => alert('📩 Demo institucional: partners@be4t.com')}
                    >
                        Solicitar Demo de Xplit B2B →
                    </button>
                </div>
            </div>
        );
    }

    // Default Fan/Artista Hero (screenshot 5)
    return (
        <div style={{
            position: 'relative',
            margin: '0',
            overflow: 'hidden',
            borderRadius: '0 0 24px 24px',
            minHeight: '320px',
            display: 'flex', alignItems: 'center',
        }}>
            {/* Background image with music wave */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: 'linear-gradient(135deg, #0f0820 0%, #0a1628 40%, #060d1f 100%)',
            }}>
                {/* Music wave decoration */}
                <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', opacity: 0.35 }} viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
                            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>
                    {/* Waveform bars */}
                    {[40,80,60,120,90,150,70,130,100,160,80,110,140,70,95,120,60,85,140,100,70,130,90,110,150,80,60,120].map((h, i) => (
                        <rect key={i} x={i * 22} y={(320 - h) / 2} width="10" height={h} rx="5" fill="url(#waveGrad)" opacity={0.5 + (i % 3) * 0.2} />
                    ))}
                    {/* Music notes */}
                    <text x="460" y="80" fontSize="40" fill="rgba(168,85,247,0.5)">♪</text>
                    <text x="520" y="140" fontSize="28" fill="rgba(6,182,212,0.4)">♫</text>
                    <text x="430" y="200" fontSize="36" fill="rgba(139,92,246,0.4)">♩</text>
                </svg>
            </div>

            {/* Content */}
            <div style={{
                position: 'relative', zIndex: 1,
                maxWidth: '1280px', margin: '0 auto',
                padding: '3.5rem 1.5rem',
                width: '100%',
            }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: 'rgba(139,92,246,0.2)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    borderRadius: '100px', padding: '0.3rem 0.85rem',
                    marginBottom: '1.25rem',
                }}>
                    <span style={{ fontSize: '0.7rem', color: '#c4b5fd', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>↗ INVIERTE EN MÚSICA</span>
                </div>

                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem', maxWidth: '560px' }}>
                    Invierte en las canciones{' '}
                    <span style={{ color: '#a855f7' }}>que amas</span>
                </h1>

                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '440px', marginBottom: '2rem' }}>
                    Compra participación en canciones reales y recibe regalías por streaming. Sin cripto, sin complicaciones.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button style={{
                        padding: '0.8rem 1.75rem',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        border: 'none', borderRadius: '12px',
                        color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        Explorar Canciones →
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate('como-funciona')}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: 'rgba(255,255,255,0.8)', fontWeight: '500', fontSize: '0.95rem', cursor: 'pointer',
                        }}
                    >
                        ¿Cómo funciona?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
