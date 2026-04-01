import React, { useState, useEffect, useMemo } from 'react';
import HeroBanner from '../components/be4t/HeroBanner';
import SongCard, { normalizeSong, SongCardSkeleton } from '../components/be4t/SongCard';
import AssetDetailView from '../components/be4t/AssetDetailView';
import TokenizationModal from '../components/be4t/TokenizationModal';
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

    /* ── Mobile (≤ 480px) ── */
    @media (max-width: 480px) {
        .be4t-song-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        .be4t-grid-outer {
            padding: 0 0.75rem;
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

// ── Sort functions ────────────────────────────────────────────────────────────
const SORT_FNS = {
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
const Marketplace = ({ session, onNavigate }) => {
    const [userMode, setUserMode]         = useState('fan');
    const [searchQuery, setSearchQuery]   = useState('');
    const [sortBy, setSortBy]             = useState('roi');
    const [genreFilter, setGenreFilter]   = useState('all'); // 'all' | 'reggaeton' | 'rock'
    const [rawAssets, setRawAssets]       = useState([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [spotifyStatus, setSpotifyStatus] = useState('loading');
    const [detailAsset, setDetailAsset]   = useState(null);
    const [tokenizingAsset, setTokenizingAsset] = useState(null);

    // ── Load 20 songs directly from Spotify (no Supabase for demo) ────────
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
                setSpotifyStatus('error');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // ── Filter + Sort ────────────────────────────────────────────────────
    const filteredSongs = useMemo(() => {
        let list = [...rawAssets];

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

    // ── Detail View navigation ────────────────────────────────────────────
    if (detailAsset) {
        return (
            <>
                <style>{globalStyles}</style>
                <AssetDetailView
                    asset={detailAsset}
                    allAssets={rawAssets.map(s => s._raw).filter(Boolean)}
                    onBack={(newAsset) => {
                        if (newAsset && newAsset.id !== detailAsset.id) {
                            // Navigate to clicked related song
                            setDetailAsset(newAsset);
                        } else {
                            setDetailAsset(null);
                        }
                    }}
                />
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
            </>
        );
    }

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
                {/* ── Hero Banner ── */}
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

                {/* ── Section title + filters ── */}
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
                                    {searchQuery
                                        ? `No se encontraron canciones para "${searchQuery}"`
                                        : 'No hay activos disponibles.'}
                                </p>
                            </div>
                        ) : (
                            <div className="be4t-song-grid">
                                {filteredSongs.map((song, i) => (
                                    <SongCard
                                        key={song.id}
                                        song={song}
                                        userMode={userMode}
                                        index={i}
                                        onDetailClick={(raw) => setDetailAsset(raw)}
                                    />
                                ))}
                            </div>
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
        </div>
    );
};

export default Marketplace;
