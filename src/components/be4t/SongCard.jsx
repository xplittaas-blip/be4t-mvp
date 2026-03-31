import React, { useState, useRef, useEffect, useCallback } from 'react';
import { audioManager } from '../../services/audioManager';

// ── Format helpers ────────────────────────────────────────────────────────────
const fmt = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
};
const fmtUSD = (v) => v != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v)
    : '$—';

// ── Platform SVG icons ────────────────────────────────────────────────────────
const SpotifyIcon = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);
const YouTubeIcon = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);
const TikTokIcon = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2DD4BF">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" />
    </svg>
);

// ── Normalize Supabase/Spotify row → SongCard props ───────────────────────────
export const normalizeSong = (raw) => {
    const meta = raw.metadata || {};
    const totalVal = raw.valuation_usd || (raw.token_price_usd * raw.total_supply) || 0;
    const seed = String(raw.id).split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    const fundingPct = meta.funding_percent ?? raw.funding_percent ?? (40 + (seed % 55));
    const raisedAmount = meta.raised_amount ?? raw.raised_amount ?? (totalVal * fundingPct / 100);

    const yieldStr = meta.yield_estimate || raw.yield_prospect || raw.apy || '14%';
    const roi = parseFloat(yieldStr.replace('%', '')) || 14;

    return {
        id:               raw.id,
        title:            raw.name || raw.title || 'Sin título',
        artist:           meta.artist || raw.artist_name || raw.artist || 'Artista',
        // REGLA DE ORO: cover_url viene EXCLUSIVAMENTE de Spotify album images
        cover_url:        raw.cover_url || raw.image || meta.image || null,
        // REGLA DE ORO: preview_url viene EXCLUSIVAMENTE de Spotify
        preview_url:      raw.preview_url || meta.preview_url || null,
        asset_type:       raw.asset_type === 'music' ? 'MUSIC' : 'RWA',
        tag:              raw.tag || (raw.asset_type === 'music' ? 'MUSIC' : 'RWA'),
        spotify_streams:  meta.spotify_streams || raw.spotify_streams
                          || Math.floor(totalVal * 12.5 + seed * 1000),
        youtube_views:    meta.youtube_views || raw.youtube_views
                          || Math.floor(totalVal * 8.2 + seed * 500),
        tiktok_creations: meta.tiktok_creations || raw.tiktok_creations
                          || Math.floor(totalVal * 0.9 + seed * 100),
        growth:           `+${roi.toFixed(1)}%`,
        growth_positive:  roi >= 0,
        funding_percent:  fundingPct,
        raised_amount:    raisedAmount,
        total_valuation:  totalVal,
        price:            raw.token_price_usd || (totalVal / (raw.total_supply || 1000)),
        roi_est:          roi,
        is_tokenized:     raw.is_tokenized || false,
        contract_address: raw.contract_address || null,
        is_trending:      meta.is_trending || raw.is_trending || false,
        _raw:             raw,
    };
};

// ── Skeleton Card ─────────────────────────────────────────────────────────────
export const SongCardSkeleton = () => (
    <div style={{
        background: 'rgba(18,18,30,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', overflow: 'hidden',
        animation: 'pulse 1.8s ease-in-out infinite',
    }}>
        <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ height: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', width: '70%' }} />
            <div style={{ height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', width: '45%' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[1,2,3].map(i => <div key={i} style={{ height: '36px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />)}
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px' }} />
            <div style={{ height: '44px', background: 'rgba(139,92,246,0.1)', borderRadius: '10px' }} />
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
    </div>
);

// ── Main SongCard ─────────────────────────────────────────────────────────────
const SongCard = ({ song, userMode, index = 0, onDetailClick }) => {
    const [hovered, setHovered]     = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Cleanup on unmount or song change
    useEffect(() => {
        if (audioRef.current) {
            audioManager.stop(audioRef.current);
            audioRef.current = null;
        }
        setIsPlaying(false);
    }, [song.id]);

    useEffect(() => () => {
        if (audioRef.current) audioManager.stop(audioRef.current);
    }, []);

    const handlePlayClick = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!song.preview_url) return;

        if (isPlaying && audioRef.current) {
            audioManager.stop(audioRef.current);
            audioRef.current = null;
            setIsPlaying(false);
        } else {
            const audio = audioManager.play(song.preview_url, () => {
                audioRef.current = null;
                setIsPlaying(false);
            });
            audioRef.current = audio;
            setIsPlaying(true);
        }
    }, [isPlaying, song.preview_url]);

    const isRWA = song.asset_type === 'RWA' || song.asset_type === 'custom';
    const badgeColor = isRWA
        ? { bg: 'rgba(20,184,166,0.2)', border: 'rgba(20,184,166,0.5)', text: '#2dd4bf' }
        : { bg: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.5)', text: '#c4b5fd' };

    // ── Background: Spotify album cover via background-image CSS ──────────────
    const coverBg = song.cover_url
        ? `url("${song.cover_url}")`
        : 'linear-gradient(135deg, #1a0533 0%, #0a0a1a 100%)';

    const hasPreview = Boolean(song.preview_url);

    return (
        <div
            id={`song-card-${song.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'rgba(18,18,30,0.85)',
                border: `1px solid ${hovered ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.32s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transform: hovered ? 'translateY(-7px) scale(1.01)' : 'translateY(0) scale(1)',
                boxShadow: hovered
                    ? '0 20px 48px rgba(139,92,246,0.25), 0 0 0 1px rgba(139,92,246,0.12)'
                    : '0 4px 24px rgba(0,0,0,0.45)',
                cursor: 'default',
                position: 'relative',
            }}
        >
            {/* ── HIGH-RES SPOTIFY COVER via background-image ── */}
            <div
                style={{
                    position: 'relative',
                    aspectRatio: '4/3',
                    overflow: 'hidden',
                    backgroundImage: coverBg,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#0a0a14',
                    // Zoom on hover via transform on the pseudo-div below
                }}
            >
                {/* Zoom layer */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: coverBg,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.55s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                }} />

                {/* Dark scrim — only appears on hover or while playing */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(8,4,20,0.62)',
                    opacity: hovered || isPlaying ? 1 : 0,
                    transition: 'opacity 0.28s ease',
                    zIndex: 2,
                }} />

                {/* Bottom gradient for readability */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '55%',
                    background: 'linear-gradient(to top, rgba(8,4,20,0.97) 0%, transparent 100%)',
                    zIndex: 2,
                }} />

                {/* MUSIC / RWA badge */}
                <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: badgeColor.bg,
                    border: `1px solid ${badgeColor.border}`,
                    borderRadius: '100px', padding: '4px 10px',
                    fontSize: '0.68rem', fontWeight: '700', color: badgeColor.text,
                    letterSpacing: '1px', textTransform: 'uppercase',
                    zIndex: 5,
                }}>
                    {song.tag || song.asset_type}
                </div>

                {/* Trending / Hot badge */}
                {song.is_trending && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px', zIndex: 5 }}>
                        <span style={{
                            background: 'rgba(239,68,68,0.9)', borderRadius: '100px', padding: '3px 9px',
                            fontSize: '0.65rem', fontWeight: '800', color: 'white', letterSpacing: '0.5px',
                        }}>🔥 HOT</span>
                        {index === 0 && (
                            <span style={{
                                background: 'rgba(234,179,8,0.9)', borderRadius: '100px', padding: '3px 9px',
                                fontSize: '0.65rem', fontWeight: '800', color: 'white',
                            }}>⚡ #1</span>
                        )}
                    </div>
                )}

                {/* ── BE4T NEON PLAY / PAUSE BUTTON — center overlay ── */}
                {hasPreview ? (
                    <button
                        id={`play-btn-${song.id}`}
                        onClick={handlePlayClick}
                        title={isPlaying ? 'Pausar preview' : 'Escuchar 30s — Spotify Preview'}
                        style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            zIndex: 10,
                            transform: `translate(-50%, -50%) scale(${hovered || isPlaying ? 1 : 0.6})`,
                            width: '76px', height: '76px',
                            borderRadius: '50%',
                            background: isPlaying
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                : 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                            border: 'none',
                            boxShadow: isPlaying
                                ? '0 0 0 4px rgba(239,68,68,0.25), 0 0 32px rgba(239,68,68,0.6), 0 6px 24px rgba(0,0,0,0.6)'
                                : '0 0 0 4px rgba(139,92,246,0.3), 0 0 32px rgba(34,211,238,0.5), 0 6px 24px rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: hovered || isPlaying ? 1 : 0,
                            transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = `translate(-50%, -50%) scale(${hovered || isPlaying ? 1 : 0.6})`; }}
                    >
                        {isPlaying ? (
                            // Pause icon
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                                <rect x="5" y="3" width="4.5" height="18" rx="2"/>
                                <rect x="14.5" y="3" width="4.5" height="18" rx="2"/>
                            </svg>
                        ) : (
                            // Play icon (offset right for optical center)
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '4px' }}>
                                <polygon points="5,2 21,12 5,22"/>
                            </svg>
                        )}
                    </button>
                ) : (
                    /* No preview indicator */
                    <div style={{
                        position: 'absolute', bottom: '14px', right: '14px',
                        zIndex: 5,
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '100px', padding: '3px 8px',
                        fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)',
                    }}>
                        Sin preview
                    </div>
                )}

                {/* Playing pulse ring animation */}
                {isPlaying && (
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100px', height: '100px',
                        borderRadius: '50%',
                        border: '2px solid rgba(139,92,246,0.5)',
                        animation: 'be4t-pulse-ring 1.4s ease-out infinite',
                        zIndex: 9,
                        pointerEvents: 'none',
                    }} />
                )}
            </div>

            {/* ── Card Content ── */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', flex: 1 }}>

                {/* Title + Artist */}
                <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {song.title}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <SpotifyIcon size={11} />
                        {song.artist}
                    </p>
                </div>

                {/* Platform metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    {[
                        { Icon: SpotifyIcon, label: 'STREAMS', value: fmt(song.spotify_streams) },
                        { Icon: YouTubeIcon, label: 'VIEWS',   value: fmt(song.youtube_views) },
                        { Icon: TikTokIcon,  label: 'CREAT.',  value: fmt(song.tiktok_creations) },
                    ].map(({ Icon, label, value }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Icon size={11} />
                                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{label}</span>
                            </div>
                            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white' }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Growth signal + sparkline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: song.growth_positive ? '#22c55e' : '#ef4444' }}>
                        {song.growth_positive ? '↗' : '↘'} {song.growth} growth
                    </span>
                    <svg width="50" height="14" viewBox="0 0 50 14">
                        <polyline
                            points={song.growth_positive ? "0,12 12,9 25,10 35,5 42,3 50,1" : "0,1 12,4 25,6 35,10 42,9 50,13"}
                            fill="none" stroke={song.growth_positive ? '#22c55e' : '#ef4444'}
                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Funding progress bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>
                            {fmtUSD(song.raised_amount)} recaudado
                        </span>
                        <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>
                            {Math.round(song.funding_percent)}%
                        </span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.min(song.funding_percent, 100)}%`,
                            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                            borderRadius: '100px',
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                </div>

                {/* Price + ROI */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>DESDE</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.03em' }}>{fmtUSD(song.price)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>ROI EST.</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#22c55e', letterSpacing: '-0.03em' }}>{song.roi_est?.toFixed(1)}%</div>
                    </div>
                </div>

                {/* CTA — Ver Detalle */}
                <button
                    id={`detail-btn-${song.id}`}
                    onClick={(e) => { e.stopPropagation(); onDetailClick && onDetailClick(song._raw); }}
                    style={{
                        width: '100%', padding: '0.75rem',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        border: 'none', borderRadius: '10px',
                        color: 'white', fontWeight: '700', fontSize: '0.9rem',
                        cursor: 'pointer', transition: 'opacity 0.2s ease',
                        marginTop: 'auto',
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.82'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                    Ver Detalle
                </button>
            </div>

            {/* Global keyframes for this component */}
            <style>{`
                @keyframes be4t-pulse-ring {
                    0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.7; }
                    100% { transform: translate(-50%, -50%) scale(1.55); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default SongCard;
