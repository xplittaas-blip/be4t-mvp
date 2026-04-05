import React, { useState, useEffect } from 'react';
import Navigation from './components/be4t/Navigation';
import Footer from './components/be4t/Footer';
import MiniPlayer from './components/be4t/MiniPlayer';
import EarlyAccessModal from './components/be4t/EarlyAccessModal';
import AssetUploader from './components/be4t/AssetUploader';
import Marketplace from './pages/Marketplace';
import Portfolio from './pages/Portfolio';
import WaitlistPage from './pages/WaitlistPage';
import HowItWorks from './components/be4t/HowItWorks';
import { supabase } from './core/xplit/supabaseClient';

// ── Lazy pages ────────────────────────────────────────────────────────────────
// Profile page (simple placeholder if no dedicated page)
const ProfilePage = ({ session, onLogout }) => (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Mi Perfil</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem' }}>Configuración de tu cuenta BE4T</p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
                <div style={{ fontWeight: '600', marginTop: '0.3rem' }}>{session?.user?.email || '—'}</div>
            </div>
            <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>UID</label>
                <div style={{ fontWeight: '500', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem', fontFamily: 'monospace' }}>{session?.user?.id || '—'}</div>
            </div>
            <button
                onClick={async () => { await supabase.auth.signOut(); onLogout(); }}
                style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#f87171', fontWeight: '700', cursor: 'pointer' }}
            >
                Cerrar sesión
            </button>
        </div>
    </div>
);

// ── B2B Para Disqueras page (embeds Emitir Activo + B2B content) ──────────────
const DisquerasPage = ({ session, onLoginNeeded }) => {
    const [showEmitir, setShowEmitir] = useState(false);

    return (
        <div style={{ minHeight: '100vh', color: 'white' }}>
            {showEmitir && session ? (
                <AssetUploader onComplete={() => setShowEmitir(false)} />
            ) : (
                <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '100px', padding: '0.3rem 0.85rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#2dd4bf', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>⊞ Infraestructura B2B</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem' }}>
                            Transforma tu catálogo en liquidez inmediata
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px', marginBottom: '2rem' }}>
                            Tokeniza los derechos de regalías de tu catálogo, accede a capital anticipado y despliega tu propio marketplace bajo tu marca en menos de 72 horas.
                        </p>
                        {/* Primary CTA: Emitir Activo is HERE, not in the main nav */}
                        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => session ? setShowEmitir(true) : onLoginNeeded()}
                                style={{
                                    padding: '0.85rem 1.75rem',
                                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                    border: 'none', borderRadius: '12px',
                                    color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer',
                                }}
                            >
                                {session ? '🚀 Emitir un Activo' : '🔒 Iniciar sesión para Emitir'}
                            </button>
                            <button
                                onClick={() => alert('📩 Demo institucional: partners@be4t.com')}
                                style={{
                                    padding: '0.85rem 1.5rem',
                                    background: 'rgba(6,182,212,0.1)',
                                    border: '1px solid rgba(6,182,212,0.35)',
                                    borderRadius: '12px', color: '#2dd4bf',
                                    fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                                }}
                            >
                                Solicitar Demo B2B →
                            </button>
                        </div>
                    </div>

                    {/* Feature grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '3rem' }}>
                        {[
                            { icon: '💧', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', title: 'Liquidez sin Deuda', desc: 'Adelanta el flujo de caja de tus regalías de los próximos 5 años sin ceder la propiedad ni endeudarte. Capital inmediato para firmar nuevos talentos.' },
                            { icon: '🏷️', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)', title: 'Marca Blanca (TaaS)', desc: 'Despliega el marketplace de BE4T con tu identidad visual. Tus fans invierten en tus artistas bajo tu dominio, fortaleciendo el ecosistema D2C.' },
                            { icon: '⚙️', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', title: 'Automatización de Splits', desc: 'Distribuye regalías a miles de micro-inversores con un clic. Reportes automáticos certificados para auditoría y cumplimiento regulatorio.', extra: (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    {['#1DB954','#FF0000','#2DD4BF'].map((c, i) => (
                                        <div key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: c, opacity: 0.85 }} />
                                    ))}
                                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', alignSelf: 'center' }}>API certificada Spotify · YouTube · TikTok</span>
                                </div>
                            )},
                            { icon: '🛡️', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', title: 'Cumplimiento Institucional', desc: 'ERC-3643 para activos de seguridad regulados. Contratos auditados. Adaptado a la normativa de activos digitales de América Latina y España.' },
                        ].map(card => (
                            <div key={card.title} style={{
                                background: card.bg, border: `1px solid ${card.border}`,
                                borderRadius: '16px', padding: '1.5rem',
                                backdropFilter: 'blur(8px)',
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{card.icon}</div>
                                <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>{card.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                                {card.extra}
                            </div>
                        ))}
                    </div>

                    {/* CTA Bottom */}
                    <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.75rem' }}>¿Listo para escalar tu operación?</h3>
                        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Agenda una demo personalizada y descubre cómo Xplit integra tu infraestructura existente.
                        </p>
                        <button
                            onClick={() => alert('📩 partners@be4t.com — Agenda una llamada de 30 minutos con nuestro equipo de partnerships.')}
                            style={{
                                padding: '0.85rem 2.25rem',
                                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                border: 'none', borderRadius: '12px',
                                color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem',
                            }}
                        >
                            Solicitar Demo de Xplit B2B →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
    const [currentPage, setCurrentPage] = useState('explore');
    const [session, setSession]         = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // ── Auth ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) setShowAuthModal(false);
        });
        return () => subscription.unsubscribe();
    }, []);

    // ── Custom events (from child components that call navigate) ──────────────
    useEffect(() => {
        const handler = (e) => setCurrentPage(e.detail);
        document.addEventListener('navigate', handler);
        return () => document.removeEventListener('navigate', handler);
    }, []);

    const navigate = (page) => setCurrentPage(page);

    return (
        <div style={{ background: '#0F1117', minHeight: '100vh', color: 'white' }}>
            {/* ── Global font import hoisted here ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                body { background: #0F1117; color: white; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
                ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 2px; }
                input, select, textarea { font-family: inherit; }
                button { font-family: inherit; }
            `}</style>

            <Navigation
                currentPage={currentPage}
                setCurrentPage={navigate}
                session={session}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <main>
                {/* Explorar: Marketplace with Spotify Top 20 */}
                {currentPage === 'explore' && (
                    <Marketplace session={session} onNavigate={navigate} />
                )}

                {/* Mis Canciones: Portfolio / Dashboard */}
                {currentPage === 'mis-canciones' && (
                    <Portfolio session={session} />
                )}

                {/* Para Disqueras: B2B + Emitir Activo */}
                {currentPage === 'disqueras' && (
                    <DisquerasPage
                        session={session}
                        onLoginNeeded={() => setShowAuthModal(true)}
                    />
                )}

                {/* Perfil: User settings */}
                {currentPage === 'perfil' && session && (
                    <ProfilePage session={session} onLogout={() => setCurrentPage('explore')} />
                )}

                {/* Waitlist (Fan / Artista / Disquera) */}
                {currentPage === 'waitlist' && (
                    <WaitlistPage onNavigate={navigate} />
                )}

                {/* Cómo Funciona: HowItWorks full page */}
                {currentPage === 'como-funciona' && (
                    <HowItWorks onNavigate={navigate} />
                )}

                {/* Legacy routes (kept for compatibility) */}
                {currentPage === 'artist-invite' && (
                    <WaitlistPage onNavigate={navigate} />
                )}
                {currentPage === 'investor-waitlist' && (
                    <WaitlistPage onNavigate={navigate} />
                )}

                {/* Home: redirect to explore */}
                {currentPage === 'home' && <Marketplace session={session} />}
            </main>

            <MiniPlayer />
            <Footer />
            <EarlyAccessModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
}

export default App;
