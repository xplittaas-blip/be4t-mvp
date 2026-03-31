/**
 * BE4T — Spotify Service (4-Artist Catalog Edition)
 *
 * Fetches Top 5 hits per artist from Spotify Web API:
 *   - Feid, Danny Ocean, Karol G, Ryan Castro
 *
 * Guarantee logic:
 *   - Searches up to 20 tracks per artist
 *   - Filters: preview_url !== null only
 *   - Takes first 5 that have audio preview available
 *   - If artist has < 5 previews, fills remaining slots with fallback data
 */

const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID     || '489bc7138c044636947cad63e742a0c3';
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'f35bbbeb0d204c998b50f00b9e389e08';

// ── Dev token cache ────────────────────────────────────────────────────────────
let _devToken = null;
let _devTokenExpiry = 0;

async function getDevToken() {
    if (_devToken && Date.now() < _devTokenExpiry) return _devToken;
    const res = await fetch('/spotify-token/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`Spotify token: ${res.status}`);
    const { access_token, expires_in } = await res.json();
    _devToken = access_token;
    _devTokenExpiry = Date.now() + (expires_in - 60) * 1000;
    return _devToken;
}

// ── Spotify search — returns N tracks ─────────────────────────────────────────
async function searchTracks(query, limit = 20, market = 'CO') {
    if (import.meta.env.DEV) {
        const token = await getDevToken();
        const url = `/spotify-api/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=${market}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error(`Spotify search ${res.status}`);
        const data = await res.json();
        return data.tracks?.items || [];
    } else {
        const url = `/api/spotify?q=${encodeURIComponent(query)}&limit=${limit}&market=${market}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Spotify serverless ${res.status}`);
        const data = await res.json();
        return data.tracks?.items || [];
    }
}

// ── Get top N tracks for an artist that HAVE preview_url ──────────────────────
async function getArtistTracksWithPreview(artistName, count = 5) {
    // Use Spotify field filter: artist:"name" to target specific artist
    const query = `artist:"${artistName}"`;
    try {
        // Fetch up to 50 to maximize chance of finding enough with previews
        const allTracks = await searchTracks(query, 50, 'CO');

        // Filter: must be BY the artist (not just featuring) AND have preview_url
        const withPreview = allTracks.filter(track => {
            const isMainArtist = track.artists?.some(
                a => a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                     artistName.toLowerCase().includes(a.name.toLowerCase())
            );
            return isMainArtist && track.preview_url;
        });

        console.log(`🎵 ${artistName}: ${withPreview.length} tracks with preview (from ${allTracks.length})`);
        return withPreview.slice(0, count);
    } catch (err) {
        console.warn(`[BE4T] Artist fetch failed for "${artistName}":`, err.message);
        return [];
    }
}

// ── Artist catalog definition ──────────────────────────────────────────────────
const ARTISTS = [
    { name: 'Feid',         genre: 'reggaeton', accentColor: '#a78bfa', roiBase: 22.0 },
    { name: 'Danny Ocean',  genre: 'latin_pop', accentColor: '#34d399', roiBase: 18.5 },
    { name: 'Karol G',      genre: 'reggaeton', accentColor: '#f472b6', roiBase: 20.5 },
    { name: 'Ryan Castro',  genre: 'reggaeton', accentColor: '#fb923c', roiBase: 19.0 },
];

// ── Normalize Spotify track → SongCard schema ──────────────────────────────────
function normalizeTrack(track, artist, slotIndex) {
    const { genre, roiBase, accentColor } = artist;
    const pop      = track.popularity || 78;
    const roi      = parseFloat((roiBase + (Math.random() * 4 - 2)).toFixed(1));
    const streams  = Math.round(pop * 14_000_000 + Math.random() * 5_000_000);
    const views    = Math.round(streams * 0.62);
    const tiktok   = Math.round(streams * 0.07);
    const totalVal = Math.round(20_000 + pop * 720);
    const price    = 25 + Math.floor(pop / 12) * 5;
    const funding  = Math.min(94, 55 + Math.floor(Math.random() * 30));
    const coverUrl = track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || null;
    const artistName = track.artists?.map(a => a.name).join(', ') || artist.name;

    const genreLabel = genre === 'reggaeton'
        ? 'Reggaetón / Urbano'
        : genre === 'latin_pop'
        ? 'Latin Pop'
        : 'Rock';

    return {
        id:               `sp-${track.id}`,
        name:             track.name,
        symbol:           track.name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'BEAT',
        asset_type:       'music',
        token_price_usd:  price,
        total_supply:     1000,
        valuation_usd:    totalVal,
        is_tokenized:     false,
        contract_address: null,
        cover_url:        coverUrl,
        image:            coverUrl,
        preview_url:      track.preview_url,   // Guaranteed non-null by fetchDemoSongs20 filter
        metadata: {
            artist:           artistName,
            isrc:             track.external_ids?.isrc || '',
            spotify_track_id: track.id,
            spotify_url:      track.external_urls?.spotify || '',
            album_name:       track.album?.name || '',
            album_release:    track.album?.release_date || '',
            spotify_streams:  streams,
            youtube_views:    views,
            tiktok_creations: tiktok,
            yield_estimate:   `${roi}%`,
            genre:            genreLabel,
            genre_tag:        genre,
            popularity:       pop,
            duration_ms:      track.duration_ms || 210_000,
            funding_percent:  funding,
            raised_amount:    Math.round(totalVal * funding / 100),
            is_trending:      slotIndex < 3,
            preview_url:      track.preview_url,
            accent_color:     accentColor,
            bio: `${artistName} es uno de los artistas más influyentes del género ${genreLabel} con millones de oyentes mensuales en plataformas globales.`,
            review: `"${track.name}" ha acumulado más de ${(streams / 1_000_000).toFixed(1)}M de streams en Spotify. Este activo tokenizado representa una oportunidad premium de inversión en regalías musicales.`,
        },
    };
}

// ── Static fallback per artist ─────────────────────────────────────────────────
const FALLBACK_BY_ARTIST = {
    'Feid':        [
        { name: 'Normal',          album: 'Felxxo Dorado' },
        { name: 'Porfa',           album: 'Por las Noches' },
        { name: 'Castigo',         album: 'Mor, No Le Temas A La Oscuridad' },
        { name: 'Luna',            album: 'Mor, No Le Temas A La Oscuridad' },
        { name: 'Siguelo Bailando', album: 'Vida Próxima' },
    ],
    'Danny Ocean': [
        { name: '54+1',            album: '54+1' },
        { name: 'Me Rehúso',       album: 'Me Rehúso' },
        { name: 'Amor en Silencio', album: 'El Dorado' },
        { name: 'Caminar',         album: 'Vía Crucis' },
        { name: 'Fuego Lento',     album: 'Fuego Lento' },
    ],
    'Karol G':     [
        { name: 'PROVENZA',        album: 'MAÑANA SERÁ BONITO' },
        { name: 'BICHOTA',         album: 'KG0516' },
        { name: 'TQM',             album: 'Ocean' },
        { name: 'Tusa',            album: 'Ocean' },
        { name: 'Punto G',         album: 'Ocean' },
    ],
    'Ryan Castro': [
        { name: 'Solo Tú',         album: 'Solo Tú' },
        { name: 'Patrones',        album: 'Patrones' },
        { name: 'Feliz Navidad',   album: 'El Niño' },
        { name: 'Madrugada',       album: 'Madrugada' },
        { name: 'Tusa Cover',      album: 'Covers' },
    ],
};
const COVER_POOL = [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop',
];
function buildArtistFallback(artist, count) {
    const songs = FALLBACK_BY_ARTIST[artist.name] || [];
    return Array.from({ length: count }, (_, i) => {
        const s = songs[i] || { name: `${artist.name} Hit ${i + 1}`, album: 'Album' };
        const pop = 80 + Math.floor(Math.random() * 15);
        const roi = parseFloat((artist.roiBase + (Math.random() * 4 - 2)).toFixed(1));
        const streams  = Math.round(pop * 14_000_000);
        const totalVal = Math.round(20_000 + pop * 720);
        const funding  = Math.min(92, 55 + Math.floor(Math.random() * 30));
        const price    = 25 + Math.floor(pop / 12) * 5;
        return {
            id: `fb-${artist.name.replace(/\s/g, '')}-${i}`,
            name: s.name,
            symbol: s.name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'BEAT',
            asset_type: 'music',
            token_price_usd: price,
            total_supply: 1000,
            valuation_usd: totalVal,
            cover_url: COVER_POOL[(i + ARTISTS.indexOf(artist)) % COVER_POOL.length],
            image:     COVER_POOL[(i + ARTISTS.indexOf(artist)) % COVER_POOL.length],
            preview_url: null,
            metadata: {
                artist: artist.name,
                album_name: s.album,
                spotify_streams: streams,
                youtube_views:    Math.round(streams * 0.62),
                tiktok_creations: Math.round(streams * 0.07),
                yield_estimate: `${roi}%`,
                genre: artist.genre === 'latin_pop' ? 'Latin Pop' : 'Reggaetón / Urbano',
                genre_tag: artist.genre,
                popularity: pop,
                funding_percent: funding,
                raised_amount: Math.round(totalVal * funding / 100),
                is_trending: i === 0,
                preview_url: null,
                accent_color: artist.accentColor,
            },
        };
    });
}

// ── Main export ────────────────────────────────────────────────────────────────
export async function fetchDemoSongs20() {
    console.log('🎵 [BE4T] Fetching Top 5 Spotify tracks per artist: Feid, Danny Ocean, Karol G, Ryan Castro');

    const allSongs = [];
    let totalApiHits = 0;
    let totalPreviewHits = 0;

    for (const artist of ARTISTS) {
        try {
            const tracks = await getArtistTracksWithPreview(artist.name, 5);
            const artistSongs = tracks.map((track, i) =>
                normalizeTrack(track, artist, allSongs.length + i)
            );

            // Fill any missing slots with fallback (no preview but correct metadata)
            const needed = 5 - artistSongs.length;
            if (needed > 0) {
                const fallbackSlots = buildArtistFallback(artist, needed);
                artistSongs.push(...fallbackSlots);
                console.warn(`[BE4T] ${artist.name}: only ${5 - needed}/5 with preview, ${needed} fallback slots`);
            }

            totalApiHits += tracks.length;
            totalPreviewHits += tracks.length;
            allSongs.push(...artistSongs.slice(0, 5));
        } catch (err) {
            console.warn(`[BE4T] ${artist.name} failed, using full fallback:`, err.message);
            allSongs.push(...buildArtistFallback(artist, 5));
        }
    }

    console.log(`✅ Total: ${allSongs.length} songs | ${totalPreviewHits}/20 with 30s Spotify preview`);
    if (allSongs[0]) {
        console.log('🖼  Cover[0]:', allSongs[0].cover_url?.slice(0, 60) + '...');
        console.log('🎵 Preview[0]:', allSongs[0].preview_url?.slice(0, 60) || '(none)');
    }
    return allSongs;
}

// ── Legacy aliases ─────────────────────────────────────────────────────────────
export const fetchTop20Reggaeton = fetchDemoSongs20;
export async function ingestTracksToSupabase() { return fetchDemoSongs20(); }
