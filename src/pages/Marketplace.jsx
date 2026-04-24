import React, { useState, useEffect, useMemo } from 'react';
import HeroBanner from '../components/be4t/HeroBanner';
import SongCard, { normalizeSong, SongCardSkeleton } from '../components/be4t/SongCard';
import TokenizationModal from '../components/be4t/TokenizationModal';
import EarlyAccessModal from '../components/be4t/EarlyAccessModal';
import { isShowcase } from '../core/env';
import { fetchDemoSongs20 } from '../services/spotifyService';
import './Marketplace.css';

// ── Global styles needed ──────────────────────────────────────────────────────
const globalStyles = `
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    * { box-sizing: border-box; }
    input[type="range"]::-webkit-slider-thumb { cursor: pointer; }
    select option { background: #1a1028; }

    /* ── Responsive Song Grid ── */
    .be4t-song-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }
    .be4t-grid-outer {
        padding: 0 1.5rem;
    }
    .be4t-filters {
        padding: 1.5rem 1.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .be4t-filter-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
    }
    .be4t-filter-controls select {
        min-height: 40px;
    }
    .be4t-section-title {
        font-size: 1.45rem;
        font-weight: 800;
        margin: 0;
    }

    /* ── Mobile (≤ 480px) — Swipe Carousel ── */
    @media (max-width: 480px) {
        .be4t-song-grid {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 1.25rem;
            gap: 0.75rem;
            padding: 0.25rem 0 1.25rem 1.25rem;
            touch-action: pan-x pan-y;
        }
        .be4t-song-grid::-webkit-scrollbar { display: none; }
        .be4t-song-grid > * {
            flex-shrink: 0;
            width: 82vw;
            max-width: 300px;
            scroll-snap-align: start;   /* left-anchored snap = peek visible */
            scroll-snap-stop: always;
        }
        /* Trailing spacer — keeps right edge from being clipped */
        .be4t-song-grid::after {
            content: ''; flex-shrink: 0; width: 0.75rem;
        }
        .be4t-grid-outer {
            padding: 0;
        }
        .be4t-filters {
            padding: 1rem 0.75rem 0.75rem;
            flex-direction: column;
            align-items: flex-start;
        }
        .be4t-filter-controls {
            width: 100%;
        }
        .be4t-filter-controls select {
            flex: 1;
            min-height: 44px;
            font-size: 0.85rem;
        }
        .be4t-section-title {
            font-size: 1.2rem;
        }
    }

    /* ── Tablet (481px – 767px) ── */
    @media (min-width: 481px) and (max-width: 767px) {
        .be4t-song-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        .be4t-grid-outer {
            padding: 0 1rem;
        }
        .be4t-filters {
            padding: 1rem 1rem 0.75rem;
        }
        .be4t-section-title {
            font-size: 1.3rem;
        }
    }

    /* ── AssetDetailView responsive ── */
    @media (max-width: 767px) {
        /* Two-column layout stacks to single column */
        .be4t-detail-grid {
            grid-template-columns: 1fr !important;
        }
        .be4t-detail-sticky {
            position: static !important;
        }
        .be4t-detail-outer {
            padding: 1rem !important;
        }
        .be4t-topbar-stats {
            display: none !important;
        }
    }
`;

// ── Social proof avatars ───────────────────────────────────────────────────────
const AVATARS = [
    'https://i.pravatar.cc/40?img=1','https://i.pravatar.cc/40?img=5',
    'https://i.pravatar.cc/40?img=11','https://i.pravatar.cc/40?img=20','https://i.pravatar.cc/40?img=44',
];

// ── WaitlistBanner ────────────────────────────────────────────────────────────
const WaitlistBanner = ({ onOpenModal }) => {
    const [hov, setHov] = useState(false);
    return (
        <div style={{
            margin: '1.25rem 1.5rem 0',
            padding: '1.5rem 2rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.08) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1.25rem',
            position: 'relative', overflow: 'hidden',
        }}>
            <style>{`
                @keyframes be4t-wl-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
                .be4t-wl-btn:hover { transform: scale(1.03) translateY(-1px) !important; box-shadow: 0 6px 32px rgba(124,58,237,0.6) !important; }
                @media(max-width:600px){ .be4t-wl-btn{ width:100% !important; } }
            `}</style>
            {/* Glow bg */}
            <div style={{ position:'absolute', top:'-40%', right:'-5%', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />

            {/* Copy */}
            <div style={{ flex:'1 1 260px', minWidth:0, position:'relative' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'0.45rem', marginBottom:'0.55rem' }}>
                    <span style={{ display:'inline-block', width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e', animation:'be4t-wl-pulse 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize:'0.62rem', fontWeight:'700', color:'#4ade80', textTransform:'uppercase', letterSpacing:'1.5px' }}>
                        Beta Cerrada — Cupos Limitados
                    </span>
                </div>
                <h3 style={{ margin:'0 0 0.35rem', fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:'900', fontSize:'clamp(1.05rem,3vw,1.3rem)', background:'linear-gradient(90deg,#ffffff 40%,#c4b5fd)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'-0.03em' }}>
                    Sé el primero en saber cuándo abrimos.
                </h3>
                <p style={{ margin:0, color:'rgba(255,255,255,0.5)', fontSize:'0.83rem', lineHeight:1.55 }}>
                    Invierte en hits antes de ser mainstream — acceso prioritario para los primeros inscritos.
                </p>
                {/* Social proof */}
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginTop:'0.8rem' }}>
                    <div style={{ display:'flex' }}>
                        {AVATARS.map((src,i) => (
                            <img key={i} src={src} alt="" width={26} height={26}
                                style={{ borderRadius:'50%', border:'2px solid #0f1117', marginLeft:i===0?0:'-8px', objectFit:'cover' }}
                                onError={e => { e.target.style.display='none'; }}
                            />
                        ))}
                    </div>
                    <span style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.4)' }}>
                        <strong style={{ color:'#c4b5fd' }}>+137 personas</strong> ya están en la lista
                    </span>
                </div>
            </div>

            {/* CTA */}
            <button
                className="be4t-wl-btn"
                onClick={onOpenModal}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                    flexShrink:0, padding:'0.9rem 1.75rem', minHeight:'52px',
                    background:'linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)',
                    border:'none', borderRadius:'14px',
                    color:'white', fontWeight:'900', fontSize:'0.98rem',
                    cursor:'pointer', letterSpacing:'-0.01em',
                    boxShadow:'0 4px 24px rgba(124,58,237,0.4)',
                    transform:'scale(1)', transition:'all 0.2s ease',
                    whiteSpace:'nowrap',
                }}
            >
                Unirme a la lista de espera
            </button>
        </div>
    );
};

// ── StickyWaitlistCTA (mobile floating pill) ──────────────────────────────────
const StickyWaitlistCTA = ({ onOpenModal }) => {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 3000);
        const onScroll = () => { if (window.scrollY > 250) setVisible(true); };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
    }, []);

    if (dismissed) return null;
    return (
        <>
            <style>{`
                @media (min-width: 768px) { .be4t-sticky-wl-wrap { display: none !important; } }
            `}</style>
            <div className="be4t-sticky-wl-wrap" style={{
                position:'fixed', bottom:'1.25rem', left:'50%',
                transform:`translateX(-50%) translateY(${visible?'0':'110px'})`,
                zIndex:900, transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                display:'flex',
            }}>
                <div style={{
                    display:'flex', alignItems:'center', gap:'0.5rem',
                    background:'rgba(8,6,20,0.92)',
                    backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                    border:'1px solid rgba(139,92,246,0.4)', borderRadius:'100px',
                    padding:'0.5rem 0.6rem 0.5rem 1rem',
                    boxShadow:'0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.08)',
                }}>
                    <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e', flexShrink:0, animation:'be4t-wl-pulse 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.85)', whiteSpace:'nowrap', fontWeight:'600' }}>
                        ¿Quieres acceso anticipado?
                    </span>
                    <button onClick={onOpenModal} style={{
                        padding:'0.5rem 1rem', minHeight:'38px',
                        background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
                        border:'none', borderRadius:'100px',
                        color:'white', fontWeight:'800', fontSize:'0.8rem',
                        cursor:'pointer', whiteSpace:'nowrap',
                        boxShadow:'0 2px 10px rgba(124,58,237,0.4)',
                    }}>Unirme</button>
                    <button onClick={() => setDismissed(true)} aria-label="Cerrar" style={{
                        width:'30px', height:'30px', borderRadius:'50%', flexShrink:0,
                        background:'rgba(255,255,255,0.08)', border:'none',
                        color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'0.72rem',
                        display:'flex', alignItems:'center', justifyContent:'center',
                    }}>✕</button>
                </div>
            </div>
        </>
    );
};

// ── LiveActivity Ticker ────────────────────────────────────────────────────────
const LiveActivityTicker = () => {
    const [msg, setMsg] = useState('');
    const [visible, setVisible] = useState(false);
    
    useEffect(() => {
        const messages = [
            'Nueva oferta en Mercado Secundario',
            'Inversión reciente: 10 tokens de Feid',
            'Inversión reciente: 50 tokens de Bad Bunny',
            'Activo "LUNA" acaba de pagar yield',
            'Inversión reciente: 25 tokens de Shakira',
            'Nueva canción listada en Premium Assets',
            'Recompra exitosa por Label (+10%)'
        ];
        
        let TO;
        const tick = () => {
            const random = messages[Math.floor(Math.random() * messages.length)];
            setMsg(random);
            setVisible(true);
            TO = setTimeout(() => {
                setVisible(false);
            }, 5000);
        };
        
        const init = setTimeout(tick, 2000);
        const interval = setInterval(tick, 16000);
        return () => { clearTimeout(init); clearTimeout(TO); clearInterval(interval); };
    }, []);

    return (
        <div className="live-ticker" style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            zIndex: 800,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            opacity: visible ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            pointerEvents: 'none',
        }}>
            <div style={{
                background: 'rgba(15,15,20,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
                <span style={{ fontSize: '0.9rem' }}>🔔</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                    {msg}
                </span>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .live-ticker {
                        left: 1rem !important;
                        bottom: 6rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

// ── Sort functions ────────────────────────────────────────────────────────────
const getScarcityScore = (song) => {
    const availablePct = song.total_supply > 0 ? (song.tokens_available / song.total_supply) * 100 : 50;
    if (availablePct < 15) return 100; // ÚLTIMAS UNIDADES
    if (song.apy >= 15 || song.risk_tier === 'BLUE_CHIP') return 50; // TOP PERFORMER
    return 0; // Regular
};

const SORT_FNS = {
    hot:       (a, b) => {
        const scoreA = getScarcityScore(a);
        const scoreB = getScarcityScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return (b.roi_est || 0) - (a.roi_est || 0); // Empate -> Mayor ROI
    },
    roi:       (a, b) => (b.roi_est || 0)            - (a.roi_est || 0),
    streams:   (a, b) => (b.spotify_streams || 0)    - (a.spotify_streams || 0),
    price_asc: (a, b) => (a.price || 0)              - (b.price || 0),
    growth:    (a, b) => (b.funding_percent || 0)    - (a.funding_percent || 0),
};

const SELECT_STYLE = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.45rem 0.85rem',
    color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem',
    cursor: 'pointer', outline: 'none',
};

// ── Marketplace ───────────────────────────────────────────────────────────────
import { useDemoBalance } from '../hooks/useDemoBalance';

const Marketplace = ({ session, onNavigate }) => {
    const [activeTab, setActiveTab]       = useState('primary'); // 'primary' | 'secondary'
    const [userMode, setUserMode]         = useState('fan');
    const [searchQuery, setSearchQuery]   = useState('');
    const [sortBy, setSortBy]             = useState('hot');
    const [genreFilter, setGenreFilter]   = useState('all'); // 'all' | 'reggaeton' | 'rock'
    const [rawAssets, setRawAssets]       = useState([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [spotifyStatus, setSpotifyStatus] = useState('loading');
    const [detailAsset, setDetailAsset]   = useState(null);
    const [tokenizingAsset, setTokenizingAsset] = useState(null);
    const [waitlistOpen, setWaitlistOpen] = useState(false);

    // ── Load 20 songs directly from Spotify (no Supabase for demo) ────────
    const { portfolio: localPortfolio } = useDemoBalance(session?.user?.id);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setSpotifyStatus('loading');
            try {
                const tracks = await fetchDemoSongs20();
                setRawAssets(tracks.map(normalizeSong));
                setSpotifyStatus('done');
                console.log(`🎵 Demo loaded: ${tracks.length} songs (10 Reggaetón + 10 Rock)`);
            } catch (err) {
                console.error('Demo load failed:', err);
                // Fallback en caso de API limits (ya lo maneja el service, pero por seguridad)
                setIsLoading(false);
                setSpotifyStatus('error');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // ── P2P Mocks ──
    const p2pOfferings = useMemo(() => {
        const userListed = localPortfolio.filter(h => h.isListed).map(h => ({
            ...h,
            isP2P: true,
            seller: 'Tú',
            p2pPrice: h.listPrice
        }));

        const othersListed = rawAssets.length >= 8 ? [
            { ...rawAssets[1], isP2P: true, seller: '0x3F8...2aE', p2pPrice: (rawAssets[1].cost * 1.2 || 120), fractions: 5 },
            { ...rawAssets[4], isP2P: true, seller: 'User429', p2pPrice: (rawAssets[4].cost * 0.95 || 95), fractions: 2 },
            { ...rawAssets[7], isP2P: true, seller: 'DJ_Miami', p2pPrice: (rawAssets[7].cost * 1.5 || 150), fractions: 10 },
        ].filter(Boolean) : [];

        return [...userListed, ...othersListed];
    }, [rawAssets, localPortfolio]);

    // ── Filtering & Sorting ──
    const displayAssets = activeTab === 'primary' ? rawAssets : p2pOfferings;

    const filteredSongs = useMemo(() => {
        let list = [...displayAssets];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(s =>
                (s.title || '').toLowerCase().includes(q) ||
                (s.artist || '').toLowerCase().includes(q)
            );
        }

        if (genreFilter !== 'all') {
            list = list.filter(s => {
                const tag = s._raw?.metadata?.genre_tag || '';
                return tag === genreFilter;
            });
        }

        const sortFn = SORT_FNS[sortBy] || SORT_FNS.roi;
        list.sort(sortFn);

        return list;
    }, [rawAssets, searchQuery, sortBy, genreFilter]);

    // ── Detail View navigation ─ now uses full SongDetail page ──────────────
    // No inline detail rendering — onNavigate('song-detail', id) handles this

    // ── Loading Skeleton Grid ─────────────────────────────────────────────
    const renderSkeletons = () => (
        <div className="be4t-song-grid">
            {Array.from({ length: 6 }).map((_, i) => <SongCardSkeleton key={i} />)}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', color: 'white' }}>
            <style>{globalStyles}</style>

            <main style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '5rem' }}>
                {/* ── Hero Banner (artist sliders) ── */}
                <HeroBanner userMode={userMode} onNavigate={onNavigate} />

                {/* ── Spotify loading status ── */}
                {spotifyStatus === 'loading' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(29,185,84,0.08)',
                        border: '1px solid rgba(29,185,84,0.2)',
                        borderRadius: '12px',
                        margin: '0 1.5rem 1.5rem',
                        fontSize: '0.85rem', color: '#4ade80',
                    }}>
                        <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                        Cargando Top 20 Reggaetón desde Spotify...
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
                {spotifyStatus === 'error' && (
                    <div style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '12px',
                        margin: '0 1.5rem 1.5rem',
                        fontSize: '0.82rem', color: '#f87171',
                    }}>
                        ⚠️ Spotify API no disponible — mostrando catálogo demo. Los datos reales se cargarán cuando el servicio esté disponible.
                    </div>
                )}



                {userMode !== 'disquera' && (
                    <div className="be4t-filters">
                        <div>
                            <h2 className="be4t-section-title">Canciones Destacadas</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                                {isLoading ? '…' : filteredSongs.length} activos disponibles para inversión
                            </p>
                        </div>
                        <div className="be4t-filter-controls">
                            <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} style={SELECT_STYLE}>
                                <option value="all">🎵 Todos los géneros</option>
                                <option value="reggaeton">🔥 Reggaetón</option>
                                <option value="rock">🎸 Rock</option>
                            </select>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={SELECT_STYLE}>
                                <option value="hot">🔥 Destacados (Hot)</option>
                                <option value="roi">Mayor ROI</option>
                                <option value="growth">Mayor crecimiento</option>
                                <option value="price_asc">Precio menor</option>
                                <option value="streams">Más streams</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* ── Song Grid ── */}
                {userMode !== 'disquera' && (
                    <div className="be4t-grid-outer">
                        {isLoading ? (
                            renderSkeletons()
                        ) : filteredSongs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.35)' }}>
                                <p style={{ fontSize: '1rem' }}>
                                    {activeTab === 'secondary'
                                        ? 'No hay activos listados en el mercado secundario en este momento.'
                                        : (searchQuery ? `No se encontraron canciones para "${searchQuery}"` : 'No hay activos disponibles.')}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Swipe hint — mobile only, fades out */}
                                <style>{`
                                    @keyframes be4t-fade-hint {
                                        0%,70% { opacity: 1; }
                                        100%    { opacity: 0; }
                                    }
                                    @media (min-width: 641px) { .be4t-swipe-hint { display: none !important; } }
                                `}</style>
                                <div className="be4t-swipe-hint" style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    paddingLeft: '1rem', marginBottom: '0.5rem',
                                    fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)',
                                    animation: 'be4t-fade-hint 3s ease-out 1.5s forwards',
                                    opacity: 1,
                                }}>
                                    <span style={{ fontSize: '0.9rem' }}>👆</span>
                                    Desliza para explorar el catálogo
                                </div>
                                <div className="be4t-song-grid">
                                {filteredSongs.map((song, i) => (
                                    <SongCard
                                        key={song.id}
                                        song={song}
                                        userMode={userMode}
                                        index={i}
                                        onDetailClick={(raw) => {
                                            const songObj = raw?._raw || raw || {};
                                            const songId  = songObj.id || raw?.id;
                                            if (onNavigate) onNavigate('song-detail', songId, songObj);
                                        }}
                                    />
                                ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>

            {tokenizingAsset && (
                <TokenizationModal
                    asset={tokenizingAsset}
                    onClose={() => setTokenizingAsset(null)}
                    onSuccess={(updated) => {
                        setRawAssets(prev => prev.map(a => a.id === updated.id ? normalizeSong(updated) : a));
                        setTokenizingAsset(null);
                    }}
                />
            )}

            {/* ── Sticky mobile waitlist pill ── Hide in showcase playground ── */}
            {!isShowcase && <StickyWaitlistCTA onOpenModal={() => setWaitlistOpen(true)} />}

            {/* ── Live Activity Ticker ── Social Proof Sim ── */}
            <LiveActivityTicker />

            {/* ── Early Access Modal ── Hide in showcase playground ── */}
            {!isShowcase && <EarlyAccessModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />}
        </div>
    );
};

export default Marketplace;
