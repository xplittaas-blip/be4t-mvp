import React, { useState } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import RegulatoryModal from './RegulatoryModal';

// ── Nav helper — dispatches the same CustomEvent the app listens to ────────────
const navTo = (page) =>
    document.dispatchEvent(new CustomEvent('navigate', { detail: page }));

// ── A single footer link ───────────────────────────────────────────────────────
const FooterLink = ({ label, onClick, href = '#' }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={href}
            onClick={e => { e.preventDefault(); onClick?.(); }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'block',
                fontSize: '0.82rem',
                color: hovered ? '#10b981' : 'rgba(255,255,255,0.38)',
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'color 0.2s ease',
                paddingBottom: '0.45rem',
                lineHeight: 1.5,
            }}
        >
            {label}
        </a>
    );
};

// ── Column heading ─────────────────────────────────────────────────────────────
const ColHead = ({ children }) => (
    <div style={{
        fontSize: '0.58rem',
        fontWeight: '800',
        color: 'rgba(255,255,255,0.22)',
        textTransform: 'uppercase',
        letterSpacing: '2.5px',
        marginBottom: '1.1rem',
        fontFamily: "'Inter', 'Montserrat', sans-serif",
    }}>
        {children}
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const Footer = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

                .be4t-footer {
                    font-family: 'Inter', 'Montserrat', -apple-system, sans-serif;
                    background: #080808;
                    /* subtle leather / noise texture */
                    background-image:
                        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E"),
                        linear-gradient(180deg, #0a0a0a 0%, #060606 100%);
                    border-top: 1px solid rgba(255,255,255,0.055);
                    padding: 0;
                    color: white;
                }

                .be4t-footer-inner {
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 3.5rem 2rem 0;
                }

                .be4t-footer-grid {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr 1fr 1fr;
                    gap: 2.5rem;
                    padding-bottom: 3rem;
                }

                @media (max-width: 860px) {
                    .be4t-footer-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .be4t-footer-brand-col {
                        grid-column: 1 / -1;
                    }
                }

                @media (max-width: 480px) {
                    .be4t-footer-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .be4t-footer-divider {
                    border: none;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    margin: 0;
                }

                /* ── CNAD Bottom Bar ── */
                .be4t-footer-bottombar {
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 1.1rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .be4t-footer-copyright {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.2);
                    letter-spacing: 0.04em;
                }
            `}</style>

            <footer className="be4t-footer">
                <div className="be4t-footer-inner">
                    <div className="be4t-footer-grid">

                        {/* ── Brand Column ── */}
                        <div className="be4t-footer-brand-col">
                            {/* Wordmark */}
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{
                                    fontSize: '1.6rem',
                                    fontWeight: '900',
                                    letterSpacing: '-0.04em',
                                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    BE4T
                                </span>
                            </div>
                            <p style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.3)',
                                lineHeight: 1.75,
                                maxWidth: '240px',
                                margin: '0 0 1.5rem',
                                letterSpacing: '0.01em',
                            }}>
                                La primera plataforma de regalías musicales tokenizadas de Latinoamérica.
                            </p>

                            {/* CNAD Badge */}
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                                    background: 'rgba(16,185,129,0.06)',
                                    border: '1px solid rgba(16,185,129,0.22)',
                                    borderRadius: '100px',
                                    padding: '0.35rem 0.85rem',
                                    cursor: 'pointer',
                                    color: '#10b981',
                                    fontSize: '0.62rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(16,185,129,0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.22)';
                                }}
                            >
                                <ShieldCheck size={12} />
                                Regulatory Framework
                            </button>
                        </div>

                        {/* ── Column 1: Platform ── */}
                        <div>
                            <ColHead>Platform</ColHead>
                            <FooterLink label="Explorar Activos"   onClick={() => navTo('explore')} />
                            <FooterLink label="Premium Assets"     onClick={() => navTo('secondary-market')} />
                            <FooterLink label="Business Dashboard" onClick={() => navTo('label-dashboard')} />
                            <FooterLink label="Mis Canciones"      onClick={() => navTo('mis-canciones')} />
                        </div>

                        {/* ── Column 2: Transparency ── */}
                        <div>
                            <ColHead>Transparency</ColHead>
                            <FooterLink label="Regulatory Framework" onClick={() => setShowModal(true)} />
                            <FooterLink label="Cómo Funciona"         onClick={() => navTo('como-funciona')} />
                            <FooterLink label="Trust & Security"       onClick={() => setShowModal(true)} />
                            <FooterLink label="Auditoría On-Chain"     onClick={() => setShowModal(true)} />
                        </div>

                        {/* ── Column 3: Company ── */}
                        <div>
                            <ColHead>Company</ColHead>
                            <FooterLink label="About BE4T"   onClick={() => navTo('como-funciona')} />
                            <FooterLink label="Artistas"     onClick={() => navTo('artist-invite')} />
                            <FooterLink label="Términos"     onClick={() => {}} />
                            <FooterLink label="Privacidad"   onClick={() => {}} />
                        </div>

                    </div>
                </div>

                {/* ── Divider ── */}
                <hr className="be4t-footer-divider" />

                {/* ── CNAD Bottom Bar ── */}
                <div className="be4t-footer-bottombar">
                    {/* Left: disclaimer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <ShieldCheck size={13} color="#10b981" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.02em', lineHeight: 1.55 }}>
                            BE4T está en proceso de registro ante la{' '}
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>CNAD de El Salvador</span>
                            {' '}bajo la Ley de Emisión de Activos Digitales.
                        </span>
                    </div>

                    {/* Right: copyright */}
                    <span className="be4t-footer-copyright">
                        © {new Date().getFullYear()} BE4T · All rights reserved
                    </span>
                </div>
            </footer>

            {showModal && <RegulatoryModal onClose={() => setShowModal(false)} />}
        </>
    );
};

export default Footer;
