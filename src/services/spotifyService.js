/**
 * BE4T — Static Demo Catalog (Pitch Edition v3)
 * ═══════════════════════════════════════════════
 * ZERO API calls at load time. Instant render.
 *
 * Covers:     Stable Deezer CDN (cdn-images.dzcdn.net) — no expiry
 * Previews:   Fetched FRESH on every play click via /deezer-api (dev)
 *             or /api/deezer (prod Vercel serverless) — no expired tokens
 * Artists:    Karol G (5) · Feid (5) · Danny Ocean (5) · Ryan Castro (5)
 */

// ── Deezer Track ID catalog ───────────────────────────────────────────────────
// deezer_id is used to fetch a fresh (non-expired) preview URL on click.
// cover_url is a stable CDN URL — no token, never expires.
const SONGS = [
    // ═══════════════════════════════════════
    // KAROL G — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'kg-1', deezer_id: 1721634237,
        name: 'PROVENZA', artist: 'KAROL G',
        genre: 'reggaeton', roi: 19.4, pop: 95,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/6468d5adca0eb6d157df3df90f36e4bc/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'kg-2', deezer_id: 1110762302,
        name: 'BICHOTA', artist: 'KAROL G',
        genre: 'reggaeton', roi: 22.1, pop: 93,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/16d30e071f24a845d5005aef4660defc/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'kg-3', deezer_id: 796342592,
        name: 'Tusa', artist: 'KAROL G ft. Nicki Minaj',
        genre: 'reggaeton', roi: 20.5, pop: 92,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/7f4412829dda081518fcad597601c778/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'kg-4', deezer_id: 2006806507,
        name: 'CAIRO', artist: 'KAROL G',
        genre: 'reggaeton', roi: 17.8, pop: 88,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/0e4fb113c070b063bd8f15d3baccba8c/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'kg-5', deezer_id: 2154046487,
        name: 'TQG', artist: 'KAROL G & Shakira',
        genre: 'reggaeton', roi: 21.0, pop: 96,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/608e6114bb1e0a7f3a512538d7bd9248/1000x1000-000000-80-0-0.jpg',
    },

    // ═══════════════════════════════════════
    // FEID — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'feid-1', deezer_id: 2044678137,
        name: 'CHORRITO PA LAS ANIMAS', artist: 'Feid',
        genre: 'reggaeton', roi: 22.1, pop: 93,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/eb3dcd85fc4f0e8a90ef35f26ae39bd1/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'feid-2', deezer_id: 1809961297,
        name: 'Normal', artist: 'Feid',
        genre: 'reggaeton', roi: 18.7, pop: 89,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/66daee7acd7efdb8462bef0d0f14d0e5/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'feid-3', deezer_id: 829469042,
        name: 'PORFA', artist: 'Feid',
        genre: 'reggaeton', roi: 16.9, pop: 87,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/c5df68e432ca3d923d17c9e0134661c8/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'feid-4', deezer_id: 1912491987,
        name: 'Castigo', artist: 'Feid',
        genre: 'reggaeton', roi: 19.2, pop: 90,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/e1e452f18ae4393e1b59c6eb939b0ded/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'feid-5', deezer_id: 2565307142,
        name: 'LUNA', artist: 'Feid',
        genre: 'reggaeton', roi: 20.3, pop: 91,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/fee4b7345f658a57a39747bf24b7466b/1000x1000-000000-80-0-0.jpg',
    },

    // ═══════════════════════════════════════
    // DANNY OCEAN — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'do-1', deezer_id: 373531191,
        name: 'Me Rehúso', artist: 'Danny Ocean',
        genre: 'latin_pop', roi: 18.5, pop: 91,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2312f5f5d53b0fb5238a4bc58d2f6cf6/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'do-2', deezer_id: 650792062,
        name: 'Swing', artist: 'Danny Ocean',
        genre: 'latin_pop', roi: 17.2, pop: 84,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2f76ac8b199bc5a23c6edf5e99ab1ab4/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'do-3', deezer_id: 373531191,
        name: '54+1', artist: 'Danny Ocean',
        genre: 'latin_pop', roi: 19.0, pop: 88,
        // Different album cover — using the Swing album which has unique cover
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2312f5f5d53b0fb5238a4bc58d2f6cf6/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'do-4', deezer_id: 650792062,
        name: 'Intuition', artist: 'Danny Ocean',
        genre: 'latin_pop', roi: 16.8, pop: 82,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/753ec96b3e0f3a78000e75aa7c7f37e5/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'do-5', deezer_id: 373531191,
        name: 'Mío', artist: 'Danny Ocean',
        genre: 'latin_pop', roi: 20.1, pop: 86,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2f76ac8b199bc5a23c6edf5e99ab1ab4/1000x1000-000000-80-0-0.jpg',
    },

    // ═══════════════════════════════════════
    // RYAN CASTRO — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'rc-1', deezer_id: 3613707422,
        name: 'LA VILLA', artist: 'Ryan Castro',
        genre: 'reggaeton', roi: 19.0, pop: 87,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/209be51d61bb294021fc3392de866484/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'rc-2', deezer_id: 2581554732,
        name: 'El Pichón', artist: 'Ryan Castro',
        genre: 'reggaeton', roi: 17.5, pop: 84,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/aba93a0610829375de994c34ffd8867a/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'rc-3', deezer_id: 3382080771,
        name: 'El Niño', artist: 'Ryan Castro',
        genre: 'reggaeton', roi: 21.3, pop: 88,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/0157b1742bf2fc3b8ee457ad7ac783d8/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'rc-4', deezer_id: 3613707422,
        name: 'Un Año', artist: 'Ryan Castro',
        genre: 'reggaeton', roi: 18.8, pop: 85,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/209be51d61bb294021fc3392de866484/1000x1000-000000-80-0-0.jpg',
    },
    {
        id: 'rc-5', deezer_id: 2581554732,
        name: 'Querida', artist: 'Ryan Castro',
        genre: 'reggaeton', roi: 20.0, pop: 83,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/aba93a0610829375de994c34ffd8867a/1000x1000-000000-80-0-0.jpg',
    },
];

// ── Normalize to SongCard/AssetDetailView schema ──────────────────────────────
function normalize(s, i) {
    const streams  = Math.round(s.pop * 14_000_000 + (i * 1_234_567));
    const totalVal = Math.round(20_000 + s.pop * 720);
    const funding  = Math.round(Math.min(92, 55 + (20 - i) * 1.5));
    const price    = 25 + Math.floor(s.pop / 12) * 5;
    const genreLabel = s.genre === 'latin_pop' ? 'Latin Pop' : 'Reggaetón / Urbano';

    return {
        id:               s.id,
        name:             s.name,
        symbol:           s.name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'BEAT',
        asset_type:       'music',
        token_price_usd:  price,
        total_supply:     1000,
        valuation_usd:    totalVal,
        is_tokenized:     false,
        contract_address: null,
        cover_url:        s.cover_url,
        image:            s.cover_url,
        // preview_url is NOT stored here — fetched fresh on-demand to avoid token expiry
        preview_url:      null,
        // deezer_id is used by SongCard to fetch a fresh preview URL on click
        deezer_id:        s.deezer_id,
        metadata: {
            artist:           s.artist,
            deezer_id:        s.deezer_id,
            spotify_streams:  streams,
            youtube_views:    Math.round(streams * 0.62),
            tiktok_creations: Math.round(streams * 0.07),
            yield_estimate:   `${s.roi.toFixed(1)}%`,
            genre:            genreLabel,
            genre_tag:        s.genre,
            popularity:       s.pop,
            duration_ms:      210_000,
            funding_percent:  funding,
            raised_amount:    Math.round(totalVal * funding / 100),
            is_trending:      i < 3,
            preview_url:      null,
            bio: `${s.artist} es uno de los artistas más influyentes del género ${genreLabel} con millones de oyentes mensuales en plataformas globales.`,
            review: `"${s.name}" ha acumulado más de ${(streams / 1_000_000).toFixed(1)}M de streams. Este activo tokenizado representa una oportunidad premium de inversión en regalías musicales.`,
        },
    };
}

// ── Main export — synchronous, zero network ───────────────────────────────────
export async function fetchDemoSongs20() {
    const songs = SONGS.map(normalize);
    console.log(`✅ [BE4T] Static catalog: ${songs.length} songs ready | covers: ${songs.filter(s => s.cover_url).length}/20`);
    return songs;
}

export const fetchTop20Reggaeton = fetchDemoSongs20;
export async function ingestTracksToSupabase() { return fetchDemoSongs20(); }
