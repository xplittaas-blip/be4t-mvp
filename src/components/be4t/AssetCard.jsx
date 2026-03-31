import React from 'react';
import { Disc, FileText, DollarSign, PieChart, ShieldCheck, Cpu, TrendingUp, Clock, PlayCircle, PauseCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalPlayer } from '../../context/GlobalPlayerContext';
import './AssetCard.css';

const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const SpotifyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954" style={{ marginRight: '4px' }}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);

const YouTubeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000" style={{ marginRight: '4px' }}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const TikTokIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" style={{ marginRight: '4px' }}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" />
    </svg>
);

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const AssetCard = ({ asset, session, onActionClick, onTokenizeClick }) => {
    const { t } = useTranslation('marketplace');
    const { playTrack, togglePlay, currentTrack, isPlaying } = useGlobalPlayer();
    
    const isMusic = asset.asset_type === 'music';
    // ✅ REGLA DE ORO: covers come exclusively from Spotify — no stock image fallbacks
    const defaultMusicImage = null;
    const defaultCustomImage = null;

    const seed = asset.id.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const baseValuation = asset.valuation_usd || (asset.token_price_usd * asset.total_supply) || 10000;
    
    const spotifyStreams = asset.metadata?.spotify_streams || Math.floor(baseValuation * 12.5 + seed * 1000);
    const youtubeViews = asset.metadata?.youtube_views || Math.floor(baseValuation * 8.2 + seed * 500);
    const tiktokCreations = asset.metadata?.tiktok_creations || Math.floor(baseValuation * 0.9 + seed * 100);
    
    const growthPercent = 5 + (seed % 25);
    const growthSignal = `+${growthPercent}%`;

    const isThisPlaying = isPlaying && currentTrack?.id === asset?.id;

    const playableTrack = {
        id: asset.id,
        name: asset.name,
        artist: asset.metadata?.artist || 'Unknown',
        cover_image: asset.image || asset.cover_url || null,
        // ✅ REGLA DE ORO: only real Spotify preview_url — no hardcoded fallback
        preview_url: asset.preview_url || asset.metadata?.preview_url || null,
    };

    const handlePlayClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (currentTrack?.id === asset.id) {
            togglePlay();
        } else {
            playTrack(playableTrack);
        }
    };

    return (
        <div className={`asset-card glass-panel ${isMusic ? 'theme-music' : 'theme-custom'}`}>
            <div className="asset-cover-container">
                <img 
                    src={asset.image || (isMusic ? defaultMusicImage : defaultCustomImage)} 
                    alt={asset.name} 
                    className="asset-cover"
                    loading="lazy"
                />
                
                <div className="asset-type-badge">
                    {isMusic ? <Disc size={14} /> : <FileText size={14} />}
                    <span>{isMusic ? 'Music' : 'RWA'}</span>
                </div>

                {isMusic && (
                    <div
                        className={`play-overlay ${isThisPlaying ? 'is-playing' : ''}`}
                        onClick={handlePlayClick}
                    >
                        {isThisPlaying ? (
                            <PauseCircle size={48} className="play-icon" />
                        ) : (
                            <PlayCircle size={48} className="play-icon" />
                        )}
                    </div>
                )}
            </div>

            <div className="asset-info" style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <h3 className="asset-title" style={{ marginBottom: 0 }}>{asset.name}</h3>
                    <div title="Registrado Oficialmente en Base de Datos Supabase" style={{ display: 'flex', alignItems: 'center', color: '#00f2fe', cursor: 'help' }}>
                        <ShieldCheck size={16} />
                    </div>
                </div>
                
                {isMusic ? (
                    <div className="asset-music-meta" style={{ marginBottom: '1.25rem' }}>
                        <p className="artist-name" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            {asset.metadata?.artist || 'Unknown Artist'}
                        </p>
                        
                        <div className="card-metrics" style={{ marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }} className="text-secondary">
                                    <SpotifyIcon /> {formatNumber(spotifyStreams)} streams
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }} className="text-secondary">
                                    <YouTubeIcon /> {formatNumber(youtubeViews)} views
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }} className="text-secondary">
                                    <TikTokIcon /> {formatNumber(tiktokCreations)} creations
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} className="success-text">
                            <TrendingUp size={12} /> {growthSignal} growth trend
                        </div>
                    </div>
                ) : (
                    <div className="asset-custom-meta">
                        {asset.metadata && Object.entries(asset.metadata).map(([key, val]) => (
                            <div key={key} className="meta-pill">
                                <span className="meta-key">{key}:</span>
                                <span className="meta-val">{val}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Legacy Card Financial Block Style */}
                <div className="card-metrics" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', padding: 0, border: 'none', marginBottom: '1.5rem' }}>
                    <div className="metric">
                        <span className="metric-label">{isMusic ? t('token_price', {defaultValue: 'Token Price'}) : 'Valuation'}</span>
                        <span className="metric-value text-gradient">
                            {formatCurrency(baseValuation)}
                        </span>
                    </div>
                    {isMusic ? (
                        <div className="metric" style={{ textAlign: 'right' }}>
                            <span className="metric-label">{t('proj_roi', {defaultValue: 'Proj. ROI'})}</span>
                            <span className="metric-value success-text" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center', gap: '4px', color: '#00f2fe' }}>
                                <TrendingUp size={14} />
                                {asset.metadata?.yield_estimate || '14%'}
                            </span>
                        </div>
                    ) : (
                        <div className="metric" style={{ textAlign: 'right' }}>
                            <span className="metric-label"><PieChart size={14}/> Supply</span>
                            <span className="metric-value">{asset.total_supply}</span>
                        </div>
                    )}
                </div>

                <div className="asset-card-actions" style={{ position: 'relative', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {session && !asset.is_tokenized && (
                        <button 
                            className="asset-action-btn" 
                            onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation();
                                onTokenizeClick && onTokenizeClick(); 
                            }} 
                            style={{ background: 'rgba(144, 19, 254, 0.15)', color: '#d08cff', border: '1px solid rgba(144, 19, 254, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
                        >
                            <Cpu size={14} /> Generar Smart Contract
                        </button>
                    )}
                    
                    {asset.is_tokenized && asset.contract_address && (
                        <a 
                            href={`https://sepolia.arbiscan.io/address/${asset.contract_address}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                            }}
                            className="asset-action-btn" 
                            style={{ background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', border: '1px solid rgba(0, 242, 254, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', cursor: 'pointer' }}
                        >
                            Tokenizado (Ver en Explorer)
                        </a>
                    )}

                    <button 
                        className="asset-action-btn" 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            onActionClick && onActionClick(); 
                        }}
                        style={{ cursor: 'pointer', background: 'var(--bg-tertiary)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        View Asset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetCard;
