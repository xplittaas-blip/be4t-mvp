import React, { useState } from 'react';
import useMailchimpSubscribe from '../hooks/useMailchimpSubscribe';

const COUNTRIES = ['Colombia', 'México', 'Argentina', 'España', 'Chile', 'Perú', 'Venezuela', 'Estados Unidos', 'Puerto Rico', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Guatemala', 'Costa Rica', 'Otro'];

const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
};

const SuccessScreen = ({ mode }) => (
    <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            {mode === 'artista' ? '¡Tu solicitud fue enviada!' : '¡Estás en la lista!'}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '360px', margin: '0 auto' }}>
            {mode === 'artista'
                ? 'Nuestro equipo revisará tu perfil y te contactará en 48 horas para comenzar la tokenización de tu catálogo.'
                : 'Te notificaremos cuando un nuevo hit esté disponible para inversión. Mientras, explora el marketplace.'}
        </p>
    </div>
);

// ── Artist Form ───────────────────────────────────────────────────────────────
const ArtistForm = ({ onNavigate }) => {
    const [form, setForm] = useState({ email: '', spotify_url: '', artist_name: '' });
    const [submitted, setSubmitted] = useState(false);

    const { subscribe, loading } = useMailchimpSubscribe();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await subscribe({
            email: form.email,
            fname: form.artist_name,
            tags: ['artista', 'artist-application'],
        });
        setSubmitted(true);
    };

    if (submitted) return <SuccessScreen mode="artista" />;

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>NOMBRE ARTÍSTICO</label>
                <input
                    type="text" required
                    placeholder="Ej: Feid, Karol G..."
                    value={form.artist_name}
                    onChange={e => setForm(f => ({ ...f, artist_name: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
            </div>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>EMAIL DE CONTACTO</label>
                <input
                    type="email" required
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
            </div>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>
                    LINK DE SPOTIFY
                    <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: '0.4rem' }}>(opcional)</span>
                </label>
                <input
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    value={form.spotify_url}
                    onChange={e => setForm(f => ({ ...f, spotify_url: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(29,185,84,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
            </div>
            <button
                type="submit" disabled={loading}
                style={{
                    padding: '0.9rem', marginTop: '0.5rem',
                    background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    border: 'none', borderRadius: '12px',
                    color: 'white', fontWeight: '800', fontSize: '0.95rem',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'opacity 0.2s ease',
                }}
            >
                {loading ? '⏳ Enviando...' : 'Aplicar como Artista →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                Al enviar aceptas que BE4T procese tu información artística según nuestra política de privacidad.
            </p>
        </form>
    );
};

const MUSIC_GENRES = [
    'Reggaetón', 'Pop Latino', 'Trap Latino', 'Salsa / Cumbia', 'Rock',
    'Hip-Hop', 'R&B / Soul', 'Electrónica / Dance', 'Pop Internacional', 'Otro',
];

const INVESTMENT_RANGES = [
    { value: '10-99',    label: '$10 – $99 USD',    icon: '🌱', desc: 'Explorador' },
    { value: '100-499',  label: '$100 – $499 USD',  icon: '📈', desc: 'Inversor' },
    { value: '500-1999', label: '$500 – $1,999 USD', icon: '🚀', desc: 'Avanzado' },
    { value: '2000+',    label: '$2,000+ USD',       icon: '🏆', desc: 'Institucional' },
];

// ── Fan / Investor Form ───────────────────────────────────────────────────────
const FanForm = ({ onNavigate, session }) => {
    const [form, setForm] = useState({
        email: session?.user?.email || '',
        country: '',
        music_genre: '',
        investment_range: '',
        fan_type: 'consolidated',
    });
    const [submitted, setSubmitted] = useState(false);
    const { subscribe, loading } = useMailchimpSubscribe();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await subscribe({
            email: form.email,
            country: form.country,
            music_genre: form.music_genre,
            investment_range: form.investment_range,
            tags: [`fan_type-${form.fan_type}`],
            supabaseUserId: session?.user?.id || null,
        });
        setSubmitted(true);
    };

    if (submitted) return <SuccessScreen mode="fan" />;

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Fan type — investment style */}
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', display: 'block', letterSpacing: '0.08em' }}>PERFIL INVERSOR</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {[
                        { value: 'consolidated', icon: '🏆', label: 'Hits Consolidados', desc: 'Menor riesgo' },
                        { value: 'emerging',     icon: '🚀', label: 'Próximo Éxito',    desc: 'Mayor retorno' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, fan_type: opt.value }))}
                            style={{
                                padding: '0.75rem',
                                background: form.fan_type === opt.value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${form.fan_type === opt.value ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.18s ease',
                            }}
                        >
                            <div style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{opt.icon}</div>
                            <div style={{ fontWeight: '700', fontSize: '0.78rem', color: 'white', marginBottom: '0.15rem' }}>{opt.label}</div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Email — pre-filled from Thirdweb session if available */}
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block', letterSpacing: '0.08em' }}>EMAIL</label>
                <input
                    type="email" required
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
            </div>

            {/* País */}
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block', letterSpacing: '0.08em' }}>PAÍS</label>
                <select
                    required
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                >
                    <option value="">Selecciona tu país</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Género musical favorito */}
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block', letterSpacing: '0.08em' }}>GÉNERO MUSICAL FAVORITO</label>
                <select
                    required
                    value={form.music_genre}
                    onChange={e => setForm(f => ({ ...f, music_genre: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                >
                    <option value="">Selecciona un género</option>
                    {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>

            {/* Rango de inversión */}
            <div>
                <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', display: 'block', letterSpacing: '0.08em' }}>¿CUÁNTO PLANEAS INVERTIR?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {INVESTMENT_RANGES.map(r => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, investment_range: r.value }))}
                            style={{
                                padding: '0.6rem 0.75rem',
                                background: form.investment_range === r.value
                                    ? 'rgba(16,185,129,0.18)'
                                    : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${form.investment_range === r.value
                                    ? 'rgba(16,185,129,0.45)'
                                    : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '10px', cursor: 'pointer',
                                textAlign: 'left', transition: 'all 0.18s ease',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.9rem' }}>{r.icon}</span>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.72rem', color: form.investment_range === r.value ? '#4ade80' : 'white' }}>{r.label}</div>
                                    <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.35)' }}>{r.desc}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !form.investment_range}
                style={{
                    padding: '0.9rem', marginTop: '0.25rem',
                    background: loading
                        ? 'rgba(139,92,246,0.5)'
                        : !form.investment_range
                        ? 'rgba(255,255,255,0.06)'
                        : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    border: 'none', borderRadius: '12px',
                    color: !form.investment_range ? 'rgba(255,255,255,0.3)' : 'white',
                    fontWeight: '800', fontSize: '0.95rem',
                    cursor: loading || !form.investment_range ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
                {loading ? '⏳ Registrando...' : 'Unirme como Inversor →'}
            </button>

            <button
                type="button"
                onClick={() => onNavigate('explore')}
                style={{ background: 'none', border: 'none', color: 'rgba(139,92,246,0.6)', cursor: 'pointer', fontSize: '0.78rem', padding: '0.2rem' }}
            >
                Explorar el mercado primero →
            </button>
        </form>
    );
};

// ── Main Waitlist Page ────────────────────────────────────────────────────────
const WaitlistPage = ({ onNavigate, session }) => {
    const [activeMode, setActiveMode] = useState('fan');

    const modes = [
        { id: 'fan', icon: '🎧', label: 'Soy Fan / Inversor' },
        { id: 'artista', icon: '🎤', label: 'Soy Artista' },
        { id: 'disquera', icon: '🏢', label: 'Soy Disquera' },
    ];

    const content = {
        fan: {
            badge: '🎵 INVIERTE EN MÚSICA',
            headline: 'Invierte en hits consolidados que nunca dejan de sonar',
            subhead: 'o apuesta por el próximo gran éxito global con mayor riesgo y retorno.',
            description: 'Compra fracciones de canciones reales y recibe regalías directamente de Spotify, YouTube y TikTok. Sin cripto, sin complicaciones. Desde $10 USD.',
            stats: [
                { icon: '📊', value: '18%', label: 'APY Promedio' },
                { icon: '💰', value: '$3K', label: 'por millón de streams' },
                { icon: '🎵', value: '20+', label: 'Activos disponibles' },
            ],
        },
        artista: {
            badge: '🎤 ACCESO PARA ARTISTAS',
            headline: 'Financia tus proyectos musicales sin ceder tus masters',
            subhead: 'Obtén liquidez inmediata de tus fans para tu próximo lanzamiento.',
            description: 'Tokeniza el 20% de las regalías de tu próximo sencillo, recauda en 72 horas y mantén el 100% de la autoría. BE4T conecta directamente con tus fans-inversores.',
            stats: [
                { icon: '⚡', value: '72h', label: 'Para recibir capital' },
                { icon: '🔒', value: '100%', label: 'Conservas tus masters' },
                { icon: '🌍', label: 'Colombia, México, España' },
            ],
        },
        disquera: {
            badge: '⊞ INFRAESTRUCTURA B2B',
            headline: 'Transforma tu catálogo en liquidez inmediata',
            subhead: 'Infraestructura de tokenización institucional bajo tu propia marca.',
            description: 'Adelanta 5 años de regalías hoy. Despliega el marketplace de BE4T con tu identidad visual. Cumplimiento ERC-3643 y contratos auditados por Certik.',
            stats: [
                { icon: '💼', value: 'TaaS', label: 'Technology as a Service' },
                { icon: '🛡️', value: 'ERC-3643', label: 'Standard institucional' },
                { icon: '🤝', value: 'White Label', label: 'Tu marca, nuestra infra' },
            ],
        },
    };

    const c = content[activeMode];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0F1117',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Background gradient */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 60% 60% at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 50%, rgba(6,182,212,0.07) 0%, transparent 70%)',
            }} />

            <div style={{
                maxWidth: '1100px', margin: '0 auto',
                padding: '4rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 460px',
                gap: '4rem',
                alignItems: 'center',
                width: '100%',
                position: 'relative', zIndex: 1,
            }}>
                {/* ── Left: Narrative ── */}
                <div>
                    {/* Mode switcher */}
                    <div style={{
                        display: 'inline-flex',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '100px', padding: '4px',
                        gap: '4px', marginBottom: '2.5rem',
                    }}>
                        {modes.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setActiveMode(m.id)}
                                style={{
                                    padding: '0.4rem 0.9rem',
                                    borderRadius: '100px', border: 'none',
                                    background: activeMode === m.id ? 'rgba(139,92,246,0.3)' : 'transparent',
                                    color: activeMode === m.id ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                                    fontWeight: activeMode === m.id ? '700' : '400',
                                    fontSize: '0.8rem', cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.35)',
                        borderRadius: '100px', padding: '0.3rem 0.85rem',
                        fontSize: '0.72rem', color: '#c4b5fd',
                        fontWeight: '700', letterSpacing: '1.5px',
                        marginBottom: '1.25rem',
                    }}>{c.badge}</div>

                    {/* Headline */}
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.75rem', maxWidth: '560px' }}>
                        {c.headline}
                    </h1>
                    <p style={{ color: '#a855f7', fontWeight: '600', fontSize: '1rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                        {c.subhead}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '500px', marginBottom: '2.5rem' }}>
                        {c.description}
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {c.stats.map((s, i) => (
                            <div key={i}>
                                <div style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.03em', color: s.value ? 'white' : 'rgba(255,255,255,0.6)' }}>
                                    {s.icon} {s.value}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Already have account? */}
                    <button
                        onClick={() => onNavigate('explore')}
                        style={{
                            marginTop: '2.5rem',
                            background: 'none', border: 'none',
                            color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                        }}
                    >
                        ← Explorar el marketplace sin registrarme
                    </button>
                </div>

                {/* ── Right: Form card ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>
                    {/* BE4T logo in card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <span style={{ fontWeight: '900', letterSpacing: '-0.04em', fontSize: '1rem' }}>BE4T</span>
                    </div>

                    <h3 style={{ fontWeight: '800', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
                        {activeMode === 'fan' ? 'Únete a la lista de espera' :
                         activeMode === 'artista' ? 'Aplica como Artista' :
                         'Solicitar Demo Institucional'}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                        {activeMode === 'fan'
                            ? 'Sé de los primeros en invertir en hits reales.'
                            : activeMode === 'artista'
                            ? 'Nuestro equipo te contactará en 48h.'
                            : 'Para disqueras con catálogos de +50 artistas.'}
                    </p>

                    {activeMode === 'artista' || activeMode === 'disquera'
                        ? <ArtistForm onNavigate={onNavigate} />
                        : <FanForm onNavigate={onNavigate} session={session} />
                    }
                </div>
            </div>
        </div>
    );
};

export default WaitlistPage;
