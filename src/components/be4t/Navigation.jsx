import React, { useState, useEffect } from 'react';
import NavCTA from './NavCTA';
import { isProduction } from '../../core/env';

// ── BE4T Brand Logo (uses /public/be4t-logo.svg) ────────────────────────────
const BE4TWordmark = ({ onClick }) => (
    <div
        onClick={onClick}
        title="BE4T — Inicio"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, userSelect: 'none' }}
    >
        <img
            src="/be4t-logo.svg"
            alt="BE4T"
            style={{ height: '30px', width: 'auto', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
        {/* Fallback text if SVG fails */}
        <span style={{
            display: 'none', alignItems: 'center', gap: '0.4rem',
            fontWeight: '900', fontSize: '1.2rem', letterSpacing: '-0.04em',
            background: 'linear-gradient(90deg, #00D4FF, #9B5CF5)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>BE4T</span>
    </div>
);

const WalletIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M20 12v4H6a2 2 0 0 0 0 4h12v-4M4 6v12"/>
        <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
);

// ── Hamburger Icon ─────────────────────────────────────────────────────────────
const HamburgerIcon = ({ open }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(90deg)' : 'none' }}>
        {open ? (
            <>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </>
        ) : (
            <>
                <line x1="3" y1="7" x2="21" y2="7"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="17" x2="21" y2="17"/>
            </>
        )}
    </svg>
);

const Navigation = ({ currentPage, setCurrentPage, session, onLoginClick, isAdmin = false, userRole = 'investor' }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close menu on page change or resize to desktop
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const navItems = [
        { id: 'explore',       label: '↗ Explorar',       emoji: '🎵', description: 'Top 20 Artistas' },
        { id: 'mis-canciones', label: '♫ Mis Canciones',  emoji: '🎶', description: 'Tu portafolio' },
        { id: 'label-dashboard', label: '⊞ Business Dashboard', emoji: '🏢', description: 'Business Metrics' },
        { id: 'como-funciona', label: '❓ Cómo Funciona', emoji: '💡', description: 'Aprende más' },
    ];

    const navigate = (id) => { setCurrentPage(id); setMobileOpen(false); };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', -apple-system, sans-serif; }
                ::placeholder { color: rgba(255,255,255,0.3); }
                select option { background: #1a1028; color: white; }

                @keyframes be4t-nav-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.4; transform: scale(1.5); }
                }

                /* ── Mobile menu slide-in ── */
                .be4t-mobile-backdrop {
                    display: none;
                }
                .be4t-mobile-sidebar {
                    display: none;
                }

                @media (max-width: 767px) {
                    .be4t-nav-links { display: none !important; }
                    .be4t-hamburger { display: flex !important; }
                    .be4t-wallet-label { display: none !important; }

                    .be4t-mobile-backdrop {
                        display: block;
                        position: fixed; inset: 0; z-index: 299;
                        background: rgba(0,0,0,0.6);
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s ease;
                    }
                    .be4t-mobile-backdrop.open {
                        opacity: 1;
                        pointer-events: all;
                    }

                    .be4t-mobile-sidebar {
                        display: flex;
                        flex-direction: column;
                        position: fixed;
                        top: 0; right: 0; bottom: 0;
                        width: min(80vw, 320px);
                        z-index: 300;
                        background: rgba(12, 10, 22, 0.97);
                        border-left: 1px solid rgba(139,92,246,0.25);
                        box-shadow: -8px 0 40px rgba(0,0,0,0.6);
                        transform: translateX(100%);
                        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                        padding: 0;
                        overflow-y: auto;
                    }
                    .be4t-mobile-sidebar.open {
                        transform: translateX(0);
                    }
                }
            `}</style>

            {/* ── Main Navbar ── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 200,
                background: 'rgba(15,17,23,0.92)',
                backdropFilter: 'blur(24px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
                borderBottom: '1px solid rgba(139,92,246,0.15)',
                boxShadow: '0 1px 0 rgba(139,92,246,0.08)',
            }}>
                <div style={{
                    maxWidth: '1280px', margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex', alignItems: 'center',
                    height: '62px', gap: '0.75rem',
                }}>
                    {/* Logo — click goes home */}
                    <BE4TWordmark onClick={() => navigate('explore')} />

                    {/* Desktop nav links */}
                    <div className="be4t-nav-links" style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        gap: '0.25rem', paddingLeft: '1rem',
                        overflowX: 'auto', scrollbarWidth: 'none',
                    }}>
                        {navItems.map(item => {
                            const isActive = currentPage === item.id;
                            return (
                                <button key={item.id} onClick={() => navigate(item.id)} title={item.description}
                                    style={{
                                        padding: '0.4rem 0.85rem',
                                        borderRadius: '8px', border: 'none',
                                        background: isActive ? 'rgba(139,92,246,0.2)' : 'transparent',
                                        color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.55)',
                                        fontWeight: isActive ? '700' : '400',
                                        fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap',
                                        borderBottom: isActive ? '2px solid #a855f7' : '2px solid transparent',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseOver={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
                                    onMouseOut={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent'; }}}
                                >{item.label}</button>
                            );
                        })}
                    </div>

                    {/* Spacer on mobile */}
                    <div style={{ flex: 1 }} />

                    {/* Right actions — single NavCTA + admin + hamburger */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

                        {/* Mode badge — always visible */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.28rem 0.6rem',
                            background: isProduction ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                            border: `1px solid ${isProduction ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                            borderRadius: '100px',
                            fontSize: '0.6rem', fontWeight: '800',
                            letterSpacing: '0.8px', textTransform: 'uppercase',
                            color: isProduction ? '#10b981' : '#f59e0b',
                            whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                            <span style={{
                                width: '5px', height: '5px', borderRadius: '50%',
                                background: isProduction ? '#10b981' : '#f59e0b',
                                display: 'inline-block',
                                animation: isProduction ? 'be4t-nav-pulse 1.8s ease infinite' : 'none',
                            }} />
                            {isProduction ? 'REAL' : 'DEMO'}
                        </div>

                        {/* Admin button (if admin logged in via Supabase) */}
                        {isAdmin && session && (
                            <button
                                onClick={() => isProduction
                                    ? (window.history.pushState({}, '', '/admin'), window.dispatchEvent(new PopStateEvent('popstate')))
                                    : navigate('label-dashboard')}
                                title="Panel de Control"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '0.4rem 0.8rem',
                                    background: 'rgba(139,92,246,0.15)',
                                    border: '1px solid rgba(139,92,246,0.4)',
                                    borderRadius: '100px',
                                    color: '#c4b5fd', fontSize: '0.7rem', fontWeight: '800',
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                🛡️ Admin
                            </button>
                        )}

                        {/* THE unified CTA — handles all auth states */}
                        <NavCTA
                            session={session}
                            onNavigate={navigate}
                            onLoginClick={onLoginClick}
                        />

                        {/* Avatar (shown when Supabase session exists — quick profile nav) */}
                        {session && (
                            <button onClick={() => navigate('perfil')} title="Mi Perfil"
                                style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    background: isAdmin
                                        ? 'linear-gradient(135deg, #4c1d95, #8B5CF6)'
                                        : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                    border: isAdmin
                                        ? '2px solid rgba(196,181,253,0.5)'
                                        : '2px solid rgba(168,85,247,0.35)',
                                    color: 'white', fontWeight: '800', fontSize: '0.78rem',
                                    cursor: 'pointer', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative',
                                }}>
                                {(session.user?.email?.[0] || 'U').toUpperCase()}
                                {isAdmin && (
                                    <span style={{
                                        position: 'absolute', bottom: '0', right: '0',
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: '#c4b5fd', border: '2px solid #0f1117',
                                    }} />
                                )}
                            </button>
                        )}

                        {/* Hamburger (mobile only) */}
                        <button
                            className="be4t-hamburger"
                            onClick={() => setMobileOpen(o => !o)}
                            aria-label="Abrir menú"
                            style={{
                                display: 'none',
                                alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px',
                                background: mobileOpen ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${mobileOpen ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '10px', color: 'white', cursor: 'pointer',
                                transition: 'all 0.2s ease', flexShrink: 0,
                            }}>
                            <HamburgerIcon open={mobileOpen} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Mobile Backdrop ── */}
            <div className={`be4t-mobile-backdrop${mobileOpen ? ' open' : ''}`}
                onClick={() => setMobileOpen(false)} />

            {/* ── Mobile Sidebar ── */}
            <div className={`be4t-mobile-sidebar${mobileOpen ? ' open' : ''}`}>
                {/* Sidebar header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <BE4TWordmark onClick={() => navigate('explore')} />
                    <button onClick={() => setMobileOpen(false)}
                        style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                </div>

                {/* Nav section */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 0.5rem 0.5rem' }}>
                        NAVEGACIÓN
                    </p>
                    {navItems.map(item => {
                        const isActive = currentPage === item.id;
                        return (
                            <button key={item.id} onClick={() => navigate(item.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                                    padding: '0.9rem 1rem',
                                    borderRadius: '12px', border: 'none',
                                    background: isActive ? 'rgba(139,92,246,0.18)' : 'transparent',
                                    color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.75)',
                                    fontWeight: isActive ? '700' : '500',
                                    fontSize: '0.95rem', cursor: 'pointer',
                                    textAlign: 'left', width: '100%',
                                    borderLeft: isActive ? '3px solid #a855f7' : '3px solid transparent',
                                    transition: 'all 0.2s ease',
                                    minHeight: '52px',
                                }}>
                                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{item.emoji}</span>
                                <div>
                                    <div>{item.label.replace(/^[↗♫⊞❓]\s/, '')}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>{item.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom actions */}
                <div style={{ marginTop: 'auto', padding: '1rem 1rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* NavCTA in mobile sidebar */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <NavCTA session={session} onNavigate={(page) => { navigate(page); setMobileOpen(false); }} onLoginClick={() => { onLoginClick?.(); setMobileOpen(false); }} />
                    </div>
                    {/* Admin: Panel de Control (mobile) */}
                    {isAdmin && session && (
                        <button
                            onClick={() => { navigate('label-dashboard'); setMobileOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                padding: '0.85rem', minHeight: '52px',
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(124,58,237,0.15))',
                                border: '1px solid rgba(139,92,246,0.5)', borderRadius: '12px',
                                color: '#c4b5fd', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                            }}
                        >
                            🛡️ Panel de Control
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navigation;
