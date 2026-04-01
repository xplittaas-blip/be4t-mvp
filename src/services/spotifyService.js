/**
 * BE4T — Static Demo Catalog
 * ============================================================
 * ZERO API CALLS. All data is hardcoded for pitch reliability.
 *
 * Covers:   Spotify CDN (i.scdn.co) + Deezer CDN (cdn-images.dzcdn.net)
 * Previews: Deezer MP3 CDN (~30s, public URLs)
 * Artists:  Karol G (5), Feid (5), Danny Ocean (5), Ryan Castro (5)
 * ============================================================
 */

const SONGS = [
    // ═══════════════════════════════════════
    // KAROL G — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'kg-1',
        name: 'PROVENZA',
        artist: 'KAROL G',
        genre: 'reggaeton',
        roi: 19.4,
        pop: 95,
        // Cover proporcionada por el usuario (Spotify CDN):
        cover_url: 'https://i.scdn.co/image/ab67616d0000b2731244e541e695fa97950ba3c1',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/7/f/e/0/7fe9845244c7c8dce2e4e6561a6f49a1.mp3',
    },
    {
        id: 'kg-2',
        name: 'BICHOTA',
        artist: 'KAROL G',
        genre: 'reggaeton',
        roi: 22.1,
        pop: 93,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/16d30e071f24a845d50b5e52543ef01d/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/0/6/e/0/06ee087c9c76a2e4c4bd62bec18a7e1b.mp3',
    },
    {
        id: 'kg-3',
        name: 'Tusa',
        artist: 'KAROL G ft. Nicki Minaj',
        genre: 'reggaeton',
        roi: 20.5,
        pop: 92,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/7f4412829dda081518c9b1d7d40b3eda/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/2/9/5/0/295fb558a4b89b3edf9df0d00ef5efca.mp3',
    },
    {
        id: 'kg-4',
        name: 'CAIRO',
        artist: 'KAROL G',
        genre: 'reggaeton',
        roi: 17.8,
        pop: 88,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/0e4fb113c070b063bd19c455e95cf1f9/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/4/a/2/0/4a2de7c1a420783e31b617cb08c91561.mp3',
    },
    {
        id: 'kg-5',
        name: 'TQG',
        artist: 'KAROL G & Shakira',
        genre: 'reggaeton',
        roi: 21.0,
        pop: 96,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/608e6114bb1e0a7f3a512538d7bd9248/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/7/2/9/0/729d065be2ce73f3efcca3e4f27eb0a2.mp3',
    },

    // ═══════════════════════════════════════
    // FEID — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'feid-1',
        name: 'CHORRITO PA LAS ANIMAS',
        artist: 'Feid',
        genre: 'reggaeton',
        roi: 22.1,
        pop: 93,
        // Cover proporcionada por el usuario (Spotify CDN):
        cover_url: 'https://i.scdn.co/image/ab67616d0000b27387201c138c844636947cad63',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/8/e/b/0/8eb035d70e51da5b836d02243326d7a9.mp3',
    },
    {
        id: 'feid-2',
        name: 'Normal',
        artist: 'Feid',
        genre: 'reggaeton',
        roi: 18.7,
        pop: 89,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/66daee7acd7efdb8462bef0d0f14d0e5/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/5/0/1/0/501d9ae81d1ae2bfbdc414f78952e067.mp3',
    },
    {
        id: 'feid-3',
        name: 'PORFA',
        artist: 'Feid',
        genre: 'reggaeton',
        roi: 16.9,
        pop: 87,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/c5df68e432ca3d923d17c9e0134661c8/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/6/2/2/0/622e6369fe60c80cfd2ae08e2c89336e.mp3',
    },
    {
        id: 'feid-4',
        name: 'Castigo',
        artist: 'Feid',
        genre: 'reggaeton',
        roi: 19.2,
        pop: 90,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/e1e452f18ae4393e1b59c6eb939b0ded/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/8/7/c/0/87cbe6cbdcfefd03ff4b85ade01936ab.mp3',
    },
    {
        id: 'feid-5',
        name: 'LUNA',
        artist: 'Feid',
        genre: 'reggaeton',
        roi: 20.3,
        pop: 91,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/fee4b7345f658a57a39747bf24b7466b/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/3/e/5/0/3e5f29ce5438b8a3fa7db790484872ec.mp3',
    },

    // ═══════════════════════════════════════
    // DANNY OCEAN — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'do-1',
        name: 'Me Rehúso',
        artist: 'Danny Ocean',
        genre: 'latin_pop',
        roi: 18.5,
        pop: 91,
        // Cover proporcionada por el usuario (Spotify CDN):
        cover_url: 'https://i.scdn.co/image/ab67616d0000b273752e519c25f46337f71661d9',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/3/d/a/0/3daf97e2924922289456506127fc2417.mp3',
    },
    {
        id: 'do-2',
        name: 'Swing',
        artist: 'Danny Ocean',
        genre: 'latin_pop',
        roi: 17.2,
        pop: 84,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2f76ac8b199bc5a23c6edf5e99ab1ab4/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/b/e/a/0/bea48823fb96b6f9d6c71645e5299a20.mp3',
    },
    {
        id: 'do-3',
        name: '54+1',
        artist: 'Danny Ocean',
        genre: 'latin_pop',
        roi: 19.0,
        pop: 88,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2312f5f5d53b0fb5238a4bc58d2f6cf6/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/3/d/a/0/3daf97e2924922289456506127fc2417.mp3',
    },
    {
        id: 'do-4',
        name: 'Intuition',
        artist: 'Danny Ocean',
        genre: 'latin_pop',
        roi: 16.8,
        pop: 82,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2312f5f5d53b0fb5238a4bc58d2f6cf6/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/b/e/a/0/bea48823fb96b6f9d6c71645e5299a20.mp3',
    },
    {
        id: 'do-5',
        name: 'Mío',
        artist: 'Danny Ocean',
        genre: 'latin_pop',
        roi: 20.1,
        pop: 86,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/2f76ac8b199bc5a23c6edf5e99ab1ab4/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/3/d/a/0/3daf97e2924922289456506127fc2417.mp3',
    },

    // ═══════════════════════════════════════
    // RYAN CASTRO — 5 tracks
    // ═══════════════════════════════════════
    {
        id: 'rc-1',
        name: 'LA VILLA',
        artist: 'Ryan Castro',
        genre: 'reggaeton',
        roi: 19.0,
        pop: 87,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/209be51d61bb294021fc3392de866484/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/d/0/c/0/d0c42bd5a87ef216ba8a1fa320f25f5a.mp3',
    },
    {
        id: 'rc-2',
        name: 'El Pichón',
        artist: 'Ryan Castro',
        genre: 'reggaeton',
        roi: 17.5,
        pop: 84,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/aba93a0610829375de994c34ffd8867a/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/c/a/c/0/cac55ba5fd9f27786170c2d3f2a6fb11.mp3',
    },
    {
        id: 'rc-3',
        name: 'El Niño',
        artist: 'Ryan Castro',
        genre: 'reggaeton',
        roi: 21.3,
        pop: 88,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/209be51d61bb294021fc3392de866484/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/d/0/c/0/d0c42bd5a87ef216ba8a1fa320f25f5a.mp3',
    },
    {
        id: 'rc-4',
        name: 'Un Año',
        artist: 'Ryan Castro',
        genre: 'reggaeton',
        roi: 18.8,
        pop: 85,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/aba93a0610829375de994c34ffd8867a/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/c/a/c/0/cac55ba5fd9f27786170c2d3f2a6fb11.mp3',
    },
    {
        id: 'rc-5',
        name: 'Querida',
        artist: 'Ryan Castro',
        genre: 'reggaeton',
        roi: 20.0,
        pop: 83,
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/209be51d61bb294021fc3392de866484/1000x1000-000000-80-0-0.jpg',
        preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/d/0/c/0/d0c42bd5a87ef216ba8a1fa320f25f5a.mp3',
    },
];

// ── Normalize to SongCard schema ──────────────────────────────────────────────
function normalize(s, i) {
    const streams  = Math.round(s.pop * 14_000_000 + (i * 1_234_567));
    const totalVal = Math.round(20_000 + s.pop * 720);
    const funding  = Math.min(92, 55 + i * -1.5 + 15);
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
        preview_url:      s.preview_url,
        metadata: {
            artist:           s.artist,
            spotify_streams:  streams,
            youtube_views:    Math.round(streams * 0.62),
            tiktok_creations: Math.round(streams * 0.07),
            yield_estimate:   `${s.roi.toFixed(1)}%`,
            genre:            genreLabel,
            genre_tag:        s.genre,
            popularity:       s.pop,
            duration_ms:      210_000,
            funding_percent:  Math.round(funding),
            raised_amount:    Math.round(totalVal * funding / 100),
            is_trending:      i < 3,
            preview_url:      s.preview_url,
            bio: `${s.artist} es uno de los artistas más influyentes del género ${genreLabel} con millones de oyentes mensuales en plataformas globales.`,
            review: `"${s.name}" ha acumulado más de ${(streams / 1_000_000).toFixed(1)}M de streams. Este activo tokenizado representa una oportunidad premium de inversión en regalías musicales.`,
        },
    };
}

// ── Main export — instant, no network calls ────────────────────────────────────
export async function fetchDemoSongs20() {
    console.log('🎵 [BE4T] Loading static catalog — 20 songs (KarolG×5, Feid×5, DannyOcean×5, RyanCastro×5)');
    const songs = SONGS.map(normalize);
    console.log(`✅ ${songs.length} songs ready | ${songs.filter(s => s.preview_url).length}/20 with audio preview`);
    return songs;
}

// ── Legacy aliases ─────────────────────────────────────────────────────────────
export const fetchTop20Reggaeton = fetchDemoSongs20;
export async function ingestTracksToSupabase() { return fetchDemoSongs20(); }
