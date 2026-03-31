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
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    * { box-sizing: border-box; }
    input[type="range"]::-webkit-slider-thumb { cursor: pointer; }
    select option { background: #1a1028; }
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
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
        }}>
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
                    <div style={{
                        padding: '1.5rem 1.5rem 1rem',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0 }}>
                                Canciones Destacadas
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                                {isLoading ? '…' : filteredSongs.length} activos disponibles para inversión
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                    <div style={{ padding: '0 1.5rem' }}>
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
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1.5rem',
                            }}>
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
