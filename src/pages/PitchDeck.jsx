import React, { useState } from 'react';
import { 
    ChevronLeft, ChevronRight, Briefcase, Users, 
    TrendingUp, Shield, Lock, Star, Zap, BarChart3, 
    ArrowRight, Music 
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const PITCH_COLORS = {
    bg: '#08080f',
    accent: '#00f0ff',
    secondary: '#a855f7',
    text: '#ffffff',
    subtext: 'rgba(255,255,255,0.45)',
    card: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)'
};

// --- Mock Data for Graphs ---
const communityGrowth = [
    { name: 'Mes 1', value: 100, ltv: 2 },
    { name: 'Mes 2', value: 450, ltv: 12 },
    { name: 'Mes 3', value: 1200, ltv: 45 },
    { name: 'Mes 4', value: 2800, ltv: 180 },
    { name: 'Mes 5', value: 5500, ltv: 420 },
    { name: 'Mes 6', value: 9800, ltv: 850 },
];

const PitchDeck = ({ onExit }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        // SLIDE 1: COVER
        {
            id: 'cover',
            content: (
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '400px', height: '400px',
                        background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)',
                        zIndex: 0, animation: 'be4t-pulse 4s infinite'
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.25)',
                            borderRadius: '100px', padding: '6px 20px', marginBottom: '2rem'
                        }}>
                            <Music size={14} color={PITCH_COLORS.accent} />
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', color: PITCH_COLORS.accent, textTransform: 'uppercase' }}>
                                The Future of Music IP
                            </span>
                        </div>
                        
                        <h1 style={{ fontSize: '7rem', fontWeight: '950', letterSpacing: '-0.05em', margin: 0, lineHeight: 0.9 }}>
                            BE<span style={{ color: PITCH_COLORS.accent }}>4</span>T
                        </h1>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '400', marginTop: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                            Transformando fans en <span style={{ fontWeight: '800', background: `linear-gradient(90deg, ${PITCH_COLORS.accent}, ${PITCH_COLORS.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>socios</span>.
                        </h2>
                    </div>
                </div>
            )
        },

        // SLIDE 2: THE GAP (Problem)
        {
            id: 'gap',
            content: (
                <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: PITCH_COLORS.accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                            EL ABISMO DE LA LEALTAD
                        </h3>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: 1.1, marginBottom: '2rem' }}>
                            El streaming está <span style={{ color: '#ff4d4d' }}>fallándole</span> al artista.
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { icon: <Shield size={20} />, title: 'Desconexión Total', text: 'El artista no conoce a su 1% más leal. La data pertenece a la plataforma.' },
                                { icon: <TrendingUp size={20} />, title: 'Crecimiento Lineal', text: 'El revenue depende de clics, no de compromiso emocional.' }
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '1.25rem' }}>
                                    <div style={{ color: PITCH_COLORS.accent, flexShrink: 0 }}>{item.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{item.title}</div>
                                        <div style={{ color: PITCH_COLORS.subtext, fontSize: '0.9rem', marginTop: '4px' }}>{item.text}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Valor Actual del Fan vs Potencial BE4T</div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width=\"100%\" height=\"100%\">
                                <AreaChart data={communityGrowth}>
                                    <defs>
                                        <linearGradient id=\"colorValue\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                                            <stop offset=\"5%\" stopColor={PITCH_COLORS.accent} stopOpacity={0.3}/>
                                            <stop offset=\"95%\" stopColor={PITCH_COLORS.accent} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type=\"monotone\" dataKey=\"ltv\" stroke={PITCH_COLORS.accent} fillOpacity={1} fill=\"url(#colorValue)\" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: '900', color: PITCH_COLORS.accent }}>+400%</span>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>LTV Comunitario Proyectado</div>
                        </div>
                    </div>
                </div>
            )
        },

        // SLIDE 3: THE SOLUTION (Labels & Artists)
        {
            id: 'solution',
            content: (
                <div style={{ width: '100%', maxWidth: '1100px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: PITCH_COLORS.accent, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            NUESTRO MODELO
                        </h3>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '0.5rem' }}>Propiedad Intelectual Participativa</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '24px', padding: '2.5rem' }}>
                            <div style={{ color: PITCH_COLORS.accent, marginBottom: '1.5rem' }}><Briefcase size={32} /></div>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Para Majors & Sellos</h4>
                            <ul style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, paddingLeft: '20px' }}>
                                <li><strong>Data de Super-Fans:</strong> Identifica al 1% que mueve el mercado.</li>
                                <li><strong>Community LTV:</strong> Monetización recurrente pre-lanzamiento.</li>
                                <li><strong>Asset Liquidity:</strong> Monetiza catálogo pasivo sin perder control.</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(168,85,247,0.03)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: '24px', padding: '2.5rem' }}>
                            <div style={{ color: PITCH_COLORS.secondary, marginBottom: '1.5rem' }}><Users size={32} /></div>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Para el Artista</h4>
                            <ul style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, paddingLeft: '20px' }}>
                                <li><strong>Independencia Financiera:</strong> Adelantos financiados por fans.</li>
                                <li><strong>Comunidad Blindada:</strong> Tus fans son ahora tus embajadores.</li>
                                <li><strong>Exclusividad Viral:</strong> Gamifica cada etapa del lanzamiento.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },

        // SLIDE 4: THE VAULT (Gamification)
        {
            id: 'vault',
            content: (
                <div style={{ textAlign: 'center', width: '100%', maxWidth: '1000px' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: PITCH_COLORS.accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        GAMIFICACIÓN DEL ENGAGEMENT
                    </h3>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '3.5rem' }}>La Bóveda de Exclusividad</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {[
                            { name: 'FAN', color: '#00f0ff', perks: 'Chat Exclusivo + Badge' },
                            { name: 'SOCIO', color: '#a855f7', perks: 'Merch Edición Limitada + Meet & Greet Virtual' },
                            { name: 'VIP', color: '#facc15', perks: 'Nombre en Créditos + Acceso Backstage' }
                        ].map((tier, i) => (
                            <div key={i} style={{ 
                                background: 'rgba(255,255,255,0.02)', border: `1px solid ${tier.color}33`, 
                                borderRadius: '24px', padding: '2rem', textAlign: 'center' 
                            }}>
                                <div style={{ 
                                    width: '60px', height: '60px', borderRadius: '50%', background: `${tier.color}11`, 
                                    border: `1px solid ${tier.color}`, display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', margin: '0 auto 1.5rem', color: tier.color 
                                }}>
                                    <Star size={24} />
                                </div>
                                <h4 style={{ color: tier.color, fontWeight: '900', letterSpacing: '2px', marginBottom: '0.5rem' }}>{tier.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{tier.perks}</p>
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '3rem', color: PITCH_COLORS.subtext, fontStyle: 'italic' }}>
                        \"No estás vendiendo una canción, estás vendiendo una silla en la mesa del artista.\"
                    </p>
                </div>
            )
        },

        // SLIDE 5: CTA
        {
            id: 'cta',
            content: (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '4rem', fontWeight: '950', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            Validemos el próximo <br/>
                            <span style={{ color: PITCH_COLORS.accent }}>hit</span> juntos.
                        </h2>
                    </div>
                    
                    <button style={{
                        background: `linear-gradient(90deg, ${PITCH_COLORS.accent}, ${PITCH_COLORS.secondary})`,
                        border: 'none', borderRadius: '16px', padding: '1.25rem 3rem',
                        color: 'white', fontWeight: '800', fontSize: '1.2rem',
                        cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,240,255,0.3)',
                        display: 'inline-flex', alignItems: 'center', gap: '12px'
                    }}>
                        Agendar Demo Estratégica <ArrowRight size={20} />
                    </button>

                    <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '4rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.65rem', color: PITCH_COLORS.subtext, textTransform: 'uppercase', letterSpacing: '1px' }}>Liderazgo</div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Product & Legal Experts</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.65rem', color: PITCH_COLORS.subtext, textTransform: 'uppercase', letterSpacing: '1px' }}>Modelo</div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Tokens as a Service</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.65rem', color: PITCH_COLORS.subtext, textTransform: 'uppercase', letterSpacing: '1px' }}>Visión</div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Web3 for Global Majors</div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: PITCH_COLORS.bg, zIndex: 9999, color: 'white', 
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            <style>{`
                @keyframes be4t-pulse {
                    0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); }
                    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
                    100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); }
                }
                button:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }
            `}</style>

            {/* Top Bar */}
            <div style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-0.04em' }}>
                    BE<span style={{ color: PITCH_COLORS.accent }}>4</span>T <span style={{ fontWeight: '400', fontSize: '0.9rem', opacity: 0.4, marginLeft: '10px' }}>PITCH DECK 2026</span>
                </div>
                <button 
                    onClick={onExit}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '8px 20px', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>
                    ESC SALIR
                </button>
            </div>

            {/* Slide Area */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4rem' }}>
                <div key={currentSlide} style={{ animation: 'slideFadeIn 0.5s ease-out' }}>
                    <style>{`
                        @keyframes slideFadeIn {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    {slides[currentSlide].content}
                </div>
            </div>

            {/* Footer / Nav */}
            <div style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: PITCH_COLORS.subtext, fontWeight: '600' }}>
                    {currentSlide + 1} / {slides.length}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        disabled={currentSlide === 0}
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                            width: '50px', height: '50px', borderRadius: '50%', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', color: 'white', 
                            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', opacity: currentSlide === 0 ? 0.3 : 1 
                        }}>
                        <ChevronLeft />
                    </button>
                    <button 
                        disabled={currentSlide === slides.length - 1}
                        onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                        style={{ 
                            background: PITCH_COLORS.accent, border: 'none', 
                            width: '50px', height: '50px', borderRadius: '50%', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', color: 'black', 
                            cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer', opacity: currentSlide === slides.length - 1 ? 0.3 : 1 
                        }}>
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PitchDeck;
