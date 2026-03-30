import React, { useState, useEffect, useMemo } from 'react';
import MarketplaceHeader from '../components/be4t/MarketplaceHeader';
import HeroBanner from '../components/be4t/HeroBanner';
import SongCard, { normalizeSong, SongCardSkeleton } from '../components/be4t/SongCard';
import AssetDetailView from '../components/be4t/AssetDetailView';
import TokenizationModal from '../components/be4t/TokenizationModal';
import { supabase } from '../core/xplit/supabaseClient';
import { assetsData } from '../core/be4t/data/assetsData';
import { fetchTop20Reggaeton } from '../services/spotifyService';
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
const Marketplace = ({ session }) => {
    const [activeTab, setActiveTab]       = useState('explorar');
    const [userMode, setUserMode]         = useState('fan');
    const [searchQuery, setSearchQuery]   = useState('');
    const [sortBy, setSortBy]             = useState('roi');
    const [typeFilter, setTypeFilter]     = useState('all');
    const [rawAssets, setRawAssets]       = useState([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [spotifyStatus, setSpotifyStatus] = useState('idle'); // 'idle'|'loading'|'done'|'error'
    const [detailAsset, setDetailAsset]   = useState(null);
    const [tokenizingAsset, setTokenizingAsset] = useState(null);

    // ── Step 1: Load from Supabase (fast) ─────────────────────────────────
    useEffect(() => {
        const loadFromSupabase = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('assets')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    console.log('✅ Supabase assets loaded:', data.length);
                    setRawAssets(data.map(normalizeSong));
                    setIsLoading(false);
                    return;
                }
                // DB empty → try Spotify ingestion
                throw new Error('EMPTY');
            } catch (err) {
                console.warn('Supabase empty or failed, trying Spotify…', err.message);
                loadFromSpotify();
            }
        };

        loadFromSupabase();
    }, []);

    // ── Step 2: Spotify ingestion (runs if Supabase empty) ────────────────
    const loadFromSpotify = async () => {
        setSpotifyStatus('loading');
        try {
            const tracks = await fetchTop20Reggaeton();
            // Mark top 3 as trending for FOMO badges
            const markedTracks = tracks.map((t, i) => ({
                ...t,
                metadata: { ...t.metadata, is_trending: i < 3 },
                is_trending: i < 3,
            }));
            setRawAssets(markedTracks.map(normalizeSong));
            setSpotifyStatus('done');

            // Background upsert (non-blocking)
            supabase.from('assets').upsert(markedTracks, { onConflict: 'id' })
                .then(({ error }) => {
                    if (!error) console.log('✅ Spotify tracks saved to Supabase');
                    else console.warn('Supabase upsert non-critical warn:', error.message);
                });
        } catch (err) {
            console.error('Spotify fetch failed:', err);
            setSpotifyStatus('error');
            // Final fallback: enriched seed data
            setRawAssets(assetsData.map(t => normalizeSong({ ...t, is_trending: false })));
        } finally {
            setIsLoading(false);
        }
    };

    // ── Filter + Sort (Lovable's useMemo pattern) ─────────────────────────
    const filteredSongs = useMemo(() => {
        let list = [...rawAssets];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(s =>
                (s.title || '').toLowerCase().includes(q) ||
                (s.artist || '').toLowerCase().includes(q)
            );
        }

        if (typeFilter !== 'all') {
            list = list.filter(s =>
                typeFilter === 'music' ? s.asset_type === 'MUSIC' : s.asset_type === 'RWA'
            );
        }

        const sortFn = SORT_FNS[sortBy] || SORT_FNS.roi;
        list.sort(sortFn);

        return list;
    }, [rawAssets, searchQuery, sortBy, typeFilter]);

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
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
            <style>{globalStyles}</style>

            {/* ── Sticky Header ── */}
            <MarketplaceHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userMode={userMode}
                onModeChange={setUserMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '5rem' }}>
                {/* ── Hero Banner ── */}
                <HeroBanner userMode={userMode} />

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
                                {activeTab === 'explorar' ? 'Canciones Destacadas' : 'Mi Portafolio'}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                                {activeTab === 'explorar'
                                    ? `${isLoading ? '…' : filteredSongs.length} activos disponibles para inversión`
                                    : 'Gestiona tus inversiones musicales'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={SELECT_STYLE}>
                                <option value="all">Todos</option>
                                <option value="music">MUSIC</option>
                                <option value="rwa">RWA</option>
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
