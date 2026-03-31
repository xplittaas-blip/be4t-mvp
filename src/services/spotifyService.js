/**
 * BE4T Demo Service — Deezer Edition
 * Uses Deezer's free public API (no auth, CORS-friendly) to fetch:
 *   - Real album cover art (1000×1000 JPG)
 *   - 30-second MP3 preview URLs (direct, always available)
 *   - Track metadata (artist, title, duration, popularity)
 *
 * 10 Reggaetón + 10 Rock — optimized for investor demo
 */

// ── 20 target tracks ──────────────────────────────────────────────────────────
const TARGET_TRACKS = [
    // ── TOP 10 REGGAETÓN ──
    { q: 'Provenza Karol G',            genre: 'reggaeton', roi: 19.4 },
    { q: 'Chorrito Pa las Animas Feid', genre: 'reggaeton', roi: 22.1 },
    { q: 'Monaco Bad Bunny',            genre: 'reggaeton', roi: 21.8 },
    { q: 'LALA Myke Towers',            genre: 'reggaeton', roi: 17.3 },
    { q: 'Por Las Noches Peso Pluma',   genre: 'reggaeton', roi: 20.5 },
    { q: 'Amargura Feid Young Miko',    genre: 'reggaeton', roi: 18.7 },
    { q: 'Ojitos Lindos Bad Bunny',     genre: 'reggaeton', roi: 16.9 },
    { q: 'Con Altura Rosalia',          genre: 'reggaeton', roi: 23.2 },
    { q: 'Mayor Que Yo Daddy Yankee',   genre: 'reggaeton', roi: 15.6 },
    { q: 'Titi Me Pregunto Bad Bunny',  genre: 'reggaeton', roi: 18.1 },
    // ── TOP 10 ROCK ──
    { q: 'Do I Wanna Know Arctic Monkeys', genre: 'rock', roi: 14.8 },
    { q: 'Bohemian Rhapsody Queen',        genre: 'rock', roi: 16.2 },
    { q: 'Persiana Americana Soda Stereo', genre: 'rock', roi: 13.5 },
    { q: 'Numb Linkin Park',               genre: 'rock', roi: 15.1 },
    { q: 'Smells Like Teen Spirit Nirvana', genre: 'rock', roi: 12.9 },
    { q: 'Mr Brightside The Killers',      genre: 'rock', roi: 11.7 },
    { q: 'Yellow Coldplay',                genre: 'rock', roi: 13.8 },
    { q: 'Seven Nation Army White Stripes', genre: 'rock', roi: 12.3 },
    { q: 'De Musica Ligera Soda Stereo',   genre: 'rock', roi: 14.0 },
    { q: 'Still Loving You Scorpions',     genre: 'rock', roi: 11.2 },
];

// ── Deezer search via Vite proxy (avoids browser CORS) ───────────────────────
async function searchDeezer(query) {
    // In dev: /deezer-api → proxy → api.deezer.com (no CORS)
    // In prod: /api/deezer serverless function handles this
    const base = import.meta.env.DEV ? '/deezer-api' : '/api/deezer';
    const url = `${base}/search?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Deezer ${res.status}`);
    const json = await res.json();
    return json?.data?.[0] || null;
}

// ── Normalize Deezer track → SongCard / AssetDetailView schema ────────────────
function normalizeDeezer(track, meta, position) {
    const { genre, roi } = meta;
    const pop      = Math.min(100, 60 + Math.round(track.rank / 120_000));
    const streams  = Math.round(pop * 14_000_000 + Math.random() * 6_000_000);
    const views    = Math.round(streams * 0.62);
    const tiktok   = Math.round(streams * 0.07);
    const totalVal = Math.round(20_000 + pop * 720);
    const price    = 25 + Math.floor(pop / 12) * 5;
    const funding  = Math.min(94, 58 + position * -2 + Math.floor(Math.random() * 14));

    return {
        id:              `dz-${track.id}`,
        name:            track.title,
        symbol:          track.title.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'BEAT',
        asset_type:      'music',
        token_price_usd: price,
        total_supply:    1000,
        valuation_usd:   totalVal,
        is_tokenized:    false,
        contract_address: null,
        cover_url:       track.album?.cover_xl || track.album?.cover_big || track.album?.cover || null,
        image:           track.album?.cover_xl || track.album?.cover_big || null,
        preview_url:     track.preview || null,   // Direct 30s MP3 — always available on Deezer ✓
        metadata: {
            artist:           track.artist?.name || '',
            deezer_track_id:  track.id,
            deezer_link:      track.link || '',
            spotify_streams:  streams,
            youtube_views:    views,
            tiktok_creations: tiktok,
            yield_estimate:   `${roi.toFixed(1)}%`,
            genre:            genre === 'reggaeton' ? 'Reggaetón / Urbano' : 'Rock',
            genre_tag:        genre,
            popularity:       pop,
            duration_ms:      (track.duration || 210) * 1000,
            album_name:       track.album?.title || '',
            funding_percent:  funding,
            raised_amount:    Math.round(totalVal * funding / 100),
            is_trending:      position < 3,
            preview_url:      track.preview || null,
            bio: `${track.artist?.name} es uno de los artistas más influyentes del género ${genre === 'reggaeton' ? 'reggaetón/urbano' : 'rock'} con millones de oyentes mensuales en plataformas globales.`,
            review: `"${track.title}" ha acumulado más de ${(streams / 1_000_000).toFixed(1)}M de streams. Este activo representa una oportunidad de inversión en regalías de uno de los catálogos más sólidos del mercado musical.`,
        },
    };
}

// ── Static fallback (same 20 songs, rich metadata, real covers from Unsplash) ─
const FALLBACK_SONGS = [
    { name: 'Provenza',               artist: 'Karol G',        genre: 'reggaeton', roi: 19.4, pop: 95, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop' },
    { name: 'Chorrito Pa las Animas', artist: 'Feid',           genre: 'reggaeton', roi: 22.1, pop: 92, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop' },
    { name: 'Monaco',                 artist: 'Bad Bunny',      genre: 'reggaeton', roi: 21.8, pop: 97, cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600&auto=format&fit=crop' },
    { name: 'LALA',                   artist: 'Myke Towers',    genre: 'reggaeton', roi: 17.3, pop: 88, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop' },
    { name: 'Por Las Noches',         artist: 'Peso Pluma',     genre: 'reggaeton', roi: 20.5, pop: 91, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop' },
    { name: 'Amargura',               artist: 'Feid',           genre: 'reggaeton', roi: 18.7, pop: 89, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop' },
    { name: 'Ojitos Lindos',          artist: 'Bad Bunny',      genre: 'reggaeton', roi: 16.9, pop: 90, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop' },
    { name: 'Con Altura',             artist: 'Rosalía',        genre: 'reggaeton', roi: 23.2, pop: 93, cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600&auto=format&fit=crop' },
    { name: 'Mayor Que Yo',           artist: 'Daddy Yankee',   genre: 'reggaeton', roi: 15.6, pop: 82, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop' },
    { name: 'Tití Me Preguntó',       artist: 'Bad Bunny',      genre: 'reggaeton', roi: 18.1, pop: 86, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop' },
    { name: 'Do I Wanna Know?',       artist: 'Arctic Monkeys', genre: 'rock',      roi: 14.8, pop: 88, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop' },
    { name: 'Bohemian Rhapsody',      artist: 'Queen',          genre: 'rock',      roi: 16.2, pop: 94, cover: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=600&auto=format&fit=crop' },
    { name: 'Persiana Americana',     artist: 'Soda Stereo',    genre: 'rock',      roi: 13.5, pop: 79, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop' },
    { name: 'Numb',                   artist: 'Linkin Park',    genre: 'rock',      roi: 15.1, pop: 91, cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600&auto=format&fit=crop' },
    { name: 'Smells Like Teen Spirit',artist: 'Nirvana',        genre: 'rock',      roi: 12.9, pop: 87, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop' },
    { name: 'Mr. Brightside',         artist: 'The Killers',    genre: 'rock',      roi: 11.7, pop: 84, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop' },
    { name: 'Yellow',                 artist: 'Coldplay',       genre: 'rock',      roi: 13.8, pop: 88, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop' },
    { name: 'Seven Nation Army',      artist: 'The White Stripes', genre: 'rock',  roi: 12.3, pop: 85, cover: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=600&auto=format&fit=crop' },
    { name: 'De Música Ligera',       artist: 'Soda Stereo',    genre: 'rock',      roi: 14.0, pop: 80, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop' },
    { name: 'Still Loving You',       artist: 'Scorpions',      genre: 'rock',      roi: 11.2, pop: 76, cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=600&auto=format&fit=crop' },
];

const buildFallback = () =>
    FALLBACK_SONGS.map((s, i) => {
        const streams  = Math.round(s.pop * 14_000_000);
        const totalVal = Math.round(20_000 + s.pop * 720);
        const funding  = Math.min(92, 55 + i * -2 + 12);
        const price    = 25 + Math.floor(s.pop / 12) * 5;
        return {
            id: `fb-${i}`,
            name: s.name,
            symbol: s.name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'BEAT',
            asset_type: 'music',
            token_price_usd: price,
            total_supply: 1000,
            valuation_usd: totalVal,
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
                preview_url: null,
                bio: `${s.artist} es uno de los artistas más influyentes del género ${s.genre === 'reggaeton' ? 'reggaetón/urbano' : 'rock'} con millones de oyentes mensuales en plataformas globales.`,
                review: `"${s.name}" ha acumulado más de ${(streams / 1_000_000).toFixed(1)}M de streams. Este activo representa una excelente oportunidad de inversión en regalías musicales.`,
            },
        };
    });

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchDemoSongs20() {
    console.log('🎵 Fetching 20 songs from Deezer...');
    try {
        const results = await Promise.allSettled(
            TARGET_TRACKS.map((meta, i) =>
                searchDeezer(meta.q).then(track => ({ track, meta, i }))
            )
        );

        const songs = [];
        let apiHits = 0;

        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value?.track) {
                songs.push(normalizeDeezer(result.value.track, result.value.meta, i));
                apiHits++;
            } else {
                songs.push(buildFallback()[i]);
            }
        });

        console.log(`✅ Deezer: ${apiHits}/20 from API, ${20 - apiHits} from fallback`);
        console.log('🎵 Sample cover:', songs[0]?.cover_url);
        console.log('🎵 Sample preview:', songs[0]?.preview_url);
        return songs;
    } catch (err) {
        console.warn('⚠️ Deezer unreachable, using fallback:', err.message);
        return buildFallback();
    }
}

// ── Legacy aliases (backward compatibility) ───────────────────────────────────
export const fetchTop20Reggaeton = fetchDemoSongs20;
export async function ingestTracksToSupabase() { return fetchDemoSongs20(); }
