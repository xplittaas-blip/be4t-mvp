import React, { useState } from 'react';

// ── BE4T Logo ─────────────────────────────────────────────────────────────────
const BE4TLogo = () => (
    <div style={{
        width: '34px', height: '34px', flexShrink: 0,
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 12px rgba(168,85,247,0.4)',
    }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

// ── Connect Wallet Icon ───────────────────────────────────────────────────────
const WalletIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M20 12v4H6a2 2 0 0 0 0 4h12v-4M4 6v12"/>
        <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
);

const Navigation = ({ currentPage, setCurrentPage, session, onLoginClick }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { id: 'explore', label: '↗ Explorar', description: 'Top 20 Reggaetón' },
        { id: 'mis-canciones', label: '♫ Mis Canciones', description: 'Tu portafolio de inversiones' },
        { id: 'disqueras', label: '⊞ Para Disqueras', description: 'Liquidez institucional B2B' },
    ];

    const tabBtn = (item) => {
        const isActive = currentPage === item.id;
        return (
            <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
                title={item.description}
                style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'rgba(139,92,246,0.2)' : 'transparent',
                    color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.55)',
                    fontWeight: isActive ? '700' : '400',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderBottom: isActive ? '2px solid #a855f7' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                }}
                onMouseOver={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                onMouseOut={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent'; } }}
            >
                {item.label}
            </button>
        );
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', -apple-system, sans-serif; }
                ::placeholder { color: rgba(255,255,255,0.3); }
                select option { background: #1a1028; color: white; }
            `}</style>
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
                    padding: '0 1.5rem',
                    display: 'flex', alignItems: 'center',
                    height: '62px', gap: '1rem',
                }}>

                    {/* ── Logo ── */}
                    <div
                        onClick={() => setCurrentPage('explore')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', flexShrink: 0 }}
                    >
                        <BE4TLogo />
                        <span style={{
                            fontWeight: '900', fontSize: '1.15rem',
                            letterSpacing: '-0.04em',
                            background: 'linear-gradient(135deg, #ffffff 30%, #c4b5fd 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>BE4T</span>
                    </div>

                    {/* ── Center nav (desktop) ── */}
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        gap: '0.25rem', paddingLeft: '1rem',
                        overflowX: 'auto', scrollbarWidth: 'none',
                    }}>
                        {navItems.map(tabBtn)}
                    </div>

                    {/* ── Right actions ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>

                        {/* Connect Wallet — Web3 premium button */}
                        <button
                            onClick={() => alert('🔗 Wallet connection coming soon!\n\nCompatible con:\n• MetaMask\n• WalletConnect\n• Coinbase Wallet')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.45rem',
                                padding: '0.5rem 1.1rem',
                                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
                                border: '1px solid rgba(139,92,246,0.4)',
                                borderRadius: '100px',
                                color: '#c4b5fd', fontSize: '0.82rem', fontWeight: '700',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 0 12px rgba(139,92,246,0.1)',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))'; e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.25)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))'; e.currentTarget.style.boxShadow = '0 0 12px rgba(139,92,246,0.1)'; }}
                        >
                            <WalletIcon />
                            Conectar Wallet
                        </button>

                        {/* Profile / Auth */}
                        {session ? (
                            <button
                                onClick={() => setCurrentPage('perfil')}
                                title="Mi Perfil"
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                    border: '2px solid rgba(168,85,247,0.4)',
                                    color: 'white', fontWeight: '800', fontSize: '0.85rem',
                                    cursor: 'pointer', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'box-shadow 0.2s ease',
                                }}
                                onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(168,85,247,0.5)'}
                                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                {(session.user?.email?.[0] || 'U').toUpperCase()}
                            </button>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                style={{
                                    padding: '0.5rem 1.1rem',
                                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                    border: 'none', borderRadius: '100px',
                                    color: 'white', fontWeight: '700', fontSize: '0.82rem',
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'opacity 0.2s ease',
                                }}
                                onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseOut={e => e.currentTarget.style.opacity = '1'}
                            >
                                Iniciar sesión
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navigation;
