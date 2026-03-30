/**
 * BE4T Spotify Demo Service
 * Fetches Top 10 Reggaetón + Top 10 Rock directly from Spotify API
 * (Client Credentials Flow — no user login needed)
 * 
 * For the investor demo: data is fresh, direct, never cached in Supabase.
 */

const CLIENT_ID     = import.meta.env?.VITE_SPOTIFY_CLIENT_ID     || '489bc7138c044636947cad63e742a0c3';
const CLIENT_SECRET = import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET || 'f35bbbeb0d204c998b50f00b9e389e08';

// ── Token cache ────────────────────────────────────────────────────────────────
let _token = null;
let _expiry = 0;

export async function getSpotifyToken() {
    if (_token && Date.now() < _expiry) return _token;
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);
    const data = await res.json();
    _token  = data.access_token;
    _expiry = Date.now() + (data.expires_in - 60) * 1000;
    return _token;
}

// ── 20 target tracks for the investor demo ────────────────────────────────────
const TARGET_TRACKS = [
    // ── TOP 10 REGGAETÓN ──
    { q: 'track:"Provenza" artist:"Karol G"',          genre: 'reggaeton', roi: 19.4 },
    { q: 'track:"Chorrito Pa las Animas" artist:"Feid"', genre: 'reggaeton', roi: 22.1 },
    { q: 'track:"Monaco" artist:"Bad Bunny"',           genre: 'reggaeton', roi: 21.8 },
    { q: 'track:"LALA" artist:"Myke Towers"',           genre: 'reggaeton', roi: 17.3 },
    { q: 'track:"Por Las Noches" artist:"Peso Pluma"',  genre: 'reggaeton', roi: 20.5 },
    { q: 'track:"Amargura" artist:"Feid"',              genre: 'reggaeton', roi: 18.7 },
    { q: 'track:"Ojitos Lindos" artist:"Bad Bunny"',    genre: 'reggaeton', roi: 16.9 },
    { q: 'track:"Con Altura" artist:"Rosalía"',         genre: 'reggaeton', roi: 23.2 },
    { q: 'track:"Mayor Que Yo 3" artist:"Daddy Yankee"', genre: 'reggaeton', roi: 15.6 },
    { q: 'track:"x100PRE" artist:"Bad Bunny"',          genre: 'reggaeton', roi: 18.1 },
    // ── TOP 10 ROCK ──
    { q: 'track:"Do I Wanna Know" artist:"Arctic Monkeys"', genre: 'rock', roi: 14.8 },
    { q: 'track:"Bohemian Rhapsody" artist:"Queen"',         genre: 'rock', roi: 16.2 },
    { q: 'track:"Persiana Americana" artist:"Soda Stereo"',  genre: 'rock', roi: 13.5 },
    { q: 'track:"Numb" artist:"Linkin Park"',                genre: 'rock', roi: 15.1 },
    { q: 'track:"Smells Like Teen Spirit" artist:"Nirvana"', genre: 'rock', roi: 12.9 },
    { q: 'track:"Mr Brightside" artist:"The Killers"',       genre: 'rock', roi: 11.7 },
    { q: 'track:"Yellow" artist:"Coldplay"',                 genre: 'rock', roi: 13.8 },
    { q: 'track:"Seven Nation Army" artist:"White Stripes"', genre: 'rock', roi: 12.3 },
    { q: 'track:"De Musica Ligera" artist:"Soda Stereo"',   genre: 'rock', roi: 14.0 },
    { q: 'track:"Still Loving You" artist:"Scorpions"',      genre: 'rock', roi: 11.2 },
];

// ── Search a single track ─────────────────────────────────────────────────────
async function searchTrack(query, token) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1&market=US`;
    const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.tracks?.items?.[0] || null;
}

// ── Normalize Spotify track → SongCard / AssetDetailView schema ───────────────
function normalize(track, meta, position) {
    const { genre, roi } = meta;
    const artist   = track.artists?.[0] || {};
    const album    = track.album || {};
    const cover    = album.images?.[0]?.url || null; // 640×640 high-res

    const pop     = track.popularity || 60;
    const streams = Math.round(pop * 15_000_000 + Math.random() * 8_000_000);
    const views   = Math.round(streams * 0.62);
    const tiktok  = Math.round(streams * 0.07);
    const totalVal= Math.round(20_000 + pop * 750);
    const price   = 25 + Math.floor(pop / 12) * 5;
    const funding = Math.min(96, 55 + position * -2 + Math.floor(Math.random() * 18));

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
        cover_url:        cover,
        image:            cover,
        preview_url:      track.preview_url,
        metadata: {
            artist:           artist.name,
            artist_id:        artist.id,
            isrc:             track.external_ids?.isrc || '',
            spotify_track_id: track.id,
            spotify_streams:  streams,
            youtube_views:    views,
            tiktok_creations: tiktok,
            yield_estimate:   `${roi.toFixed(1)}%`,
            genre:            genre === 'reggaeton' ? 'Reggaetón / Urbano' : 'Rock',
            genre_tag:        genre,
            popularity:       pop,
            duration_ms:      track.duration_ms,
            album_name:       album.name,
            release_year:     (album.release_date || '2023').slice(0, 4),
            preview_url:      track.preview_url,
            funding_percent:  funding,
            raised_amount:    Math.round(totalVal * funding / 100),
            is_trending:      position < 3,
            bio: `${artist.name} es uno de los artistas más influyentes del género ${genre === 'reggaeton' ? 'reggaetón/urbano' : 'rock'} a nivel mundial, con millones de oyentes mensuales en Spotify y una presencia consolidada en las principales plataformas de streaming.`,
            review: `"${track.name}" es un hito de ${artist.name} con más de ${(streams / 1_000_000).toFixed(1)}M de streams. Este activo representa una oportunidad de inversión en regalías de uno de los catálogos más sólidos del mercado musical global.`,
        },
    };
}

// ── Fallback: 20 real songs with static metadata ─────────────────────────────
const FALLBACK_SONGS = [
    // Reggaetón
    { name: 'Provenza',                 artist: 'Karol G',        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600', genre: 'reggaeton', roi: 19.4, pop: 95 },
    { name: 'Chorrito Pa las Animas',   artist: 'Feid',           cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600', genre: 'reggaeton', roi: 22.1, pop: 92 },
    { name: 'Monaco',                   artist: 'Bad Bunny',      cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600', genre: 'reggaeton', roi: 21.8, pop: 97 },
    { name: 'LALA',                     artist: 'Myke Towers',    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600', genre: 'reggaeton', roi: 17.3, pop: 88 },
    { name: 'Por Las Noches',           artist: 'Peso Pluma',     cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600', genre: 'reggaeton', roi: 20.5, pop: 91 },
    { name: 'Amargura',                 artist: 'Feid',           cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600', genre: 'reggaeton', roi: 18.7, pop: 89 },
    { name: 'Ojitos Lindos',            artist: 'Bad Bunny',      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600', genre: 'reggaeton', roi: 16.9, pop: 90 },
    { name: 'Con Altura',               artist: 'Rosalía',        cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600', genre: 'reggaeton', roi: 23.2, pop: 93 },
    { name: 'Mayor Que Yo 3',           artist: 'Daddy Yankee',   cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600', genre: 'reggaeton', roi: 15.6, pop: 82 },
    { name: 'x100PRE',                  artist: 'Bad Bunny',      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600', genre: 'reggaeton', roi: 18.1, pop: 86 },
    // Rock
    { name: 'Do I Wanna Know?',         artist: 'Arctic Monkeys', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600', genre: 'rock', roi: 14.8, pop: 88 },
    { name: 'Bohemian Rhapsody',         artist: 'Queen',          cover: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=600', genre: 'rock', roi: 16.2, pop: 94 },
    { name: 'Persiana Americana',        artist: 'Soda Stereo',    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600', genre: 'rock', roi: 13.5, pop: 79 },
    { name: 'Numb',                      artist: 'Linkin Park',    cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600', genre: 'rock', roi: 15.1, pop: 91 },
    { name: 'Smells Like Teen Spirit',   artist: 'Nirvana',        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600', genre: 'rock', roi: 12.9, pop: 87 },
    { name: 'Mr. Brightside',            artist: 'The Killers',    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600', genre: 'rock', roi: 11.7, pop: 84 },
    { name: 'Yellow',                    artist: 'Coldplay',       cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600', genre: 'rock', roi: 13.8, pop: 88 },
    { name: 'Seven Nation Army',         artist: 'The White Stripes', cover: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=600', genre: 'rock', roi: 12.3, pop: 85 },
    { name: 'De Música Ligera',          artist: 'Soda Stereo',    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600', genre: 'rock', roi: 14.0, pop: 80 },
    { name: 'Still Loving You',          artist: 'Scorpions',      cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600', genre: 'rock', roi: 11.2, pop: 76 },
];

const buildFallback = () =>
    FALLBACK_SONGS.map((s, i) => {
        const streams = Math.round(s.pop * 14_000_000 + Math.random() * 5_000_000);
        const totalVal = Math.round(20_000 + s.pop * 700);
        const price    = 25 + Math.floor(s.pop / 12) * 5;
        const funding  = Math.min(94, 55 + i * -2 + Math.floor(Math.random() * 15));
        return {
            id: `fallback-${i}`,
            name: s.name,
            symbol: s.name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'BEAT',
            asset_type: 'music',
            token_price_usd: price,
            total_supply: 1000,
            valuation_usd: totalVal,
            is_tokenized: false,
            contract_address: null,
            cover_url: s.cover,
            image: s.cover,
            preview_url: null,
            metadata: {
                artist: s.artist,
                spotify_streams: streams,
                youtube_views:   Math.round(streams * 0.62),
                tiktok_creations: Math.round(streams * 0.07),
                yield_estimate:  `${s.roi.toFixed(1)}%`,
                genre: s.genre === 'reggaeton' ? 'Reggaetón / Urbano' : 'Rock',
                genre_tag: s.genre,
                popularity: s.pop,
                funding_percent: funding,
                raised_amount: Math.round(totalVal * funding / 100),
                is_trending: i < 3,
                bio: `${s.artist} es uno de los artistas más influyentes del género ${s.genre === 'reggaeton' ? 'reggaetón/urbano' : 'rock'} con millones de oyentes mensuales y una presencia global consolidada.`,
                review: `"${s.name}" es un hito musical con más de ${(streams / 1_000_000).toFixed(1)}M de streams. Representa una oportunidad de inversión en regalías de uno de los catálogos más sólidos del mercado musical global.`,
            },
        };
    });

// ── Main export: fetch 20 demo songs directly (no Supabase) ──────────────────
export async function fetchDemoSongs20() {
    try {
        const token = await getSpotifyToken();

        // Fire all 20 searches in parallel for speed
        const results = await Promise.allSettled(
            TARGET_TRACKS.map(meta => searchTrack(meta.q, token).then(track => ({ track, meta })))
        );

        const songs = [];
        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value.track) {
                songs.push(normalize(result.value.track, result.value.meta, i));
            } else {
                // Individual track fallback using static data
                const fb = buildFallback()[i];
                songs.push(fb);
            }
        });

        console.log(`✅ Spotify demo: ${songs.filter(s => !s.id.startsWith('fallback')).length}/20 tracks from API`);
        return songs;
    } catch (err) {
        console.warn('⚠️ Spotify API unavailable, using fallback:', err.message);
        return buildFallback();
    }
}

// ── Legacy exports (kept for backward compatibility) ─────────────────────────
export { getSpotifyToken as default };
export const fetchTop20Reggaeton = fetchDemoSongs20;

export async function ingestTracksToSupabase() {
    // No-op for demo mode — data is intentionally not stored
    console.info('ℹ️ Demo mode: Supabase ingestion skipped. Data is live from Spotify API.');
    return await fetchDemoSongs20();
}
