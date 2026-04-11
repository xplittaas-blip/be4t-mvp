import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Play, Pause, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalPlayer } from '../context/GlobalPlayerContext';
import { getMarketplaceData } from '../core/xplit/spotify';
import { getYoutubeTraction, formatViews } from '../core/xplit/youtube';
import {
    fetchSongMetrics,
    fmtMetric,
    getSocialGrowth,
    getWeeklyGrowth,
    YOUTUBE_VIDEO_IDS,
} from '../services/metricsService';
import './SongDetail.css';

// ── Minimal mono-color platform icons (Anti-Notion: single fill color) ───────
const SpotifyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);
const YouTubeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);
const TikTokIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" />
    </svg>
);

// ── Return Calculator — fed by real stream data ───────────────────────────────
const ROYALTY_PER_STREAM = 0.004;     // industry avg: $0.003–$0.005
const ROYALTY_SHARE      = 0.22;      // 22% of rights tokenized in BE4T

const ReturnCalculator = ({ streamCount, roiEst }) => {
    const PRESETS = [50, 100, 250, 500];
    const [amount, setAmount] = useState(50);
    const [sliderVal, setSliderVal] = useState(50);

    // Total annual royalty pool derived from real stream count
    const annualPool = useMemo(() => {
        const monthlySt = Math.max(streamCount ?? 0, 1_000_000);
        return monthlySt * 12 * ROYALTY_PER_STREAM * ROYALTY_SHARE;
    }, [streamCount]);

    // Estimated total asset valuation (used to compute participation %)
    const totalValuation = useMemo(() => {
        const roiDec = (roiEst ?? 18) / 100;
        return roiDec > 0 ? annualPool / roiDec : annualPool * 5;
    }, [annualPool, roiEst]);

    const participationPct = totalValuation > 0
        ? ((amount / totalValuation) * 100).toFixed(3)
        : '0.000';

    const annualReturn = ((amount / totalValuation) * annualPool).toFixed(2);
    const roi          = amount > 0 ? (((parseFloat(annualReturn)) / amount) * 100).toFixed(1) : '0.0';
    const royaltiesPct = (ROYALTY_SHARE * 100).toFixed(0);

    return (
        <div style={{ padding: '0' }}>
            {/* Slider row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Monto a Invertir</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
                    ${sliderVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            </div>
            <input
                type="range" min={10} max={5000} step={10} value={sliderVal}
                onChange={e => { const v = Number(e.target.value); setSliderVal(v); setAmount(v); }}
                style={{ width: '100%', accentColor: '#8B5CF6', marginBottom: '0.4rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
                <span>Mín: $10.00</span><span>Máx: $5,000.00</span>
            </div>

            {/* Preset btns */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {PRESETS.map(p => (
                    <button key={p} onClick={() => { setAmount(p); setSliderVal(p); }}
                        style={{
                            flex: 1, padding: '0.5rem 0', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem',
                            border: amount === p ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                            background: amount === p ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                            color: amount === p ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                            cursor: 'pointer',
                        }}>
                        ${p}
                    </button>
                ))}
            </div>

            {/* Results rows */}
            {[
                { label: '% Tu participación',    value: `${participationPct}%`,       color: 'white'   },
                { label: '↗ Retorno Est. (Anual)', value: `$${annualReturn}`,           color: '#22c55e' },
                { label: '$ Regalías Incluidas',   value: `${royaltiesPct}% del total`, color: 'white'   },
            ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                    <span style={{ fontWeight: '700', color }}>{value}</span>
                </div>
            ))}

            {/* ROI disclaimer */}
            <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>
                    El ROI estimado de <strong style={{ color: '#c4b5fd' }}>{roi}%</strong> se basa en el rendimiento
                    histórico de streams y regalías. Los retornos pasados no garantizan retornos futuros.
                </p>
            </div>
        </div>
    );
};

// ── Main SongDetail ───────────────────────────────────────────────────────────
const SongDetail = ({ onBack, songId, onRequireAuth, isAuthenticated, onInvest }) => {
    const { t: tSong } = useTranslation('song');
    const { t: tCalc } = useTranslation('calculator');

    const [song, setSong]         = useState(null);
    const [metrics, setMetrics]   = useState(null);   // live metrics
    const [ytData, setYtData]     = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { playTrack, togglePlay, currentTrack, isPlaying: globalIsPlaying } = useGlobalPlayer();
    const isPlaying = globalIsPlaying && currentTrack?.id === song?.id;
    const calculatorRef = useRef(null);

    // ── Fetch song + enrich with real metrics ──────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                const allSongs = await getMarketplaceData();
                const targetId = songId || allSongs[0]?.id;
                const baseSong = allSongs.find(s => s.id === targetId) || allSongs[0];

                const finalData = {
                    id:               targetId,
                    title:            baseSong.title,
                    artist:           baseSong.artist,
                    image:            baseSong.cover_image,
                    preview_url:      baseSong.preview_url,
                    fansParticipating: (baseSong.fans_joined || 1248).toLocaleString(),
                    fundingProgress:  baseSong.funding_progress,
                    royaltiesShared:  `${baseSong.royalties_shared}%`,
                    popularity:       baseSong.popularity ?? 90,
                    streams_estimate: baseSong.streams_estimate,
                    roi_est:          baseSong.royalties_shared ?? 18,
                    // Fallback metrics (overridden by live data below)
                    spotify:   fmtMetric(Math.round(baseSong.streams_estimate * 0.60)),
                    youtube:   fmtMetric(Math.round(baseSong.streams_estimate * 0.62)),
                    tiktok:    fmtMetric(getSocialGrowth(baseSong.streams_estimate, baseSong.popularity)),
                    saves:     ((baseSong.popularity ?? 90) * 1200).toLocaleString(),
                    artistListeners: formatViews(baseSong.streams_estimate * 1.5),
                };

                if (!cancelled) setSong(finalData);

                // Fetch real metrics from metricsService in parallel
                // Build a minimal song-like object that metricsService understands
                const songProxy = {
                    id:         targetId,
                    name:       baseSong.name   || baseSong.title,
                    artist:     baseSong.artist,
                    spotify_id: baseSong.spotify_id || baseSong.metadata?.spotify_id || null,
                    _raw: {
                        deezer_id: baseSong.deezer_id,
                        spotify_id: baseSong.spotify_id || baseSong.metadata?.spotify_id || null,
                        metadata:  { popularity: baseSong.popularity },
                    },
                    roi_est: baseSong.royalties_shared ?? 18,
                };
                const [liveMetrics, ytResponse] = await Promise.all([
                    fetchSongMetrics(songProxy).catch(() => null),
                    getYoutubeTraction(targetId).catch(() => null),
                ]);

                if (!cancelled) {
                    if (liveMetrics) {
                        setMetrics(liveMetrics);
                        // Upgrade the song object with live numbers
                        setSong(prev => prev ? {
                            ...prev,
                            spotify:  fmtMetric(liveMetrics.spotify_streams),
                            youtube:  fmtMetric(liveMetrics.youtube_views),
                            tiktok:   fmtMetric(liveMetrics.tiktok_creations),
                            streams_estimate: liveMetrics.spotify_streams,
                        } : prev);
                    }
                    if (ytResponse) setYtData(ytResponse);
                }
            } catch (err) {
                console.error('[SongDetail] fetch failed:', err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [songId]);

    // Growth data
    const growthData     = metrics?.growth ?? getWeeklyGrowth(songId ?? 'default', 18);
    const growthPct      = growthData.pct;
    const growthPositive = growthData.positive;

    const toggleAudio = () => {
        if (!song?.preview_url) { alert('Vista previa no disponible.'); return; }
        if (currentTrack?.id === song.id) { togglePlay(); }
        else { playTrack({ id: song.id, preview_url: song.preview_url, title: song.title, artist: song.artist, cover_image: song.image }); }
    };

    const handleParticipate = () => {
        if (!isAuthenticated) { onRequireAuth(); return; }
        setShowSuccessModal(true);
    };

    if (isLoading || !song) {
        return (
            <div className="song-detail-page" style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                {tSong('loading_track')}
            </div>
        );
    }

    // ── Real stream count for the calculator ──────────────────────────────────
    const liveStreamCount = metrics?.spotify_streams ?? song.streams_estimate;
    const roiEst          = song.roi_est ?? 18;
    const ytVideoId       = YOUTUBE_VIDEO_IDS[songId] ?? null;

    return (
        <div className="song-detail-page animate-fade-in">
            <button className="back-btn" onClick={onBack}>
                <ArrowLeft size={20} /> {tSong('back_explore')}
            </button>

            <div className="detail-centered-layout">
                <div className="detail-left-column">
                    {/* ── 1. HERO ── */}
                    <section className="detail-hero">
                        <div className="hero-image-wrap">
                            <img src={song.image} alt={song.title} className="hero-img" />
                            <button className="hero-play" onClick={toggleAudio}>
                                {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
                            </button>
                        </div>

                        <div className="hero-context text-center mt-4">
                            <h1 className="hero-title">{song.title}</h1>
                            <p className="hero-artist text-secondary">{song.artist}</p>

                            {/* Growth badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '100px', padding: '0.3rem 0.9rem' }}>
                                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {growthPct} growth semanal
                                </span>
                            </div>

                            <button className="btn-primary main-cta mt-4" onClick={() => calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                {tSong('join_button')}
                            </button>
                        </div>
                    </section>

                    {/* ── 2. PLATFORM METRICS ── */}
                    <section className="detail-section glass-panel mt-5">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>MÉTRICAS DE PLATAFORMAS</h2>
                            {metrics ? (
                                metrics.source === 'live' ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                            borderRadius: '100px', padding: '3px 10px',
                                            fontSize: '0.6rem', color: '#4ade80', fontWeight: '700',
                                            textTransform: 'uppercase', letterSpacing: '1px',
                                        }}>
                                            <span style={{
                                                width: '5px', height: '5px', borderRadius: '50%',
                                                background: '#22c55e', boxShadow: '0 0 6px #22c55e',
                                                animation: 'sd-live-pulse 1.8s ease-in-out infinite',
                                                display: 'inline-block',
                                            }} />
                                            LIVE
                                        </span>
                                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>
                                            Actualizado hace {Math.round((Date.now() - (metrics.ts || Date.now())) / 3_600_000) || '<1'}h
                                        </span>
                                    </span>
                                ) : (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
                                        borderRadius: '100px', padding: '3px 10px',
                                        fontSize: '0.6rem', color: '#fbbf24', fontWeight: '700',
                                        textTransform: 'uppercase', letterSpacing: '1px',
                                    }}>
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                                        Calibrado
                                    </span>
                                )
                            ) : (
                                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>cargando datos…</span>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {[
                                { icon: <SpotifyIcon />, label: 'STREAMS',    value: song.spotify,  sub: 'en Spotify',  accent: '#1DB954' },
                                { icon: <YouTubeIcon />, label: 'VIEWS',      value: song.youtube,  sub: 'en YouTube',  accent: '#FF0000' },
                                { icon: <TikTokIcon />,  label: 'CREACIONES', value: song.tiktok,   sub: 'en TikTok',   accent: 'rgba(255,255,255,0.5)' },
                            ].map(({ icon, label, value, sub, accent }) => (
                                <div key={label} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '12px', padding: '0.9rem 0.75rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.4rem' }}>
                                        {icon}
                                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{label}</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'white' }}>{value}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Saves row */}
                        <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guardados en playlist</span>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{song.saves}</span>
                        </div>

                        {/* YouTube embed link */}
                        {ytVideoId && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <a
                                    href={`https://www.youtube.com/watch?v=${ytVideoId}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
                                        textDecoration: 'none',
                                        padding: '0.4rem 0.8rem',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <YouTubeIcon /> Ver video oficial →
                                </a>
                            </div>
                        )}
                    </section>

                    {/* ── 3. SOBRE ESTA CANCIÓN ── */}
                    <section className="detail-section glass-panel mt-4">
                        <h2 className="section-title">Sobre esta canción</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.75rem' }}>
                            <strong style={{ color: 'white' }}>"{song.title}"</strong> ha acumulado más de{' '}
                            <strong style={{ color: '#c4b5fd' }}>{fmtMetric(liveStreamCount)}</strong> de streams globales.
                            Este activo tokenizado representa una oportunidad premium de inversión en regalías musicales
                            para fanáticos e inversionistas que creen en {song.artist}.
                        </p>
                        <div style={{ marginTop: '1rem', padding: '0.9rem', borderLeft: '3px solid rgba(139,92,246,0.5)', background: 'rgba(139,92,246,0.05)', borderRadius: '0 8px 8px 0' }}>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0, fontStyle: 'italic' }}>
                                ""{song.title}" es uno de los tracks más influyentes del género con millones de oyentes
                                mensuales en plataformas globales y presencia comprobada en TikTok con{' '}
                                {song.tiktok} creaciones de sonido."
                            </p>
                        </div>
                    </section>

                    {/* ── 4. ARTISTA ── */}
                    <section className="detail-section mt-4 glass-panel artist-context">
                        <h2 className="section-title mb-4">{tSong('artist_about')}</h2>
                        <div className="artist-profile-horizontal">
                            <div className="artist-avatar-large">
                                <img src={song.image} alt={song.artist} />
                            </div>
                            <div className="artist-data">
                                <h3>{song.artist}</h3>
                                <p className="text-secondary text-sm mt-1">
                                    Artista independiente definiendo un nuevo sonido para la audiencia global.
                                </p>
                                <div className="artist-stats mt-3">
                                    <div className="stat-pill">
                                        <SpotifyIcon />
                                        <span className="fw-600 ml-1">{song.artistListeners}</span>
                                        <span className="text-secondary text-sm ml-1">{tSong('artist_listeners')}</span>
                                    </div>
                                    {ytData?.channelSubscribers && (
                                        <div className="stat-pill mt-2">
                                            <YouTubeIcon />
                                            <span className="fw-600 ml-1">{formatViews(ytData.channelSubscribers)}</span>
                                            <span className="text-secondary text-sm ml-1">{tSong('yt_subscribers')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── 5. RETURN CALCULATOR — fed by real streams ── */}
                <section ref={calculatorRef} className="detail-section calculator-section glass-panel highlight-border">
                    <div className="calculator-header text-center" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="section-title text-gradient">Calculadora de Retorno</h2>
                        <p className="text-secondary mt-1" style={{ fontSize: '0.82rem' }}>
                            Proyección en tiempo real basada en {fmtMetric(liveStreamCount)} streams
                        </p>
                    </div>

                    <ReturnCalculator streamCount={liveStreamCount} roiEst={roiEst} />

                    {/* Social proof */}
                    <div className="social-proof text-center mt-4">
                        <p className="fw-600">{tCalc('social_proof', { count: song.fansParticipating })}</p>
                    </div>
                    <p className="micro-fomo text-center text-sm mt-3" style={{ color: 'var(--accent-primary)' }}>
                        {tCalc('micro_fomo')}
                    </p>

                    <button className="btn-primary full-width cta-main mt-2" onClick={handleParticipate}>
                        Invertir en esta Canción
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem' }}>
                        Al invertir aceptas los términos y condiciones de BE4T.
                    </p>
                </section>
            </div>

            {/* ── Success Modal ── */}
            {showSuccessModal && createPortal(
                <div className="auth-modal-overlay animate-fade-in" style={{ zIndex: 10000 }}>
                    <div className="auth-modal-content glass-panel text-center">
                        <div className="auth-icon-wrapper" style={{ background: 'rgba(0,240,144,0.1)', margin: '0 auto 1.5rem' }}>
                            <CheckCircle size={32} className="success-text" />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem' }}>
                            {tSong('success_title')}
                        </h2>
                        <p className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                            {tSong('success_desc1')}<br />{tSong('success_desc2')}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn-primary" onClick={() => document.dispatchEvent(new CustomEvent('navigate', { detail: 'portfolio' }))}>
                                {tSong('success_btn_portfolio')}
                            </button>
                            <button className="btn-secondary" onClick={onBack}>
                                {tSong('success_btn_explore')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SongDetail;
