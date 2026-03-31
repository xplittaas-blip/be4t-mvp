/**
 * BE4T — Spotify Service
 *
 * Uses Spotify Web API exclusively for:
 *   - Album cover art (high-resolution)
 *   - Artist names and track metadata
 *   - ISRC, popularity, duration
 *   - 30s preview_url (when available from Spotify)
 *
 * Dev:  Vite proxy routes /spotify-token → accounts.spotify.com
 *                                /spotify-api → api.spotify.com
 * Prod: Vercel serverless /api/spotify handles auth + search server-side
 */

const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID     || '489bc7138c044636947cad63e742a0c3';
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'f35bbbeb0d204c998b50f00b9e389e08';

// ── Token cache (client side, dev only) ──────────────────────────────────────
let _devToken = null;
let _devTokenExpiry = 0;

async function getDevToken() {
    if (_devToken && Date.now() < _devTokenExpiry) return _devToken;

    // Vite proxy: /spotify-token → https://accounts.spotify.com
    const res = await fetch('/spotify-token/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error(`Spotify token failed: ${res.status}`);
    const { access_token, expires_in } = await res.json();
    _devToken = access_token;
    _devTokenExpiry = Date.now() + (expires_in - 60) * 1000;
    return _devToken;
}

// ── Spotify track search ─────────────────────────────────────────────────────
async function searchSpotifyTrack(query) {
    if (import.meta.env.DEV) {
        // Dev: browser → Vite proxy → api.spotify.com (bypasses CORS)
        const token = await getDevToken();
        const url = `/spotify-api/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1&market=CO`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Spotify search ${res.status}`);
        const data = await res.json();
        return data.tracks?.items?.[0] || null;
    } else {
        // Prod: Vercel serverless handles auth + search server-side
        const url = `/api/spotify?q=${encodeURIComponent(query)}&limit=1&market=CO`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Spotify serverless ${res.status}`);
        const data = await res.json();
        return data.tracks?.items?.[0] || null;
    }
}

// ── 20 target tracks ──────────────────────────────────────────────────────────
const TARGET_TRACKS = [
    // ── TOP 10 REGGAETÓN ──
    { q: 'Provenza Karol G',                    genre: 'reggaeton', roi: 19.4 },
    { q: 'Chorrito Pa las Animas Feid',         genre: 'reggaeton', roi: 22.1 },
    { q: 'Monaco Bad Bunny',                    genre: 'reggaeton', roi: 21.8 },
    { q: 'LALA Myke Towers',                    genre: 'reggaeton', roi: 17.3 },
    { q: 'Por Las Noches Peso Pluma',           genre: 'reggaeton', roi: 20.5 },
    { q: 'Amargura Feid Young Miko',            genre: 'reggaeton', roi: 18.7 },
    { q: 'Ojitos Lindos Bad Bunny',             genre: 'reggaeton', roi: 16.9 },
    { q: 'Con Altura Rosalia',                  genre: 'reggaeton', roi: 23.2 },
    { q: 'Mayor Que Yo Daddy Yankee',           genre: 'reggaeton', roi: 15.6 },
    { q: 'Titi Me Pregunto Bad Bunny',          genre: 'reggaeton', roi: 18.1 },
    // ── TOP 10 ROCK ──
    { q: 'Do I Wanna Know Arctic Monkeys',      genre: 'rock', roi: 14.8 },
    { q: 'Bohemian Rhapsody Queen',             genre: 'rock', roi: 16.2 },
    { q: 'Persiana Americana Soda Stereo',      genre: 'rock', roi: 13.5 },
    { q: 'Numb Linkin Park',                    genre: 'rock', roi: 15.1 },
    { q: 'Smells Like Teen Spirit Nirvana',     genre: 'rock', roi: 12.9 },
    { q: 'Mr Brightside The Killers',           genre: 'rock', roi: 11.7 },
    { q: 'Yellow Coldplay',                     genre: 'rock', roi: 13.8 },
    { q: 'Seven Nation Army White Stripes',     genre: 'rock', roi: 12.3 },
    { q: 'De Musica Ligera Soda Stereo',        genre: 'rock', roi: 14.0 },
    { q: 'Still Loving You Scorpions',          genre: 'rock', roi: 11.2 },
];

// ── Normalize Spotify track → SongCard schema ─────────────────────────────────
function normalizeSpotifyTrack(track, meta, position) {
    const { genre, roi } = meta;
    const pop      = track.popularity || 75;
    const streams  = Math.round(pop * 14_000_000 + Math.random() * 5_000_000);
    const views    = Math.round(streams * 0.62);
    const tiktok   = Math.round(streams * 0.07);
    const totalVal = Math.round(20_000 + pop * 720);
    const price    = 25 + Math.floor(pop / 12) * 5;
    const funding  = Math.min(94, 58 + position * -2 + Math.floor(Math.random() * 14));

    const album = track.album || {};
    const artist = track.artists?.[0]?.name || '';

    // Spotify images: [0] = 640px, [1] = 300px, [2] = 64px
    const coverUrl = album.images?.[0]?.url || album.images?.[1]?.url || null;

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
        preview_url:      track.preview_url || null,   // 30s preview — available when Spotify provides it
        metadata: {
            artist,
            isrc:             track.external_ids?.isrc || '',
            spotify_track_id: track.id,
            spotify_url:      track.external_urls?.spotify || '',
            album_name:       album.name || '',
            spotify_streams:  streams,
            youtube_views:    views,
            tiktok_creations: tiktok,
            yield_estimate:   `${roi.toFixed(1)}%`,
            genre:            genre === 'reggaeton' ? 'Reggaetón / Urbano' : 'Rock',
            genre_tag:        genre,
            popularity:       pop,
            duration_ms:      track.duration_ms || 210_000,
            funding_percent:  funding,
            raised_amount:    Math.round(totalVal * funding / 100),
            is_trending:      position < 3,
            preview_url:      track.preview_url || null,
            bio: `${artist} es uno de los artistas más influyentes del género ${genre === 'reggaeton' ? 'reggaetón/urbano' : 'rock'} con millones de oyentes mensuales en plataformas globales.`,
            review: `"${track.name}" ha acumulado más de ${(streams / 1_000_000).toFixed(1)}M de streams en Spotify. Este activo representa una oportunidad de inversión en regalías de uno de los catálogos más sólidos del mercado musical.`,
        },
    };
}

// ── Fallback (rich metadata, Spotify-branded colors) ─────────────────────────
const FALLBACK = [
    { name: 'Provenza',                artist: 'Karol G',          genre: 'reggaeton', roi: 19.4, pop: 95 },
    { name: 'Chorrito Pa Las Animas',  artist: 'Feid',             genre: 'reggaeton', roi: 22.1, pop: 92 },
    { name: 'Monaco',                  artist: 'Bad Bunny',        genre: 'reggaeton', roi: 21.8, pop: 97 },
    { name: 'LALA',                    artist: 'Myke Towers',      genre: 'reggaeton', roi: 17.3, pop: 88 },
    { name: 'Por Las Noches',          artist: 'Peso Pluma',       genre: 'reggaeton', roi: 20.5, pop: 91 },
    { name: 'Amargura',                artist: 'Feid',             genre: 'reggaeton', roi: 18.7, pop: 89 },
    { name: 'Ojitos Lindos',           artist: 'Bad Bunny',        genre: 'reggaeton', roi: 16.9, pop: 90 },
    { name: 'Con Altura',              artist: 'Rosalía',          genre: 'reggaeton', roi: 23.2, pop: 93 },
    { name: 'Mayor Que Yo',            artist: 'Daddy Yankee',     genre: 'reggaeton', roi: 15.6, pop: 82 },
    { name: 'Tití Me Preguntó',        artist: 'Bad Bunny',        genre: 'reggaeton', roi: 18.1, pop: 86 },
    { name: 'Do I Wanna Know?',        artist: 'Arctic Monkeys',   genre: 'rock',      roi: 14.8, pop: 88 },
    { name: 'Bohemian Rhapsody',       artist: 'Queen',            genre: 'rock',      roi: 16.2, pop: 94 },
    { name: 'Persiana Americana',      artist: 'Soda Stereo',      genre: 'rock',      roi: 13.5, pop: 79 },
    { name: 'Numb',                    artist: 'Linkin Park',      genre: 'rock',      roi: 15.1, pop: 91 },
    { name: 'Smells Like Teen Spirit', artist: 'Nirvana',          genre: 'rock',      roi: 12.9, pop: 87 },
    { name: 'Mr. Brightside',          artist: 'The Killers',      genre: 'rock',      roi: 11.7, pop: 84 },
    { name: 'Yellow',                  artist: 'Coldplay',         genre: 'rock',      roi: 13.8, pop: 88 },
    { name: 'Seven Nation Army',       artist: 'The White Stripes',genre: 'rock',      roi: 12.3, pop: 85 },
    { name: 'De Música Ligera',        artist: 'Soda Stereo',      genre: 'rock',      roi: 14.0, pop: 80 },
    { name: 'Still Loving You',        artist: 'Scorpions',        genre: 'rock',      roi: 11.2, pop: 76 },
];

const COVERS_FALLBACK = [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop',
];

function buildFallback() {
    return FALLBACK.map((s, i) => {
        const streams  = Math.round(s.pop * 14_000_000);
        const totalVal = Math.round(20_000 + s.pop * 720);
        const funding  = Math.min(92, 55 + i * -2 + 12);
        const price    = 25 + Math.floor(s.pop / 12) * 5;
        const cover    = COVERS_FALLBACK[i % COVERS_FALLBACK.length];
        return {
            id: `fb-${i}`,
            name: s.name,
            symbol: s.name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'BEAT',
            asset_type: 'music',
            token_price_usd: price,
            total_supply: 1000,
            valuation_usd: totalVal,
            cover_url: cover,
            image: cover,
            preview_url: null,
            metadata: {
                artist: s.artist,
                spotify_streams:  streams,
                youtube_views:    Math.round(streams * 0.62),
                tiktok_creations: Math.round(streams * 0.07),
                yield_estimate:   `${s.roi.toFixed(1)}%`,
                genre: s.genre === 'reggaeton' ? 'Reggaetón / Urbano' : 'Rock',
                genre_tag: s.genre,
                popularity: s.pop,
                funding_percent: funding,
                raised_amount: Math.round(totalVal * funding / 100),
                is_trending: i < 3,
                preview_url: null,
                bio: `${s.artist} es uno de los artistas más influyentes del género ${s.genre === 'reggaeton' ? 'reggaetón/urbano' : 'rock'} con millones de oyentes mensuales en plataformas globales.`,
                review: `"${s.name}" ha acumulado más de ${(streams / 1_000_000).toFixed(1)}M de streams. Este activo representa una excelente oportunidad de inversión en regalías musicales.`,
            },
        };
    });
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchDemoSongs20() {
    console.log('🎵 [BE4T] Fetching 20 tracks from Spotify Web API...');
    try {
        const results = await Promise.allSettled(
            TARGET_TRACKS.map((meta, i) =>
                searchSpotifyTrack(meta.q).then(track => ({ track, meta, i }))
            )
        );

        const songs = [];
        let hits = 0;

        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value?.track) {
                songs.push(normalizeSpotifyTrack(result.value.track, result.value.meta, i));
                hits++;
            } else {
                console.warn(`[BE4T] Track ${i} fallback:`, result.reason?.message || 'no result');
                songs.push(buildFallback()[i]);
            }
        });

        console.log(`✅ Spotify: ${hits}/20 from API, ${20 - hits} from fallback`);
        if (songs[0]) {
            console.log('🖼  Cover[0]:', songs[0].cover_url);
            console.log('🎵 Preview[0]:', songs[0].preview_url || '(null — Spotify may not provide preview for this track)');
        }
        return songs;
    } catch (err) {
        console.warn('⚠️ Spotify API unreachable, using fallback:', err.message);
        return buildFallback();
    }
}

// ── Legacy aliases ────────────────────────────────────────────────────────────
export const fetchTop20Reggaeton = fetchDemoSongs20;
export async function ingestTracksToSupabase() { return fetchDemoSongs20(); }
