import React, { useState, useRef, useEffect, useCallback } from 'react';
import { audioManager } from '../../services/audioManager';
import { fetchPreviewUrl } from '../../services/previewService';
import { fetchSongMetrics } from '../../services/metricsService';
import { isProduction } from '../../core/env';

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmt = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
};
const fmtUSD = (v) => v != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
    : '$—';

// ── Platform SVG icons ─────────────────────────────────────────────────────────
const SpotifyIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);
const YouTubeIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);
const TikTokIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2DD4BF">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" />
    </svg>
);

// ── Normalize raw asset → SongCard props ───────────────────────────────────────
export const normalizeSong = (raw) => {
    const meta = raw.metadata || {};
    const totalVal    = raw.valuation_usd || (raw.token_price_usd * raw.total_supply) || 0;
    const seed        = String(raw.id).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const yieldStr    = meta.yield_estimate || raw.yield_prospect || raw.apy || raw.apy_estimated || '14%';
    const roi         = parseFloat(yieldStr.replace('%', '')) || 14;
    const totalSupply = raw.total_supply || 10_000;
    const tokenPrice  = raw.token_price_usd || raw.price_per_token || (totalVal / totalSupply) || 10;
    const marketCap   = totalVal || tokenPrice * totalSupply;
    const proxyStreams = meta.spotify_streams || raw.spotify_streams || Math.floor(totalVal * 12.5 + seed * 1000);
    const isBlueChip  = proxyStreams >= 1_000_000;
    const riskTier    = meta.risk_tier || raw.risk_tier || (isBlueChip ? 'BLUE_CHIP' : 'EMERGING');
    const apyBase     = riskTier === 'BLUE_CHIP' ? 11 + (seed % 7) : 22 + (seed % 12);
    const apy         = meta.apy ?? raw.apy ?? apyBase;

    // Tokens disponibles — seed-based if not from DB
    const tokensAvailable = meta.tokens_available ?? raw.tokens_available
        ?? Math.floor(totalSupply * (0.25 + (seed % 50) / 100));

    return {
        id:               raw.id,
        title:            raw.name || raw.title || 'Sin título',
        artist:           meta.artist || raw.artist_name || raw.artist || 'Artista',
        cover_url:        raw.cover_url || raw.image || meta.image || null,
        preview_url:      raw.preview_url || meta.preview_url || null,
        asset_type:       raw.asset_type === 'music' ? 'MUSIC' : 'RWA',
        tag:              raw.tag || (raw.asset_type === 'music' ? 'MUSIC' : 'RWA'),
        spotify_streams:  proxyStreams,
        monthly_streams:  Math.round(proxyStreams / 12),   // avg monthly streams
        youtube_views:    meta.youtube_views || raw.youtube_views || Math.floor(totalVal * 8.2 + seed * 500),
        tiktok_creations: meta.tiktok_creations || raw.tiktok_creations || Math.floor(totalVal * 0.9 + seed * 100),
        growth:           `+${roi.toFixed(1)}%`,
        growth_positive:  roi >= 0,
        tokens_available: tokensAvailable,
        total_supply:     totalSupply,
        risk_tier:        riskTier,
        apy:              apy,
        price:            tokenPrice,
        roi_est:          roi,
        is_tokenized:     raw.is_tokenized || false,
        contract_address: raw.token_contract_address || raw.contract_address || null,
        is_trending:      meta.is_trending || raw.is_trending || false,
        _raw:             raw,
    };
};

// ── Skeleton Card ──────────────────────────────────────────────────────────────
export const SongCardSkeleton = () => (
    <div style={{
        background: 'rgba(18,18,30,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', overflow: 'hidden',
        animation: 'be4t-card-pulse 1.8s ease-in-out infinite',
    }}>
        <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ height: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', width: '70%' }} />
            <div style={{ height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', width: '45%' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[1,2,3].map(i => <div key={i} style={{ height: '42px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />)}
            </div>
            <div style={{ height: '80px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }} />
            <div style={{ height: '46px', background: 'rgba(16,185,129,0.08)', borderRadius: '12px' }} />
        </div>
        <style>{`@keyframes be4t-card-pulse { 0%,100%{opacity:1}50%{opacity:0.5} }`}</style>
    </div>
);

// ── Tokens Availability Bar ────────────────────────────────────────────────────
const TokenBar = ({ available, total }) => {
    const pct        = total > 0 ? (available / total) * 100 : 0;
    const isLow      = pct < 20;
    const isMid      = pct >= 20 && pct < 50;
    const barColor   = isLow  ? '#f97316'  // orange — scarcity
                     : isMid  ? '#eab308'  // yellow — limited
                     :          '#10b981'; // green — available
    const textColor  = isLow  ? '#fb923c' : isMid ? '#fbbf24' : 'rgba(255,255,255,0.45)';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.9px', fontWeight: '600' }}>
                    Tokens Disponibles
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: textColor, letterSpacing: '-0.02em' }}>
                    {fmt(available)}
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: '400', fontSize: '0.62rem' }}> / {fmt(total)}</span>
                    {isLow && <span style={{ marginLeft: '4px', fontSize: '0.55rem', color: '#f97316', fontWeight: '800', letterSpacing: '0.5px' }}>CASI AGOTADO</span>}
                </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${Math.min(100, 100 - pct)}%`, // filled = already sold
                    background: barColor,
                    borderRadius: '100px',
                    transition: 'width 0.6s ease',
                    boxShadow: `0 0 6px ${barColor}88`,
                }} />
            </div>
        </div>
    );
};

// ── Main SongCard ──────────────────────────────────────────────────────────────
const SongCard = ({ song, userMode, index = 0, onDetailClick }) => {
    const [hovered, setHovered]   = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef   = useRef(null);
    const previewRef = useRef(song.preview_url || null);

    const handleDetailClick = useCallback(() => {
        if (onDetailClick) onDetailClick(song._raw || song);
    }, [onDetailClick, song]);

    // ── Live metrics from Deezer/Spotify API ────────────────────────────────
    const [metrics, setMetrics] = useState(null);
    useEffect(() => {
        let cancelled = false;
        fetchSongMetrics(song).then(m => { if (!cancelled) setMetrics(m); }).catch(() => {});
        return () => { cancelled = true; };
    }, [song.id]);

    const displayStreams  = metrics?.spotify_streams  ?? song.spotify_streams;
    const displayViews    = metrics?.youtube_views    ?? song.youtube_views;
    const displayTikTok   = metrics?.tiktok_creations ?? song.tiktok_creations;
    const growthData      = metrics?.growth ?? null;
    const growthPct       = growthData?.pct  ?? song.growth;
    const growthPositive  = growthData?.positive ?? song.growth_positive;
    const sparklinePoints = growthData?.sparkline ?? null;
    const isLiveMetrics   = metrics?.source === 'live';

    const toPolyline = (pts) => {
        if (!pts?.length) return growthPositive
            ? '0,12 12,9 25,10 35,5 42,3 50,1'
            : '0,1 12,4 25,6 35,10 42,9 50,13';
        const max = Math.max(...pts), min = Math.min(...pts);
        const range = max - min || 1;
        return pts.map((v, i) => {
            const x = (i / (pts.length - 1)) * 50;
            const y = 13 - ((v - min) / range) * 12;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    };

    // Cleanup audio
    useEffect(() => {
        if (audioRef.current) { audioManager.stop(audioRef.current); audioRef.current = null; }
        previewRef.current = song.preview_url || null;
        setIsPlaying(false); setIsLoading(false);
    }, [song.id]);
    useEffect(() => () => { if (audioRef.current) audioManager.stop(audioRef.current); }, []);

    const deezerId = song.deezer_id || song._raw?.metadata?.deezer_id;
    const hasAudio = !!(deezerId || song.preview_url);

    const handlePlayClick = useCallback(async (e) => {
        e.stopPropagation(); e.preventDefault();
        if (!hasAudio) return;
        if (isPlaying && audioRef.current) {
            audioManager.stop(audioRef.current); audioRef.current = null;
            setIsPlaying(false); return;
        }
        let previewUrl = previewRef.current;
        if (!previewUrl && deezerId) {
            setIsLoading(true);
            previewUrl = await fetchPreviewUrl(deezerId);
            previewRef.current = previewUrl;
            setIsLoading(false);
        }
        if (!previewUrl) return;
        const audio = audioManager.play(previewUrl, () => { audioRef.current = null; setIsPlaying(false); });
        audioRef.current = audio; setIsPlaying(true);
    }, [isPlaying, hasAudio, deezerId]);

    const isRWA      = song.asset_type === 'RWA' || song.asset_type === 'custom';
    const badgeColor = isRWA
        ? { bg: 'rgba(20,184,166,0.2)', border: 'rgba(20,184,166,0.5)', text: '#2dd4bf' }
        : { bg: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.5)', text: '#c4b5fd' };
    const coverBg = song.cover_url
        ? `url("${song.cover_url}")`
        : 'linear-gradient(135deg, #1a0533 0%, #0a0a1a 100%)';

    // TEA display — always show as percentage (same data as APY, renamed)
    const teaValue = Number(song.apy).toFixed(1);

    // Scarcity flags
    const availablePct = song.total_supply > 0 ? (song.tokens_available / song.total_supply) * 100 : 50;
    const isLowSupply  = availablePct < 20;

    return (
        <>
            <style>{`
                @keyframes be4t-pulse-ring {
                    0%   { transform: translate(-50%,-50%) scale(1);    opacity: 0.7; }
                    100% { transform: translate(-50%,-50%) scale(1.55); opacity: 0;   }
                }
                @keyframes be4t-dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes be4t-card-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
                @keyframes be4t-scarcity-flash {
                    0%,100% { opacity: 1; } 50% { opacity: 0.6; }
                }
            `}</style>

            <div
                id={`song-card-${song.id}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    background: 'rgba(12,12,22,0.92)',
                    border: `1px solid ${hovered
                        ? (isLowSupply ? 'rgba(249,115,22,0.55)' : 'rgba(139,92,246,0.45)')
                        : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.32s cubic-bezier(0.25,0.8,0.25,1)',
                    transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                    boxShadow: hovered
                        ? `0 20px 48px ${isLowSupply ? 'rgba(249,115,22,0.2)' : 'rgba(139,92,246,0.25)'}, 0 0 0 1px rgba(139,92,246,0.1)`
                        : '0 4px 24px rgba(0,0,0,0.5)',
                    cursor: 'default',
                    position: 'relative',
                }}
            >
                {/* ── ALBUM COVER ── */}
                <div style={{
                    position: 'relative', aspectRatio: '4/3', overflow: 'hidden',
                    backgroundImage: coverBg, backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: '#0a0a14',
                }}>
                    {/* Zoom layer */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: coverBg, backgroundSize: 'cover', backgroundPosition: 'center',
                        transition: 'transform 0.55s cubic-bezier(0.25,0.8,0.25,1)',
                        transform: hovered ? 'scale(1.08)' : 'scale(1)',
                    }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,4,20,0.55)',
                        opacity: hovered || isPlaying ? 1 : 0, transition: 'opacity 0.28s ease', zIndex: 2 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
                        background: 'linear-gradient(to top, rgba(8,4,20,0.97) 0%, transparent 100%)', zIndex: 2 }} />

                    {/* MUSIC / RWA badge */}
                    <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: badgeColor.bg, border: `1px solid ${badgeColor.border}`,
                        borderRadius: '100px', padding: '3px 9px',
                        fontSize: '0.62rem', fontWeight: '700', color: badgeColor.text,
                        letterSpacing: '1px', textTransform: 'uppercase', zIndex: 5,
                    }}>{song.tag || song.asset_type}</div>

                    {song.isP2P && (
                        <div style={{
                            position: 'absolute', top: '35px', left: '10px',
                            background: 'rgba(6,182,212,0.9)', border: '1px solid rgba(6,182,212,0.4)',
                            borderRadius: '100px', padding: '3px 9px',
                            fontSize: '0.58rem', fontWeight: '800', color: '#111',
                            letterSpacing: '1px', zIndex: 5, boxShadow: '0 2px 10px rgba(6,182,212,0.4)'
                        }}>Vendido por {song.seller}</div>
                    )}

                    {/* Risk Tier + HOT */}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex',
                        flexDirection: 'column', alignItems: 'flex-end', gap: '4px', zIndex: 5 }}>
                        {song.risk_tier === 'BLUE_CHIP' ? (
                            <span style={{ background: 'rgba(6,182,212,0.18)', border: '1px solid rgba(6,182,212,0.55)',
                                borderRadius: '100px', padding: '3px 9px', fontSize: '0.58rem', fontWeight: '800',
                                color: '#22d3ee', letterSpacing: '0.8px', fontFamily: "'Courier New', monospace" }}>
                                BLUE CHIP
                            </span>
                        ) : (
                            <span style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.5)',
                                borderRadius: '100px', padding: '3px 9px', fontSize: '0.58rem', fontWeight: '800',
                                color: '#fbbf24', letterSpacing: '0.8px', fontFamily: "'Courier New', monospace" }}>
                                EMERGING
                            </span>
                        )}
                        {song.is_trending && (
                            <span style={{ background: 'rgba(239,68,68,0.9)', borderRadius: '100px', padding: '3px 9px',
                                fontSize: '0.62rem', fontWeight: '800', color: 'white' }}>HOT</span>
                        )}
                        {/* Low supply warning on image */}
                        {isLowSupply && (
                            <span style={{ background: 'rgba(249,115,22,0.85)', borderRadius: '100px', padding: '3px 9px',
                                fontSize: '0.58rem', fontWeight: '800', color: 'white',
                                animation: 'be4t-scarcity-flash 2s ease infinite' }}>
                                CASI AGOTADO
                            </span>
                        )}
                    </div>

                    {/* Play button */}
                    {hasAudio ? (
                        <button id={`play-btn-${song.id}`} onClick={handlePlayClick}
                            title={isPlaying ? 'Pausar preview' : 'Escuchar 30s'}
                            style={{
                                position: 'absolute', top: '50%', left: '50%', zIndex: 10,
                                transform: `translate(-50%,-50%) scale(${hovered||isPlaying||isLoading ? 1 : 0.6})`,
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: isPlaying
                                    ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                                    : isLoading
                                    ? 'linear-gradient(135deg,#6d28d9,#0891b2)'
                                    : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                                border: 'none',
                                boxShadow: isPlaying
                                    ? '0 0 0 4px rgba(239,68,68,0.25), 0 0 28px rgba(239,68,68,0.6)'
                                    : '0 0 0 4px rgba(139,92,246,0.3), 0 0 28px rgba(34,211,238,0.5)',
                                color: 'white', cursor: isLoading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: hovered||isPlaying||isLoading ? 1 : 0,
                                transition: 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
                            }}
                            onMouseOver={e => { if (!isLoading) e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.12)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = `translate(-50%,-50%) scale(${hovered||isPlaying||isLoading ? 1 : 0.6})`; }}
                        >
                            {isLoading ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                            ) : isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="5" y="3" width="4.5" height="18" rx="2"/><rect x="14.5" y="3" width="4.5" height="18" rx="2"/></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '3px' }}><polygon points="5,2 21,12 5,22"/></svg>
                            )}
                        </button>
                    ) : (
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 5,
                            background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '100px', padding: '3px 8px',
                            fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)' }}>Sin preview</div>
                    )}
                    {isPlaying && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%,-50%)', width: '96px', height: '96px',
                            borderRadius: '50%', border: '2px solid rgba(139,92,246,0.5)',
                            animation: 'be4t-pulse-ring 1.4s ease-out infinite', zIndex: 9, pointerEvents: 'none' }} />
                    )}
                </div>

                {/* ── CARD BODY ── */}
                <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>

                    {/* Title + Artist */}
                    <div>
                        <h3 style={{ fontSize: '1.0rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            {song.title}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.8rem', margin: '0.22rem 0 0',
                            display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <SpotifyIcon size={10} />
                            {song.artist}
                            {isLiveMetrics && (
                                <span style={{ marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px',
                                    fontSize: '0.5rem', color: '#22c55e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e',
                                        display: 'inline-block', animation: 'be4t-dot-pulse 2s ease-in-out infinite' }} />
                                    Live
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Platform metrics — 3-col grid */}
                    <div>
                        {/* Header row: label + LIVE indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Plataformas</span>
                            {metrics ? (
                                isLiveMetrics ? (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                        borderRadius: '100px', padding: '1px 7px', fontSize: '0.48rem',
                                        color: '#4ade80', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px',
                                    }}>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e',
                                            display: 'inline-block', animation: 'be4t-dot-pulse 1.8s ease-in-out infinite' }} />
                                        LIVE
                                    </span>
                                ) : (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                                        background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
                                        borderRadius: '100px', padding: '1px 7px', fontSize: '0.48rem',
                                        color: '#fbbf24', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px',
                                    }}>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b',
                                            display: 'inline-block' }} />
                                        Est.
                                    </span>
                                )
                            ) : (
                                <span style={{ fontSize: '0.44rem', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>cargando…</span>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.42rem' }}>
                            {[
                                { Icon: SpotifyIcon, color: '#1DB954', label: 'STREAMS', value: fmt(displayStreams),  sub: 'Spotify'  },
                                { Icon: YouTubeIcon, color: '#FF0000', label: 'VIEWS',   value: fmt(displayViews),    sub: 'YouTube'  },
                                { Icon: TikTokIcon,  color: '#2DD4BF', label: 'CREAT.',  value: fmt(displayTikTok),   sub: 'TikTok'   },
                            ].map(({ Icon, color, label, value, sub }) => (
                                <div key={label} style={{
                                    background: 'rgba(255,255,255,0.028)',
                                    border: '1px solid rgba(255,255,255,0.055)',
                                    borderRadius: '8px', padding: '0.38rem 0.45rem',
                                    display: 'flex', flexDirection: 'column', gap: '0.12rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Icon size={9} />
                                        <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>{label}</span>
                                    </div>
                                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>{value}</span>
                                    <span style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.2)' }}>{sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Growth sparkline row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: '700',
                            color: growthPositive ? '#22c55e' : '#ef4444' }}>
                            {growthPositive ? '↗' : '↘'} {growthPct}
                        </span>
                        <svg width="52" height="14" viewBox="0 0 52 14" style={{ flex: '0 0 52px' }}>
                            <polyline points={toPolyline(sparklinePoints)}
                                fill="none" stroke={growthPositive ? '#22c55e' : '#ef4444'}
                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.22)', marginLeft: 'auto' }}>UDM</span>
                    </div>

                    {/* ── FINANCIAL TERMINAL BLOCK ── */}
                    <div style={{
                        background: 'rgba(0,0,0,0.32)',
                        border: '1px solid rgba(255,255,255,0.065)',
                        borderRadius: '12px', overflow: 'hidden',
                    }}>
                        {/* Row 1: Streams/Mes | Precio/Token */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                            borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {[
                                { label: 'Streams / Mes', value: fmt(song.monthly_streams ?? Math.round((song.spotify_streams ?? 0) / 12)) },
                                { label: song.isP2P ? 'Precio Secundario' : 'Precio / Token', value: fmtUSD(song.isP2P ? song.p2pPrice : song.price) },
                            ].map(({ label, value }, i) => (
                                <div key={label} style={{
                                    padding: '0.62rem 0.8rem',
                                    borderRight: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                }}>
                                    <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.28)',
                                        textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '3px' }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'rgba(255,255,255,0.88)',
                                        letterSpacing: '-0.02em' }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Row 2: TEA hero */}
                        <div style={{ padding: '0.6rem 0.8rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                                <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.28)',
                                    textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '2px' }}>
                                    TEA — Tasa Efectiva Anual
                                </div>
                                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.3 }}>
                                    {song.risk_tier === 'BLUE_CHIP'
                                        ? 'Bajo riesgo · Retorno estable'
                                        : 'Alto riesgo · Alto potencial'}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '1.75rem', fontWeight: '900', lineHeight: 1,
                                color: '#10b981', letterSpacing: '-0.05em',
                                textShadow: '0 0 18px rgba(16,185,129,0.55)',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {teaValue}%
                            </div>
                        </div>

                        {/* Row 3: Tokens disponibles bar (solo emisiones primarias o info P2P) */}
                        <div style={{ padding: '0.65rem 0.8rem' }}>
                            {song.isP2P ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.9px', fontWeight: '600' }}>
                                        Lote en Venta
                                    </span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#22d3ee', letterSpacing: '-0.02em' }}>
                                        {song.fractions} tokens
                                    </span>
                                </div>
                            ) : (
                                <TokenBar available={song.tokens_available} total={song.total_supply} />
                            )}
                        </div>
                    </div>

                    {/* ── PRIMARY CTA — navigates to SongDetail page ── */}
                    <button
                        id={`acquire-btn-${song.id}`}
                        onClick={(e) => { e.stopPropagation(); handleDetailClick(); }}
                        style={{
                            width: '100%', padding: '0.92rem 0.6rem',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                            backgroundSize: '200% auto',
                            border: 'none', borderRadius: '12px',
                            color: 'white', fontWeight: '800', fontSize: '0.88rem',
                            cursor: 'pointer', transition: 'all 0.3s ease',
                            lineHeight: 1.25, letterSpacing: '-0.01em',
                            boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
                            marginTop: 'auto',
                            position: 'relative', overflow: 'hidden',
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.backgroundPosition = 'right center';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.65)';
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.backgroundPosition = 'left center';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.45)';
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        }}
                    >
                        💰 Adquirir participación
                        <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: '600',
                            color: 'rgba(255,255,255,0.7)', marginTop: '2px', letterSpacing: '0.3px' }}>
                            {isProduction ? 'Fondear · Calcular retorno' : 'Simular con crédito demo'}
                        </span>
                    </button>

                    {/* Secondary link */}
                    <button
                        id={`detail-link-${song.id}`}
                        onClick={(e) => { e.stopPropagation(); handleDetailClick(); }}
                        style={{ width: '100%', background: 'none', border: 'none', padding: '0.3rem 0',
                            color: 'rgba(255,255,255,0.28)', fontSize: '0.65rem', cursor: 'pointer',
                            textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.15)',
                            textUnderlineOffset: '2px', transition: 'color 0.2s', }}
                        onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
                    >
                        Ver análisis completo y métricas
                    </button>
                </div>
            </div>
        </>
    );
};

export default SongCard;
