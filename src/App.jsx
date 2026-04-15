import React, { useState, useEffect } from 'react';
import Navigation from './components/be4t/Navigation';
import Footer from './components/be4t/Footer';
import MiniPlayer from './components/be4t/MiniPlayer';
import EarlyAccessModal from './components/be4t/EarlyAccessModal';
import AssetUploader from './components/be4t/AssetUploader';
import Marketplace from './pages/Marketplace';
import Portfolio from './pages/Portfolio';
import WaitlistPage from './pages/WaitlistPage';
import SongDetail from './pages/SongDetail';
import HowItWorks from './components/be4t/HowItWorks';
import AdminPanel from './pages/AdminPanel';
import LabelDashboard from './pages/LabelDashboard';
import SecondaryMarket from './pages/SecondaryMarket';
import { supabase } from './core/xplit/supabaseClient';
import { useUserRole } from './hooks/useUserRole';
import { isShowcase } from './core/env';

// ── Lazy pages ────────────────────────────────────────────────────────────────
// Profile page (simple placeholder if no dedicated page)
const ProfilePage = ({ session, onLogout, isAdmin }) => (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Mi Perfil</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem' }}>Configuración de tu cuenta BE4T</p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
                    <div style={{ fontWeight: '600', marginTop: '0.3rem' }}>{session?.user?.email || '—'}</div>
                </div>
                {/* Role badge */}
                <span style={{
                    fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px',
                    padding: '0.3rem 0.85rem', borderRadius: '100px',
                    background: isAdmin ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${isAdmin ? 'rgba(139,92,246,0.35)' : 'rgba(16,185,129,0.3)'}`,
                    color: isAdmin ? '#c4b5fd' : '#4ade80',
                }}>
                    {isAdmin ? '🛡️ Admin' : '💼 Investor'}
                </span>
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

// ── B2B Para Distribuidoras Independientes ────────────────────────────────────
const DisquerasPage = ({ session, onLoginNeeded }) => {
    const [showEmitir, setShowEmitir] = useState(false);

    return (
        <div style={{ minHeight: '100vh', color: 'white' }}>
            {showEmitir && session ? (
                <AssetUploader onComplete={() => setShowEmitir(false)} />
            ) : (
                <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem' }}>

                    {/* ── Header ── */}
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(16,185,129,0.07)',
                            border: '1px solid rgba(16,185,129,0.22)',
                            borderRadius: '100px', padding: '0.3rem 0.85rem', marginBottom: '1.25rem',
                        }}>
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                Infraestructura B2B — Distribuidoras Independientes
                            </span>
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '900',
                            letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '0.75rem',
                            fontFamily: "'Inter Tight', 'Inter', sans-serif", color: 'white',
                        }}>
                            Para Distribuidoras Independientes
                        </h1>
                        <p style={{
                            fontSize: '1.1rem', fontWeight: '600',
                            color: 'rgba(255,255,255,0.82)', lineHeight: 1.7,
                            maxWidth: '680px', marginBottom: '1.25rem',
                            borderLeft: '3px solid rgba(16,185,129,0.55)', paddingLeft: '1rem',
                        }}>
                            No solo distribuyas música, financia el éxito de tus artistas.
                            Convierte tu catálogo en un activo líquido y ofrece adelantos de
                            regalías sin arriesgar tu capital operativo.
                        </p>
                        <p style={{
                            color: 'rgba(255,255,255,0.48)', fontSize: '0.97rem',
                            lineHeight: 1.85, maxWidth: '680px', marginBottom: '2rem',
                        }}>
                            BE4T habilita a distribuidoras independientes para{' '}
                            <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>convertir regalías futuras en capital hoy</strong>{' '}
                            a través de nuestra comunidad de inversores globales. Tu catálogo se convierte en
                            un activo de flujo de caja tokenizado: tus artistas reciben adelantos, tú mantienes
                            el control de la distribución y las licencias, y los inversores reciben fracciones
                            de regalías de por vida.
                        </p>

                        {/* ── The Artist Edge ── */}
                        <div style={{
                            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '2rem',
                            display: 'flex', alignItems: 'flex-start', gap: '1rem',
                        }}>
                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.4rem' }}>
                                    Valor Agregado para tus Artistas
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.72, margin: 0 }}>
                                    Ofrece a tus artistas la oportunidad de listarse en una{' '}
                                    <strong style={{ color: 'rgba(255,255,255,0.85)' }}>terminal financiera global</strong>,
                                    transformando su música en activos financieros reales y atrayendo
                                    capital de inversión internacional.
                                </p>
                            </div>
                        </div>

                        {/* ── CTAs B2B ── */}
                        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <a
                                href="mailto:partners@be4t.com?subject=Inter%C3%A9s%20en%20Piloto%20BE4T%20-%20Distribuidora"
                                style={{
                                    display: 'inline-block', padding: '0.95rem 2rem',
                                    background: 'linear-gradient(135deg, #065f46, #10b981)',
                                    border: 'none', borderRadius: '12px',
                                    color: 'white', fontWeight: '800', fontSize: '0.95rem',
                                    cursor: 'pointer', textDecoration: 'none', letterSpacing: '-0.01em',
                                    boxShadow: '0 4px 24px rgba(16,185,129,0.3)', transition: 'opacity 0.18s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                Iniciar Piloto de Catálogo →
                            </a>
                            <a
                                href="mailto:partners@be4t.com?subject=Solicitud%20Liquidez%20BE4T%20-%20Distribuidora"
                                style={{
                                    display: 'inline-block', padding: '0.95rem 1.75rem',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)',
                                    borderRadius: '12px', color: 'rgba(255,255,255,0.62)',
                                    fontWeight: '600', fontSize: '0.92rem', cursor: 'pointer',
                                    textDecoration: 'none', transition: 'border-color 0.18s ease, color 0.18s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.62)'; }}
                            >
                                Obtener liquidez inmediata
                            </a>
                            {session && (
                                <button onClick={() => setShowEmitir(true)} style={{
                                    padding: '0.9rem 1.5rem', background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
                                    color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
                                }}>
                                    Emitir un Activo
                                </button>
                            )}
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.85rem', lineHeight: 1.6 }}>
                            Piloto estratégico: Tú pones el talento, nosotros ponemos la liquidez. Riesgo cero para la distribuidora.
                        </p>
                    </div>

                    {/* ── Tres Pilares de Valor ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
                        {[
                            { gradStart: '#06b6d4', gradEnd: '#6366f1', title: 'Liquidez Estratégica', desc: 'Libera el valor de tus activos actuales para reinvertir en la guerra de los adelantos. Accede a capital sin deuda, sin diluir la propiedad intelectual de tu catálogo.' },
                            { gradStart: '#8b5cf6', gradEnd: '#06b6d4', title: 'Infraestructura White-Label', desc: 'Despliega un marketplace de inversión propio con tu identidad visual para tus artistas firmados. Tu audiencia invierte bajo tu marca, con el protocolo auditado de BE4T.', featured: true },
                            { gradStart: '#6366f1', gradEnd: '#8b5cf6', title: 'Gestión Automatizada', desc: 'Contratos auditados y administración digital de pagos para los titulares de derechos. Splits automáticos, reportes certificados y cumplimiento regulatorio en un solo sistema.' },
                        ].map(card => (
                            <div key={card.title} style={{ position: 'relative', borderRadius: '16px', padding: '1px', background: `linear-gradient(135deg, ${card.gradStart}, ${card.gradEnd})`, boxShadow: card.featured ? '0 0 32px rgba(139,92,246,0.15)' : 'none' }}>
                                <div style={{ background: '#0f1117', borderRadius: '15px', padding: '1.75rem', height: '100%' }}>
                                    {card.featured && (
                                        <div style={{ display: 'inline-block', marginBottom: '0.75rem', fontSize: '0.58rem', fontWeight: '700', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '4px', padding: '2px 8px' }}>Feature destacado</div>
                                    )}
                                    <h3 style={{ fontWeight: '800', fontSize: '1rem', margin: '0 0 0.65rem', letterSpacing: '-0.025em', background: `linear-gradient(90deg, ${card.gradStart}, ${card.gradEnd})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{card.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.855rem', lineHeight: 1.75, margin: 0 }}>{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Cumplimiento + API ── */}
                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '260px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.18)', borderRadius: '14px', padding: '1.25rem' }}>
                            <h4 style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>Cumplimiento Institucional</h4>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>ERC-3643 para activos de seguridad regulados. Contratos auditados por firma independiente. Adaptado a marcos regulatorios en Colombia, México y España.</p>
                        </div>
                        <div style={{ flex: 1, minWidth: '260px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '14px', padding: '1.25rem' }}>
                            <h4 style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.7rem', letterSpacing: '-0.02em' }}>Plataformas Integradas</h4>
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                {['#1DB954','#FF0000','#2DD4BF'].map((c,i)=>(<div key={i} style={{ width:'14px',height:'14px',borderRadius:'50%',background:c }}/>))}
                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>API certificada Spotify · YouTube · TikTok</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Para Artistas ── */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(124,58,237,0.04))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '2.5rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #a855f7, transparent)' }} />
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '100px', padding: '0.25rem 0.8rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.65rem', color: '#c4b5fd', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Para Artistas — La Promesa</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.85rem' }}>
                            Capital cuando lo necesitas,<br /><span style={{ color: '#c4b5fd' }}>sin deuda bancaria</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.98rem', lineHeight: 1.8, maxWidth: '600px', marginBottom: '2rem' }}>
                            Vende una fracción de tus regalías futuras y recibe el capital para tu próximo lanzamiento.{' '}
                            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Sin deudas bancarias</strong>, solo fans e inversores impulsando tu carrera.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            {[
                                { stat: 'Rápido', label: 'Capital disponible', color: '#22c55e' },
                                { stat: '0%', label: 'Sin deuda bancaria', color: '#c4b5fd' },
                                { stat: '100%', label: 'Autoría preservada', color: '#2dd4bf' },
                            ].map(({ stat, label, color }) => (
                                <div key={label} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color, letterSpacing: '-0.04em' }}>{stat}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => onLoginNeeded ? onLoginNeeded() : alert('artists@be4t.com')}
                            style={{ padding: '0.85rem 1.75rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.2))', border: '1px solid rgba(139,92,246,0.5)', borderRadius: '12px', color: '#c4b5fd', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer' }}
                        >
                            Adquirir participación de regalías →
                        </button>
                    </div>

                    {/* ── Label Dashboard (Simulación) ── */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.05))',
                        border: '1px solid rgba(6,182,212,0.2)',
                        borderRadius: '20px', padding: '2rem', marginBottom: '3rem',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Top accent line */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
                                borderRadius: '100px', padding: '0.25rem 0.85rem',
                            }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block', boxShadow: '0 0 6px #06b6d4' }} />
                                <span style={{ fontSize: '0.62rem', color: '#06b6d4', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                                    Dashboard — Simulación de Impacto
                                </span>
                            </span>
                        </div>

                        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.5rem', lineHeight: 1.1, color: 'white' }}>
                            Lo que BE4T hace por tu{' '}
                            <span style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                catálogo
                            </span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '0 0 1.75rem', lineHeight: 1.6, maxWidth: '560px' }}>
                            Simulación basada en un catálogo de 10 tracks con 500M de streams agregados.
                        </p>

                        {/* KPI Showcase Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            {[
                                {
                                    icon: '💰', label: 'Capital Liberado',
                                    value: '$2,400,000',
                                    sub: 'vía tokenización de regalías futuras',
                                    color: '#10b981', border: 'rgba(16,185,129,0.2)', bg: 'rgba(16,185,129,0.06)',
                                },
                                {
                                    icon: '📣', label: 'Ahorro en Marketing',
                                    value: '$320,000',
                                    sub: 'generado por fans-inversores en 6 meses',
                                    color: '#f97316', border: 'rgba(249,115,22,0.2)', bg: 'rgba(249,115,22,0.06)',
                                },
                                {
                                    icon: '👥', label: 'Inversores Activos',
                                    value: '3,872',
                                    sub: 'fans que se convirtieron en promotores',
                                    color: '#a855f7', border: 'rgba(168,85,247,0.2)', bg: 'rgba(168,85,247,0.06)',
                                },
                                {
                                    icon: '📈', label: 'Crecimiento de Streams',
                                    value: '+41%',
                                    sub: 'vs catálogos sin tokenización',
                                    color: '#06b6d4', border: 'rgba(6,182,212,0.2)', bg: 'rgba(6,182,212,0.06)',
                                },
                            ].map(({ icon, label, value, sub, color, border, bg }) => (
                                <div key={label} style={{
                                    background: bg, border: `1px solid ${border}`,
                                    borderRadius: '14px', padding: '1.25rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                                            {label}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '1.7rem', fontWeight: '900', color, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px', fontFamily: "'Courier New', monospace" }}>
                                        {value}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Flow diagram */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '1rem 1.25rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: '0.5rem', flexWrap: 'wrap',
                        }}>
                            {[
                                { emoji: '🎵', label: 'Tu Catálogo' },
                                { arrow: true },
                                { emoji: '🔗', label: 'Tokenización BE4T' },
                                { arrow: true },
                                { emoji: '👥', label: 'Inversores/Fans' },
                                { arrow: true },
                                { emoji: '📣', label: 'Marketing Viral' },
                                { arrow: true },
                                { emoji: '💸', label: 'Más Streams' },
                                { arrow: true },
                                { emoji: '🚀', label: 'Mayor ROI' },
                            ].map((item, i) => item.arrow
                                ? <span key={i} style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.1rem', flexShrink: 0 }}>→</span>
                                : (
                                    <div key={i} style={{ textAlign: 'center', flexShrink: 0 }}>
                                        <div style={{ fontSize: '1.25rem' }}>{item.emoji}</div>
                                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginTop: '2px', whiteSpace: 'nowrap' }}>{item.label}</div>
                                    </div>
                                )
                            )}
                        </div>

                        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', margin: '0.85rem 0 0', textAlign: 'center', lineHeight: 1.5 }}>
                            Datos proyectados para una distribuidora con 10 tracks activos · Modelo conservador (12% APY, 3 meses de operación)
                        </p>
                    </div>

                    {/* ── CTA Bottom ── */}

                    <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.02em', color: 'white' }}>¿Listo para escalar tu operación como distribuidora?</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 1.75rem' }}>
                            Agenda una demo personalizada y descubre cómo BE4T integra tu infraestructura de distribución existente sin fricciones operativas.
                        </p>
                        <a
                            href="mailto:partners@be4t.com?subject=Inter%C3%A9s%20en%20Piloto%20BE4T%20-%20Distribuidora"
                            style={{ display: 'inline-block', padding: '0.9rem 2.25rem', background: 'linear-gradient(135deg, #065f46, #10b981)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'none', letterSpacing: '-0.01em', boxShadow: '0 4px 24px rgba(16,185,129,0.25)', transition: 'opacity 0.18s ease' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            Iniciar Piloto de Catálogo →
                        </a>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', marginTop: '1rem' }}>
                            Piloto estratégico: Tú pones el talento, nosotros ponemos la liquidez. Riesgo cero para la distribuidora.
                        </p>
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
    const [activeSongId, setActiveSongId]   = useState(null);
    const [activeSong, setActiveSong]       = useState(null); // full song object

    // ── Role detection ────────────────────────────────────────────────────────
    const { isAdmin, role: userRole } = useUserRole(session);

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

    // ── URL-based /admin routing (─────────────────────────────────────────────────
    const getUrlPage = () => window.location.pathname === '/admin' ? 'admin' : null;
    const [urlPage, setUrlPage] = useState(getUrlPage);

    useEffect(() => {
        const handler = () => setUrlPage(getUrlPage());
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, []);

    const navigate = (page, songId, songData) => {
        if (songId) setActiveSongId(songId);
        if (songData) setActiveSong(songData);
        // If leaving admin, restore URL
        if (window.location.pathname === '/admin' && page !== 'admin') {
            window.history.pushState({}, '', '/');
        }
        setCurrentPage(page);
        setUrlPage(null);
    };

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
                isAdmin={isAdmin}
                userRole={userRole}
            />

            <main>
                {/* Explorar: Marketplace with Spotify Top 20 */}
                {currentPage === 'explore' && (
                    <Marketplace session={session} onNavigate={navigate} />
                )}

                {/* Song Detail: Full-page view */}
                {currentPage === 'song-detail' && (
                    <SongDetail
                        songId={activeSongId}
                        songData={activeSong}
                        isAuthenticated={!!session}
                        onBack={() => navigate('explore')}
                        onRequireAuth={() => setShowAuthModal(true)}
                    />
                )}

                {/* Mis Canciones: Portfolio / Dashboard */}
                {currentPage === 'mis-canciones' && (
                    <Portfolio session={session} onNavigate={setCurrentPage} />
                )}

                {/* Business Dashboard: B2B metrics */}
                {currentPage === 'label-dashboard' && (
                    <LabelDashboard session={session} onNavigate={setCurrentPage} />
                )}

                {/* Secondary Market: P2P token trading */}
                {currentPage === 'secondary-market' && (
                    <SecondaryMarket onNavigate={setCurrentPage} />
                )}

                {/* Perfil: User settings */}
                {currentPage === 'perfil' && session && (
                    <ProfilePage session={session} onLogout={() => setCurrentPage('explore')} isAdmin={isAdmin} />
                )}

                {/* Waitlist — redirect to explore in showcase playground */}
                {currentPage === 'waitlist' && (
                    isShowcase
                        ? <Marketplace session={session} onNavigate={navigate} />
                        : <WaitlistPage onNavigate={navigate} session={session} />
                )}

                {/* Cómo Funciona: HowItWorks full page */}
                {currentPage === 'como-funciona' && (
                    <HowItWorks onNavigate={navigate} />
                )}

                {/* Legacy routes */}
                {currentPage === 'artist-invite' && (
                    isShowcase
                        ? <Marketplace session={session} onNavigate={navigate} />
                        : <WaitlistPage onNavigate={navigate} session={session} />
                )}
                {currentPage === 'investor-waitlist' && (
                    isShowcase
                        ? <Marketplace session={session} onNavigate={navigate} />
                        : <WaitlistPage onNavigate={navigate} session={session} />
                )}

                {/* Admin Panel: /admin route — protected, production only */}
                {(urlPage === 'admin' || currentPage === 'admin') && (
                    <AdminPanel session={session} isAdmin={isAdmin} />
                )}

                {/* Home: redirect to explore */}
                {!urlPage && currentPage === 'home' && <Marketplace session={session} />}
            </main>

            <MiniPlayer />
            <Footer />
            {/* EarlyAccessModal — hidden in showcase playground (no lead capture) */}
            {!isShowcase && (
                <EarlyAccessModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                />
            )}
        </div>
    );
}

export default App;
