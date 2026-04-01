import React, { useState, useRef, useEffect } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const SpotifyIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);
const YouTubeIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);
const TikTokIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2DD4BF">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" />
    </svg>
);
const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);
const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5,3 19,12 5,21" />
    </svg>
);
const PauseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
    </svg>
);

const fmt = (n) => {
    if (!n) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
};
const fmtUSD = (v) => v != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v)
    : '$—';

// ── Royalty Calculator (right column) ─────────────────────────────────────────
const ROI_PER_MILLION = 3000; // $3,000 per 1M streams

const RoyaltyCalculator = ({ asset }) => {
    const [amount, setAmount] = useState(50);
    const presets = [50, 100, 250, 500];

    const meta = asset.metadata || {};
    const totalVal = asset.valuation_usd || (asset.token_price_usd * asset.total_supply) || 25000;
    const tokenPrice = asset.token_price_usd || totalVal / (asset.total_supply || 1000);
    const streams = meta.spotify_streams || totalVal * 12.5;
    const annualRoyalties = (streams / 1_000_000) * ROI_PER_MILLION;
    const ownershipPct = amount / totalVal;
    const annualReturn = annualRoyalties * ownershipPct;
    const roi = totalVal > 0 ? (annualReturn / amount) * 100 : 0;
    const royaltyShare = meta.funding_percent ? 8 : 8; // royalty share %, displayed

    return (
        <div style={{
            background: 'rgba(15,12,25,0.9)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>🧮</span>
                <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>Calculadora de Retorno</h3>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Amount input display */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Monto a Invertir</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>{fmtUSD(amount)}</span>
                </div>

                {/* Slider */}
                <div>
                    <input
                        type="range" min={10} max={5000} step={10}
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>
                        <span>Mín: $10.00</span>
                        <span>Máx: $5,000.00</span>
                    </div>
                </div>

                {/* Preset buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {presets.map(p => (
                        <button
                            key={p}
                            onClick={() => setAmount(p)}
                            style={{
                                flex: 1, padding: '0.45rem 0',
                                borderRadius: '8px',
                                border: amount === p ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                background: amount === p ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                                color: amount === p ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.8rem', fontWeight: amount === p ? '700' : '400',
                                cursor: 'pointer', transition: 'all 0.2s ease',
                            }}
                        >
                            ${p}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                {/* Metrics rows */}
                {[
                    { label: '% Tu participación', value: `${(ownershipPct * 100).toFixed(3)}%`, color: '#c4b5fd' },
                    { label: '↗ Retorno Est. (Anual)', value: fmtUSD(annualReturn), color: '#22c55e' },
                    { label: '$ Regalías Incluidas', value: `${royaltyShare}% del total`, color: 'white' },
                ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>{row.label}</span>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: row.color }}>{row.value}</span>
                    </div>
                ))}

                {/* Disclaimer */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px', padding: '0.75rem',
                    fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.55,
                }}>
                    El ROI estimado de <strong style={{ color: '#c4b5fd' }}>{roi.toFixed(1)}%</strong> se basa en el rendimiento histórico de streams y regalías. Los retornos pasados no garantizan retornos futuros.
                </div>

                {/* CTA — the ONLY invest button */}
                <button
                    onClick={() => alert(`💜 Confirmando inversión de ${fmtUSD(amount)} en "${asset.name}"\n\nRetorno anual estimado: ${fmtUSD(annualReturn)}\nParticipación: ${(ownershipPct * 100).toFixed(3)}%\n\n✅ En producción, aquí se conectará tu wallet o tarjeta.`)}
                    style={{
                        width: '100%', padding: '1rem',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        border: 'none', borderRadius: '12px',
                        color: 'white', fontWeight: '800', fontSize: '1rem',
                        cursor: 'pointer', letterSpacing: '-0.01em',
                        transition: 'opacity 0.2s ease',
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                    Invertir en esta Canción
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', margin: '-0.5rem 0 0' }}>
                    Al invertir aceptas los términos y condiciones de BE4T.
                </p>
            </div>
        </div>
    );
};

// ── Main AssetDetailView ──────────────────────────────────────────────────────
const AssetDetailView = ({ asset, allAssets = [], onBack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const audioRef = useRef(null);
    const meta = asset.metadata || {};

    const cover = (!imgErr && (asset.cover_url || asset.image)) ? (asset.cover_url || asset.image) : null;
    const totalVal = asset.valuation_usd || (asset.token_price_usd * asset.total_supply) || 0;
    const fundingPct = meta.funding_percent || 74;
    const raised = meta.raised_amount || Math.round(totalVal * fundingPct / 100);

    // Audio player
    const previewUrl = meta.preview_url || asset.preview_url;

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        return () => { audioRef.current?.pause(); };
    }, []);

    // Related songs (exclude current)
    const relatedSongs = allAssets.filter(a => a.id !== asset.id).slice(0, 3);

    return (
        <div style={{ background: '#0a0a0f', minHeight: '100vh', color: 'white' }}>
            {/* Hidden audio element */}
            {previewUrl && <audio ref={audioRef} src={previewUrl} onEnded={() => setIsPlaying(false)} />}

            {/* Top bar */}
            <div style={{
                maxWidth: '1100px', margin: '0 auto',
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', padding: '0.5rem 0.9rem',
                        color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.85rem',
                    }}
                >
                    <BackIcon /> Volver
                </button>

                {/* Quick stats in header */}
                <div style={{ flex: 1, display: 'flex', gap: '2rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {[
                        { label: 'TOTAL STREAMS', value: fmt(meta.spotify_streams), color: '#1DB954' },
                        { label: 'TOTAL VIEWS', value: fmt(meta.youtube_views), color: '#FF0000' },
                        { label: 'CREATIONS', value: fmt(meta.tiktok_creations), color: '#2DD4BF' },
                    ].map(stat => (
                        <div key={stat.label} style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.62rem', color: stat.color, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.15rem' }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Song title row */}
            <div style={{
                maxWidth: '1100px', margin: '0 auto',
                padding: '0 1.5rem 1rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
                {cover && (
                    <img src={cover} onError={() => setImgErr(true)} alt={asset.name}
                        style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                )}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: '100px', padding: '2px 10px', fontSize: '0.68rem', color: '#c4b5fd', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>MUSIC</span>
                        {meta.is_trending && (
                            <span style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '100px', padding: '2px 10px', fontSize: '0.68rem', color: '#f87171', fontWeight: '700', letterSpacing: '1px' }}>🔥 HOT</span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, letterSpacing: '-0.03em' }}>{asset.name}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.95rem' }}>{meta.artist}</p>
                </div>
            </div>

            {/* Funding progress bar */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 2rem' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px', padding: '1rem 1.25rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>Progreso de Financiamiento</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2dd4bf' }}>
                            ↗ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(raised)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalVal)}
                        </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px' }}>
                        <div style={{
                            height: '100%', borderRadius: '100px',
                            width: `${Math.min(fundingPct, 100)}%`,
                            background: 'linear-gradient(90deg, #7c3aed, #2dd4bf)',
                        }} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem', margin: '0.4rem 0 0' }}>
                        {fundingPct}% completado — {meta.yield_estimate || '8%'} regalías para inversores
                    </p>
                </div>
            </div>

            {/* ── Two-Column Layout ── */}
            <div style={{
                maxWidth: '1100px', margin: '0 auto',
                padding: '0 1.5rem 4rem',
                display: 'grid',
                gridTemplateColumns: '1fr 420px',
                gap: '2rem',
                alignItems: 'start',
            }}>
                {/* ─── LEFT COLUMN ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Cover + Audio Player */}
                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '4/3', background: '#111' }}>
                        {cover ? (
                            <img src={cover} onError={() => setImgErr(true)} alt={asset.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a0a2e, #0a1628)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🎵</div>
                        )}
                        {/* Gradient overlay */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(5,5,15,0.95) 0%, transparent 100%)' }} />
                        {/* Song label on image */}
                        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.3rem' }}>{asset.name}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{meta.artist}</div>
                        </div>
                        {/* Play button */}
                        {previewUrl && (
                            <button
                                onClick={togglePlay}
                                style={{
                                    position: 'absolute', bottom: '1rem', right: '1rem',
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: 'rgba(139,92,246,0.9)',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'transform 0.2s ease',
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                        )}
                    </div>

                    {/* Verify on Platforms */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 1rem', fontWeight: '500', lineHeight: 1.4 }}>
                            🎧 Escucha la canción completa o mira el video en:
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                            {[
                                { icon: <SpotifyIcon size={14} />, label: 'Spotify', bg: 'rgba(29,185,84,0.15)', border: 'rgba(29,185,84,0.3)', color: '#1DB954', url: `https://open.spotify.com/search/${encodeURIComponent(asset.name)}` },
                                { icon: <YouTubeIcon size={14} />, label: 'YouTube', bg: 'rgba(255,0,0,0.12)', border: 'rgba(255,0,0,0.3)', color: '#FF4444', url: `https://youtube.com/results?search_query=${encodeURIComponent(asset.name + ' ' + (meta.artist || ''))}` },
                                { icon: <TikTokIcon size={14} />, label: 'TikTok', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.3)', color: '#2DD4BF', url: `https://tiktok.com/search?q=${encodeURIComponent(asset.name)}` },
                            ].map(p => (
                                <a
                                    key={p.label}
                                    href={p.url} target="_blank" rel="noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                        padding: '0.65rem',
                                        background: p.bg, border: `1px solid ${p.border}`,
                                        borderRadius: '10px', color: p.color,
                                        fontWeight: '600', fontSize: '0.85rem',
                                        textDecoration: 'none', transition: 'all 0.2s ease',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                >
                                    {p.icon} {p.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Streaming Metrics ── */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                    }}>
                        <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.1rem' }}>
                            MÉTRICAS DE PLATAFORMAS
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {/* Spotify Streams */}
                            <div style={{
                                background: 'rgba(29,185,84,0.07)',
                                border: '1px solid rgba(29,185,84,0.2)',
                                borderRadius: '10px', padding: '1rem',
                                display: 'flex', flexDirection: 'column', gap: '0.4rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <SpotifyIcon size={13} />
                                    <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#1DB954', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        STREAMS
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                    {fmt(meta.spotify_streams)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>en Spotify</div>
                            </div>

                            {/* YouTube Views */}
                            <div style={{
                                background: 'rgba(255,0,0,0.07)',
                                border: '1px solid rgba(255,0,0,0.2)',
                                borderRadius: '10px', padding: '1rem',
                                display: 'flex', flexDirection: 'column', gap: '0.4rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <YouTubeIcon size={13} />
                                    <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#FF4444', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        VIEWS
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                    {fmt(meta.youtube_views)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>en YouTube</div>
                            </div>

                            {/* TikTok Creations */}
                            <div style={{
                                background: 'rgba(45,212,191,0.07)',
                                border: '1px solid rgba(45,212,191,0.2)',
                                borderRadius: '10px', padding: '1rem',
                                display: 'flex', flexDirection: 'column', gap: '0.4rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <TikTokIcon size={13} />
                                    <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        CREACIONES
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                    {fmt(meta.tiktok_creations)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>en TikTok</div>
                            </div>
                        </div>
                    </div>

                    {/* About the song */}
                    {meta.review && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', margin: '0 0 0.75rem' }}>Sobre esta canción</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>{meta.review}</p>
                        </div>
                    )}

                    {/* About the artist */}
                    {meta.bio && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', margin: '0 0 0.75rem' }}>Sobre el artista</h4>
                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #7c3aed, #2dd4bf)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '800', fontSize: '1.1rem',
                                }}>
                                    {(meta.artist || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', marginBottom: '0.3rem' }}>{meta.artist}</div>
                                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>{meta.bio}</p>
                                    <a href={`https://open.spotify.com/search/${encodeURIComponent(meta.artist || '')}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#a855f7', textDecoration: 'none' }}>↗ Ver perfil completo</a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Related songs */}
                    {relatedSongs.length > 0 && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', margin: '0 0 1rem' }}>Más canciones</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                {relatedSongs.map(song => {
                                    const songMeta = song.metadata || {};
                                    const songCover = song.cover_url || song.image || songMeta.image;
                                    return (
                                        <div
                                            key={song.id}
                                            onClick={() => onBack && onBack(song)}
                                            style={{ cursor: 'pointer', textAlign: 'center' }}
                                        >
                                            <div style={{ aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: '#222', marginBottom: '0.5rem' }}>
                                                {songCover ? (
                                                    <img src={songCover} alt={song.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2a1458, #0d2040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎵</div>
                                                )}
                                            </div>
                                            <div style={{ fontWeight: '600', fontSize: '0.82rem', lineHeight: 1.2, marginBottom: '0.15rem' }}>{song.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{songMeta.artist || ''}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── RIGHT COLUMN: Calculator ─── */}
                <div style={{ position: 'sticky', top: '80px' }}>
                    <RoyaltyCalculator asset={asset} />
                </div>
            </div>
        </div>
    );
};

export default AssetDetailView;
