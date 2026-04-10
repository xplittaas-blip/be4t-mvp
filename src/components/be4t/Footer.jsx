import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#080810',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* ── Compliance Banner ── */}
            <div style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '1.25rem 2rem',
                maxWidth: '1100px', margin: '0 auto',
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
            }}>
                {/* Shield icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.7)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M12 2L3 7v5c0 5 9 9 9 10 0-1 9-5 9-10V7L12 2z"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(16,185,129,0.8)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                        Compliance &amp; Estructura Legal
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.7, maxWidth: '900px' }}>
                        BE4T opera bajo estándares internacionales de cumplimiento normativo.{' '}
                        <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Estructura legal bajo Delaware (USA) y UE Compliance ready.</strong>{' '}
                        Los activos listados son tokenizados bajo el protocolo{' '}
                        <strong style={{ color: 'rgba(255,255,255,0.5)' }}>ERC-3643 (T-REX)</strong>,
                        el estándar institucional para security tokens regulados.
                        Activos de clase IP/Royalties · Pagos trimestrales automatizados · KYC/AML on-chain.{' '}
                        Las inversiones en activos de regalías implican riesgos. Los rendimientos pasados no garantizan rendimientos futuros.
                        No constituye asesoría financiera regulada.
                    </p>
                </div>
            </div>

            {/* ── Main footer content ── */}
            <div style={{
                maxWidth: '1100px', margin: '0 auto',
                padding: '2rem 2rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                gap: '2rem',
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'white' }}>
                        BE<span style={{ color: '#10b981' }}>4</span>T
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.7 }}>
                        Infraestructura de inversión en activos musicales tokenizados.
                        Derechos de Flujo de Caja (Streaming Royalties) · Delaware/UE · ERC-3643.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {['ERC-3643', 'Delaware', 'KYC/AML'].map(tag => (
                            <span key={tag} style={{
                                fontSize: '0.58rem', fontWeight: '700',
                                background: 'rgba(16,185,129,0.08)',
                                border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: '4px', padding: '2px 7px',
                                color: 'rgba(16,185,129,0.7)',
                                letterSpacing: '0.5px',
                            }}>{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Links */}
                {[
                    {
                        title: 'Plataforma',
                        links: ['Mercado de Activos', 'Tu Portafolio', 'Cómo Funciona', 'Para Distribuidoras'],
                    },
                    {
                        title: 'Inversores',
                        links: ['Documentación', 'Risk Tiers', 'Yield Calculator', 'Whitepaper'],
                    },
                    {
                        title: 'Legal',
                        links: ['Términos de Emisión', 'Política de Riesgo', 'Privacidad', 'Compliance'],
                    },
                ].map(col => (
                    <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>
                            {col.title}
                        </h4>
                        {col.links.map(link => (
                            <a key={link} href="#" onClick={e => e.preventDefault()} style={{
                                fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
                                textDecoration: 'none', transition: 'color 0.18s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                            >{link}</a>
                        ))}
                    </div>
                ))}
            </div>

            {/* ── Bottom bar ── */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '1rem 2rem',
                maxWidth: '1100px', margin: '0 auto',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '0.5rem',
            }}>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
                    © 2025 BE4T Technologies Inc. Todos los derechos reservados.
                    Estructura societaria Delaware (EE.UU.) · Operación conforme UE Compliance.
                </p>
                <span style={{ fontSize: '0.65rem', color: 'rgba(16,185,129,0.5)', fontFamily: "'Courier New', monospace", letterSpacing: '0.5px' }}>
                    v2.0 · ERC-3643 · Polygon Mainnet
                </span>
            </div>
        </footer>
    );
};

export default Footer;
