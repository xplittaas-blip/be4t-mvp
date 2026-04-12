/**
 * BE4T AdminPanel — /admin
 * ─────────────────────────────────────────────────────────────────────────────
 * Protected admin page for inserting new songs into Supabase.
 * Access: ONLY for users with role='admin' in production mode.
 *
 * Features:
 *  - Song insertion form: Título, Artista, TEA, Precio, Spotify URL, Cover URL
 *  - Real-time preview of the song card
 *  - Recent additions table
 *  - Access denied screen for non-admins
 */
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseReady } from '../core/xplit/supabaseClient';
import { isProduction } from '../core/env';

const SPOTIFY_ID_REGEX = /spotify\.com\/(?:track|intl-[a-z]+\/track)\/([A-Za-z0-9]+)/;

// ── Helpers ────────────────────────────────────────────────────────────────────
const extractSpotifyId = (url) => {
    const m = url?.match(SPOTIFY_ID_REGEX);
    return m ? m[1] : null;
};

const fmtDate = (ts) => new Date(ts).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '2px solid rgba(139,92,246,0.2)',
        borderTopColor: '#8B5CF6',
        animation: 'adm-spin 0.8s linear infinite',
        display: 'inline-block',
    }} />
);

// ── Access Denied ──────────────────────────────────────────────────────────────
const AccessDenied = () => (
    <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'white', textAlign: 'center', padding: '2rem',
    }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
            Acceso Denegado
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', maxWidth: '400px', lineHeight: 1.6 }}>
            Esta sección está reservada para administradores de BE4T.
            Si crees que esto es un error, contacta a{' '}
            <a href="mailto:admin@be4t.io" style={{ color: '#8B5CF6' }}>admin@be4t.io</a>
        </p>
    </div>
);

// ── Main AdminPanel ────────────────────────────────────────────────────────────
const AdminPanel = ({ session, isAdmin }) => {
    const [form, setForm] = useState({
        name:         '',
        artist:       '',
        apy:          '',
        price:        '',
        spotify_url:  '',
        cover_url:    '',
        genre:        'reggaeton',
        is_tokenized: true,
    });
    const [status,    setStatus]    = useState('idle'); // idle | loading | success | error
    const [message,   setMessage]   = useState('');
    const [recent,    setRecent]    = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    // Guard: only admins in production
    const canAccess = isAdmin && isProduction;

    // Fetch recent songs
    useEffect(() => {
        if (!canAccess || !isSupabaseReady) { setLoadingRecent(false); return; }
        supabase
            .from('assets')
            .select('id, name, artist_name, apy, token_price_usd, created_at')
            .order('created_at', { ascending: false })
            .limit(10)
            .then(({ data, error }) => {
                if (!error && data) setRecent(data);
                setLoadingRecent(false);
            });
    }, [canAccess, status]); // refetch after insert

    if (!canAccess) return <AccessDenied />;

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(f => ({ ...f, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.artist || !form.apy || !form.price) {
            setStatus('error');
            setMessage('Completa todos los campos obligatorios (Título, Artista, TEA, Precio).');
            return;
        }
        if (!isSupabaseReady) {
            setStatus('error');
            setMessage('Supabase no está configurado en este entorno.');
            return;
        }

        setStatus('loading');
        setMessage('');

        const spotifyId = extractSpotifyId(form.spotify_url);
        const payload = {
            name:               form.name.trim(),
            artist_name:        form.artist.trim(),
            apy:                parseFloat(form.apy),
            token_price_usd:    parseFloat(form.price),
            spotify_id:         spotifyId,
            cover_url:          form.cover_url.trim() || null,
            genre:              form.genre,
            asset_type:         'music',
            is_tokenized:       form.is_tokenized,
            total_supply:       10_000,
            tokens_available:   10_000,
            created_by:         session?.user?.id || null,
        };

        const { error } = await supabase.from('assets').insert(payload);

        if (error) {
            setStatus('error');
            setMessage(`Error al insertar: ${error.message}`);
        } else {
            setStatus('success');
            setMessage(`✓ "${form.name}" de ${form.artist} añadida exitosamente.`);
            setForm({ name: '', artist: '', apy: '', price: '', spotify_url: '', cover_url: '', genre: 'reggaeton', is_tokenized: true });
        }
    };

    return (
        <>
            <style>{`
                @keyframes adm-spin { to { transform: rotate(360deg); } }
                @keyframes adm-fade  {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .adm-input {
                    width: 100%; padding: 0.72rem 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 10px; color: white;
                    font-size: 0.9rem; font-family: 'Inter', sans-serif;
                    outline: none; box-sizing: border-box;
                    transition: border-color 0.2s;
                }
                .adm-input:focus { border-color: rgba(139,92,246,0.5); }
                .adm-input::placeholder { color: rgba(255,255,255,0.25); }
                .adm-label {
                    font-size: 0.65rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.9px;
                    color: rgba(255,255,255,0.4); display: block; margin-bottom: 0.4rem;
                }
            `}</style>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', color: 'white', fontFamily: "'Inter', sans-serif" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '2.5rem', animation: 'adm-fade 0.3s ease' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: '100px', padding: '0.3rem 0.85rem', marginBottom: '0.85rem',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', display: 'inline-block', boxShadow: '0 0 6px #8B5CF6' }} />
                        <span style={{ fontSize: '0.62rem', color: '#c4b5fd', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            Panel de Administrador — Solo acceso verificado
                        </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.35rem', lineHeight: 1.05 }}>
                        Gestión de{' '}
                        <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Activos
                        </span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0 }}>
                        Administrando como <strong style={{ color: '#c4b5fd' }}>{session?.user?.email}</strong>
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

                    {/* ── FORM ── */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.18)',
                        borderRadius: '20px', padding: '1.75rem',
                        animation: 'adm-fade 0.35s ease',
                    }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                            ➕ Nueva Canción
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Row: Título + Artista */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label className="adm-label">Título *</label>
                                    <input className="adm-input" placeholder="eg. Bichota" value={form.name} onChange={handleChange('name')} required />
                                </div>
                                <div>
                                    <label className="adm-label">Artista *</label>
                                    <input className="adm-input" placeholder="eg. Karol G" value={form.artist} onChange={handleChange('artist')} required />
                                </div>
                            </div>

                            {/* Row: TEA + Precio */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label className="adm-label">TEA / APY (%) *</label>
                                    <input className="adm-input" type="number" min="0" max="999" step="0.1" placeholder="eg. 22.5" value={form.apy} onChange={handleChange('apy')} required />
                                </div>
                                <div>
                                    <label className="adm-label">Precio Token (USD) *</label>
                                    <input className="adm-input" type="number" min="1" step="0.01" placeholder="eg. 25" value={form.price} onChange={handleChange('price')} required />
                                </div>
                            </div>

                            {/* Género */}
                            <div>
                                <label className="adm-label">Género</label>
                                <select className="adm-input" value={form.genre} onChange={handleChange('genre')}>
                                    {['reggaeton', 'latin_pop', 'trap', 'cumbia', 'salsa', 'bachata', 'rock_en_espanol', 'otro'].map(g => (
                                        <option key={g} value={g} style={{ background: '#0f1117' }}>
                                            {g.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Spotify URL */}
                            <div>
                                <label className="adm-label">Link de Spotify</label>
                                <input className="adm-input" placeholder="https://open.spotify.com/track/..." value={form.spotify_url} onChange={handleChange('spotify_url')} />
                                {form.spotify_url && extractSpotifyId(form.spotify_url) && (
                                    <p style={{ fontSize: '0.65rem', color: '#4ade80', marginTop: '3px' }}>
                                        ✓ Spotify ID: {extractSpotifyId(form.spotify_url)}
                                    </p>
                                )}
                                {form.spotify_url && !extractSpotifyId(form.spotify_url) && (
                                    <p style={{ fontSize: '0.65rem', color: '#f87171', marginTop: '3px' }}>
                                        URL de Spotify inválida
                                    </p>
                                )}
                            </div>

                            {/* Cover URL */}
                            <div>
                                <label className="adm-label">Cover URL (opcional)</label>
                                <input className="adm-input" placeholder="https://..." value={form.cover_url} onChange={handleChange('cover_url')} />
                            </div>

                            {/* Cover preview */}
                            {form.cover_url && (
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <img src={form.cover_url} alt="preview"
                                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Preview</span>
                                </div>
                            )}

                            {/* Tokenized toggle */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                                <input type="checkbox" checked={form.is_tokenized} onChange={handleChange('is_tokenized')}
                                    style={{ width: '16px', height: '16px', accentColor: '#8B5CF6', cursor: 'pointer' }} />
                                Marcar como tokenizada (visible en marketplace)
                            </label>

                            {/* Status message */}
                            {message && (
                                <div style={{
                                    padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', lineHeight: 1.5,
                                    background: status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                                    border: `1px solid ${status === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'}`,
                                    color: status === 'success' ? '#4ade80' : '#f87171',
                                }}>
                                    {message}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                style={{
                                    padding: '0.9rem', width: '100%',
                                    background: status === 'loading'
                                        ? 'rgba(139,92,246,0.15)'
                                        : 'linear-gradient(135deg, #4c1d95, #8B5CF6)',
                                    border: '1px solid rgba(139,92,246,0.4)',
                                    borderRadius: '12px', color: 'white',
                                    fontWeight: '800', fontSize: '0.95rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                    transition: 'all 0.2s',
                                    boxShadow: status === 'loading' ? 'none' : '0 4px 20px rgba(139,92,246,0.3)',
                                }}
                            >
                                {status === 'loading' ? (
                                    <><Spinner size={18} /> Insertando en Base de Datos…</>
                                ) : (
                                    '+ Insertar Canción'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ── RECENT SONGS TABLE ── */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '20px', padding: '1.75rem',
                        animation: 'adm-fade 0.4s ease',
                    }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                            🎵 Últimas Adiciones
                        </h2>

                        {loadingRecent ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner size={32} /></div>
                        ) : recent.length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                                Aún no hay canciones en la base de datos.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {recent.map(r => (
                                    <div key={r.id} style={{
                                        padding: '0.7rem 0.9rem',
                                        background: 'rgba(255,255,255,0.025)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '10px',
                                        display: 'grid', gridTemplateColumns: '1fr auto',
                                        alignItems: 'center', gap: '0.5rem',
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{r.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{r.artist_name}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#10b981' }}>{r.apy}% TEA</div>
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                                                {r.created_at ? fmtDate(r.created_at) : '—'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isSupabaseReady && (
                            <div style={{
                                marginTop: '1rem', padding: '0.75rem', background: 'rgba(245,158,11,0.08)',
                                border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px',
                                fontSize: '0.75rem', color: '#fbbf24',
                            }}>
                                ⚠ Supabase no configurado — los datos no se persistirán.
                                Asegúrate de que <code>VITE_SUPABASE_ANON_KEY</code> esté en las variables de entorno de Vercel.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── SQL Reminder ── */}
                <div style={{
                    marginTop: '2rem', padding: '1rem 1.25rem',
                    background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: '12px', animation: 'adm-fade 0.5s ease',
                }}>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.7 }}>
                        <strong style={{ color: '#a78bfa' }}>Nota técnica:</strong> Las canciones se insertan en la tabla <code>assets</code> de Supabase.
                        Asegúrate de haber corrido el migration SQL (<code>001_rbac_profiles.sql</code>) y que tu usuario tenga <code>role = admin</code> en la tabla <code>profiles</code>.
                        El campo <code>spotify_id</code> se extrae automáticamente del link de Spotify para hidratación de métricas en tiempo real.
                    </p>
                </div>
            </div>
        </>
    );
};

export default AdminPanel;
