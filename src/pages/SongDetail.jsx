import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Play, Pause, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalPlayer } from '../context/GlobalPlayerContext';
import { getMarketplaceData } from '../core/xplit/spotify';
import { getYoutubeTraction, formatViews } from '../core/xplit/youtube';
import './SongDetail.css';

// Platform Logos
const SpotifyIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DB954" style={{ marginRight: '6px' }}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);

const YouTubeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000" style={{ marginRight: '6px' }}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const TikTokIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF" style={{ marginRight: '6px' }}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" />
    </svg>
);


const SongDetail = ({ onBack, songId, onRequireAuth, isAuthenticated, onInvest }) => {
    const { t: tSong } = useTranslation('song');
    const { t: tCalc } = useTranslation('calculator');

    // Song Data State
    const [song, setSong] = useState(null);
    const [ytData, setYtData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Global Player Integration
    const { playTrack, togglePlay, currentTrack, isPlaying: globalIsPlaying } = useGlobalPlayer();
    const isPlaying = globalIsPlaying && currentTrack?.id === song?.id;

    // Calculator State
    const [selectedAmount, setSelectedAmount] = useState(25);
    const [expandedFaq, setExpandedFaq] = useState(null);

    // Flow States
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Refs
    const calculatorRef = useRef(null);

    useEffect(() => {
        const fetchSongData = async () => {
            try {
                // 1. Base Data Cache
                const allSongs = await getMarketplaceData();
                const targetId = songId || "2hn2zOA2XFlv6DSmesylrL";
                const baseSong = allSongs.find(s => s.id === targetId) || allSongs[0];

                let finalData = {
                    id: targetId,
                    title: baseSong.title,
                    artist: baseSong.artist,
                    genre: "Latin Urban",
                    image: baseSong.cover_image,
                    html: null,
                    preview_url: baseSong.preview_url,
                    fansParticipating: (baseSong.fans_joined || 1248).toLocaleString(),
                    fundingProgress: baseSong.funding_progress,
                    royaltiesShared: `${baseSong.royalties_shared}%`,
                    totalStreams: baseSong.streams_estimate.toLocaleString(),
                    spotify: (baseSong.streams_estimate * 0.6).toLocaleString(undefined, { maximumFractionDigits: 0 }),
                    youtube: (baseSong.streams_estimate * 0.3).toLocaleString(undefined, { maximumFractionDigits: 0 }),
                    tiktok: (baseSong.streams_estimate * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 }),
                    saves: (baseSong.popularity * 1000).toLocaleString(),
                    artistListeners: formatViews(baseSong.streams_estimate * 1.5)
                };

                // 2. oEmbed Iframe Check
                try {
                    if (!targetId.startsWith('mock-')) {
                        const response = await fetch(`http://localhost:3000/api/spotify?track_id=${targetId}`);
                        if (response.ok) {
                            const embedData = await response.json();
                            if (embedData.html) {
                                finalData.html = embedData.html;
                            }
                        }
                    }
                } catch (embedErr) {
                    // Fail gracefully
                }

                // 3. YouTube Traction Data
                const ytResponse = await getYoutubeTraction(targetId);
                setYtData(ytResponse);

                setSong(finalData);
            } catch (error) {
                console.error("Failed to fetch song data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSongData();
    }, [songId]);

    const toggleAudio = () => {
        if (!song?.preview_url) {
            alert("This track has no preview available.");
            return;
        }

        if (currentTrack?.id === song.id) {
            togglePlay();
        } else {
            playTrack({
                id: song.id,
                preview_url: song.preview_url,
                title: song.title,
                artist: song.artist,
                cover_image: song.image
            });
        }
    };

    const amounts = [
        { value: 10, share: "0.07%", estimated: "$0.50 - $2.30" },
        { value: 25, share: "0.18%", estimated: "$1.20 - $5.80" },
        { value: 50, share: "0.36%", estimated: "$2.40 - $11.60" },
        { value: 100, share: "0.72%", estimated: "$4.80 - $23.20" }
    ];

    const currentSelection = amounts.find(a => a.value === selectedAmount) || amounts[1];

    const handleParticipate = () => {
        if (!isAuthenticated) {
            onRequireAuth();
            return;
        } else {
            setShowSuccessModal(true);
        }
    };

    const scrollToCalculator = () => {
        if (calculatorRef.current) {
            calculatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (isLoading || !song) {
        return <div className="song-detail-page" style={{ padding: '4rem', textAlign: 'center' }}>{tSong('loading_track')}</div>;
    }

    return (
        <div className="song-detail-page animate-fade-in">
            <button className="back-btn" onClick={onBack}>
                <ArrowLeft size={20} /> {tSong('back_explore')}
            </button>

            <div className="detail-centered-layout">
                <div className="detail-left-column">
                    {/* 1. HERO SECTION */}
                    <section className="detail-hero">
                        {song.html ? (
                            <div className="spotify-embed-container" dangerouslySetInnerHTML={{ __html: song.html }} />
                        ) : (
                            <div className="hero-image-wrap">
                                <img src={song.image} alt={song.title} className="hero-img" />
                                <button className="hero-play" onClick={toggleAudio}>
                                    {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
                                </button>
                            </div>
                        )}

                        <div className="hero-context text-center mt-4">
                            <h1 className="hero-title">{song.title}</h1>
                            <p className="hero-artist text-secondary">{song.artist}</p>
                            <h3 className="hero-hook text-gradient mt-3">{tSong('hero_hook')}</h3>
                            <p className="hero-clarification text-secondary mt-2">{tSong('hero_clarification')}</p>

                            <button className="btn-primary main-cta mt-4" onClick={scrollToCalculator}>
                                {tSong('join_button')}
                            </button>
                        </div>
                    </section>

                    {/* 2. CURRENT TRACTION */}
                    <section className="detail-section traction-section mt-5 glass-panel">
                        <h2 className="section-title text-center">{tSong('current_traction')}</h2>
                        <p className="section-subtitle text-center mb-4">{tSong('momentum_building')}</p>

                        <div className="traction-grid-2x2">
                            <div className="traction-card">
                                <div className="traction-logo"><SpotifyIcon /> <span className="text-secondary">{tSong('metric_streams')}</span></div>
                                <div className="traction-huge">{song.spotify}</div>
                            </div>
                            <div className="traction-card">
                                <div className="traction-logo"><YouTubeIcon /> <span className="text-secondary">{tSong('metric_views')}</span></div>
                                <div className="traction-huge">{ytData ? formatViews(ytData.views) : song.youtube}</div>
                            </div>
                            <div className="traction-card">
                                <div className="traction-logo"><TikTokIcon /> <span className="text-secondary">{tSong('metric_creations')}</span></div>
                                <div className="traction-huge">{song.tiktok}</div>
                            </div>
                            <div className="traction-card">
                                <div className="traction-logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> <span className="text-secondary">{tSong('metric_saves')}</span></div>
                                <div className="traction-huge">{song.saves}</div>
                            </div>
                        </div>
                    </section>

                    {/* 3. MOMENTUM SIGNAL */}
                    <div className="momentum-signal text-center mt-4 mb-4">
                        <div className="signal-badge">{tSong('growing_badge')}</div>
                        <div className="signal-deltas mt-2">
                            <span className="success-text">+18% {tSong('delta_spotify')}</span>
                            <span className="success-text ms-3">+12% {tSong('delta_youtube')}</span>
                        </div>
                    </div>

                    {/* 4. WHY THIS SONG MATTERS */}
                    <section className="detail-section glass-panel mt-4">
                        <h2 className="section-title">{tSong('why_matters')}</h2>
                        <div className="story-content mt-3">
                            <p className="story-paragraph">
                                This release marks a critical turning point in {song.artist}'s career, blending nostalgic rhythms with modern production.
                                The track is gaining heavy algorithmic traction.
                            </p>
                            <div className="media-quote mt-4">
                                <p className="quote-text">"Music publications like Billboard have highlighted the artist’s growing presence in the Latin alternative scene, pointing to a massive audience expansion."</p>
                                <p className="quote-source text-secondary mt-2">— Summarized from Billboard Latin trends</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 5. PARTICIPATION CALCULATOR */}
                <section ref={calculatorRef} className="detail-section calculator-section glass-panel highlight-border">
                    <div className="calculator-header text-center">
                        <h2 className="section-title text-gradient">{tCalc('title')}</h2>
                        <p className="text-secondary mt-1">{tCalc('subtitle')}</p>
                    </div>

                    <div className="amount-selector mt-4">
                        {amounts.map(amt => (
                            <button
                                key={amt.value}
                                className={`amount-btn ${selectedAmount === amt.value ? 'selected' : ''}`}
                                onClick={() => setSelectedAmount(amt.value)}
                            >
                                ${amt.value}
                            </button>
                        ))}
                    </div>

                    <div className="estimation-card mt-4">
                        <div className="est-row">
                            <span className="text-secondary">{tCalc('row_amount')}</span>
                            <span className="fw-600 neutral-text">${currentSelection.value}</span>
                        </div>
                        <div className="est-row">
                            <span className="text-secondary">{tCalc('row_share')}</span>
                            <span className="fw-600 neutral-text">{currentSelection.share}</span>
                        </div>
                        <hr className="divider" />
                        <div className="est-row highlight-row">
                            <span className="text-secondary">{tCalc('row_estimated')}</span>
                            <span className="fw-700 success-text">{currentSelection.estimated}</span>
                        </div>
                    </div>

                    <div className="calculator-context mt-3">
                        <Info size={16} className="text-secondary" />
                        <span className="text-secondary text-sm ml-2">{tCalc('context_info', { amount: (selectedAmount * 0.08).toFixed(2) })}</span>
                    </div>

                    {/* 6. SOCIAL PROOF & MICRO FOMO */}
                    <div className="social-proof text-center mt-4">
                        <p className="fw-600">{tCalc('social_proof', { count: song.fansParticipating })}</p>
                    </div>

                    <p className="micro-fomo text-center text-sm mt-3" style={{ color: 'var(--accent-primary)' }}>
                        {tCalc('micro_fomo')}
                    </p>

                    <button className="btn-primary full-width cta-main mt-2" onClick={handleParticipate}>
                        {tSong('join_button')}
                    </button>
                </section>

                {/* 7. BREAK EVEN & 8. WHAT YOU GET */}
                <div className="confidence-grid mt-4">
                    <div className="confidence-card glass-panel">
                        <h4 className="mb-2">{tCalc('break_even_title')}</h4>
                        <span className="huge-text success-text">{tCalc('break_even_value')}</span>
                    </div>
                    <div className="confidence-card glass-panel">
                        <h4 className="mb-3">{tCalc('benefits_title')}</h4>
                        <ul className="benefits-list">
                            <li><CheckCircle size={16} className="success-text mr-2" /> {tCalc('benefit_1')}</li>
                            <li><CheckCircle size={16} className="success-text mr-2" /> {tCalc('benefit_2')}</li>
                            <li><CheckCircle size={16} className="success-text mr-2" /> {tCalc('benefit_3')}</li>
                        </ul>
                        <p className="text-sm mt-3 text-secondary" style={{ opacity: 0.8 }}>{tCalc('benefits_disclaimer')}</p>
                    </div>
                </div>

                {/* 10. ARTIST CONTEXT */}
                <section className="detail-section mt-5 glass-panel artist-context">
                    <h2 className="section-title mb-4">{tSong('artist_about')}</h2>
                    <div className="artist-profile-horizontal">
                        <div className="artist-avatar-large">
                            {/* Fetch channel thumbnail if we have YT data, or fallback */}
                            <img src={ytData ? ytData.thumbnail : song.image} alt={song.artist} />
                        </div>
                        <div className="artist-data">
                            <h3>{song.artist}</h3>
                            <p className="text-secondary text-sm mt-1">Independent artist defining a new sound for the global audience.</p>

                            <div className="artist-stats mt-3">
                                <div className="stat-pill">
                                    <SpotifyIcon /> <span className="fw-600">{song.artistListeners}</span> <span className="text-secondary text-sm ml-1">{tSong('artist_listeners')}</span>
                                </div>
                                {ytData && (
                                    <div className="stat-pill mt-2">
                                        <YouTubeIcon /> <span className="fw-600">{formatViews(ytData.channelSubscribers)}</span> <span className="text-secondary text-sm ml-1">{tSong('yt_subscribers')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 11. RELATED SONGS */}
                <section className="detail-section mt-5 nb-5">
                    <h2 className="section-title mb-4">{tSong('related_title')}</h2>
                    <div className="related-songs-list">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="related-song-horizontal glass-panel mb-3">
                                <div className="related-img" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80&sig=${i})` }}></div>
                                <div className="related-info">
                                    <h5>Sunset Drive</h5>
                                    <p className="text-secondary text-sm">{song.artist}</p>
                                    <div className="mini-traction mt-1">
                                        <SpotifyIcon /> <span className="text-xs text-secondary">420K {tSong('metric_streams')}</span>
                                    </div>
                                </div>
                                <button className="btn-secondary small-btn">{tSong('related_btn')}</button>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* Success Confirmation Modal */}
            {showSuccessModal && createPortal(
                <div className="auth-modal-overlay animate-fade-in" style={{ zIndex: 10000 }}>
                    <div className="auth-modal-content glass-panel text-center">
                        <div className="auth-icon-wrapper" style={{ background: 'rgba(0, 240, 144, 0.1)', margin: '0 auto 1.5rem' }}>
                            <CheckCircle size={32} className="success-text" />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem' }}>
                            {tSong('success_title')}
                        </h2>
                        <p className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                            {tSong('success_desc1')}<br />
                            {tSong('success_desc2')}
                        </p>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                            <img src={song.image} alt={song.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                                <h4 style={{ margin: 0 }}>{song.title}</h4>
                                <p className="text-secondary text-sm" style={{ margin: 0 }}>{song.artist}</p>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <span style={{ display: 'block', fontWeight: '700', color: 'var(--accent-primary)' }}>{tSong('success_share', { share: currentSelection.share })}</span>
                            </div>
                        </div>

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
