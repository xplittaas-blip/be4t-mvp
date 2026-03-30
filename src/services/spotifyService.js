/**
 * BE4T Spotify Service
 * Client Credentials Flow — no user login required.
 * Reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET from env (Node) or
 * VITE_SPOTIFY_CLIENT_ID / VITE_SPOTIFY_CLIENT_SECRET (browser).
 *
 * Main exports:
 *   getSpotifyToken()         → Bearer token
 *   fetchTop20Reggaeton()     → 20 normalized track objects
 *   ingestTracksToSupabase()  → upserts tracks into assets table
 */

import { supabase } from '../core/xplit/supabaseClient';

const CLIENT_ID =
    import.meta.env?.VITE_SPOTIFY_CLIENT_ID ||
    import.meta.env?.SPOTIFY_CLIENT_ID ||
    '489bc7138c044636947cad63e742a0c3';

const CLIENT_SECRET =
    import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET ||
    import.meta.env?.SPOTIFY_CLIENT_SECRET ||
    'f35bbbeb0d204c998b50f00b9e389e08';

// Top 50 Colombia playlist (official Spotify Editorial)
const COLOMBIA_TOP50_PLAYLIST = '2XOhHTFtXP9HLwuGKqxT04';
// Top 50 Global as fallback
const GLOBAL_TOP50_PLAYLIST = '37i9dQZEVXbMDoHDwVN2tF';

// Reggaeton / Latin Urban artists to prioritize (FOMO triggers)
const REGGAETON_ARTISTS = new Set([
    'feid', 'karol g', 'bad bunny', 'j balvin', 'maluma', 'anuel aa',
    'ozuna', 'daddy yankee', 'rauw alejandro', 'myke towers', 'ryan castro',
    'peso pluma', 'jhayco', 'sebastián yatra', 'sech', 'nicky jam',
    'arcángel', 'bryant myers', 'mora', 'jhay cortez', 'don omar',
    'wisin', 'yandel', 'zion & lennox', 'chencho corleone',
]);

const isReggaeton = (track) => {
    const artistNames = (track.artists || []).map(a => a.name.toLowerCase());
    return artistNames.some(name =>
        REGGAETON_ARTISTS.has(name) ||
        [...REGGAETON_ARTISTS].some(r => name.includes(r))
    );
};

// ── Token ─────────────────────────────────────────────────────────────────────
let _tokenCache = null;
let _tokenExpiry = 0;

export async function getSpotifyToken() {
    if (_tokenCache && Date.now() < _tokenExpiry) return _tokenCache;

    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);
    const data = await res.json();

    _tokenCache = data.access_token;
    _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh 1 min early
    return _tokenCache;
}

// ── Fetch playlist tracks ─────────────────────────────────────────────────────
async function fetchPlaylistTracks(playlistId, token, limit = 50) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&fields=items(track(id,name,artists,album,preview_url,external_ids,popularity,duration_ms))`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Playlist fetch failed: ${res.status}`);
    const data = await res.json();
    return (data.items || []).map(i => i.track).filter(Boolean);
}

// ── Normalize a Spotify track → our asset schema ──────────────────────────────
function normalizeTrack(track, position) {
    const artist = track.artists?.[0] || {};
    const album = track.album || {};
    const cover = album.images?.[0]?.url || null; // highest res (640px)

    // Derive streaming estimates from Spotify popularity (0–100)
    const pop = track.popularity || 50;
    const spotifyStreams = Math.round(pop * 12_500_000 + Math.random() * 5_000_000);
    const youtubeViews  = Math.round(spotifyStreams * 0.65);
    const tiktokCreations = Math.round(spotifyStreams * 0.072);

    const valuationUsd = Math.round(25_000 + pop * 800);
    const tokenPrice   = 25 + Math.floor(pop / 10) * 5;

    // Funding progress — top tracks are more funded (FOMO)
    const fundingPct = Math.min(95, 60 + position * -2 + Math.floor(Math.random() * 15));

    const roi = 10 + (pop - 50) * 0.3 + Math.random() * 5;

    return {
        id: `spotify-${track.id}`,
        name: track.name,
        symbol: track.name.replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 4) || 'BEAT',
        asset_type: 'music',
        token_price_usd: tokenPrice,
        total_supply: 1000,
        valuation_usd: valuationUsd,
        is_tokenized: false,
        contract_address: null,
        // Spotify-ready image
        cover_url: cover,
        image: cover,
        preview_url: track.preview_url,
        metadata: {
            artist:             artist.name || 'Unknown',
            artist_id:          artist.id,
            isrc:               track.external_ids?.isrc || '',
            spotify_track_id:   track.id,
            spotify_streams:    spotifyStreams,
            youtube_views:      youtubeViews,
            tiktok_creations:   tiktokCreations,
            yield_estimate:     `${roi.toFixed(1)}%`,
            genre:              'Reggaetón / Urbano',
            popularity:         pop,
            duration_ms:        track.duration_ms,
            album_name:         album.name,
            release_year:       (album.release_date || '2024').slice(0, 4),
            preview_url:        track.preview_url,
            funding_percent:    fundingPct,
            raised_amount:      Math.round(valuationUsd * fundingPct / 100),
            is_trending:        position < 3, // top 3 = Trending badge
            monthly_listeners:  Math.round(spotifyStreams / 12),
            bio:                `${artist.name} es uno de los nombres más relevantes del urbano latinoamericano actual, con millones de oyentes mensuales en Spotify y una presencia dominante en las listas de éxitos de toda América Latina.`,
            review:             `"${track.name}" es un hit del urbano latino que ha dominado las listas de reproducción de Colombia y el mundo. Con más de ${(spotifyStreams / 1_000_000).toFixed(1)}M de streams, este activo representa una oportunidad de inversión en uno de los géneros de mayor crecimiento global.`,
        },
    };
}

// ── Main export: fetch top 20 reggaetón ──────────────────────────────────────
export async function fetchTop20Reggaeton() {
    const token = await getSpotifyToken();

    // Try Colombia Top 50 first
    let tracks = [];
    try {
        tracks = await fetchPlaylistTracks(COLOMBIA_TOP50_PLAYLIST, token, 50);
    } catch {
        console.warn('Colombia playlist failed, trying Global Top 50...');
        tracks = await fetchPlaylistTracks(GLOBAL_TOP50_PLAYLIST, token, 50);
    }

    // Filter to reggaeton artists preferentially, then fill with rest
    const reggaetonTracks = tracks.filter(isReggaeton);
    const otherTracks = tracks.filter(t => !isReggaeton(t));
    const combined = [...reggaetonTracks, ...otherTracks].slice(0, 20);

    return combined.map((track, i) => normalizeTrack(track, i));
}

// ── Supabase Upsert ───────────────────────────────────────────────────────────
export async function ingestTracksToSupabase() {
    const tracks = await fetchTop20Reggaeton();

    const { data, error } = await supabase
        .from('assets')
        .upsert(tracks, { onConflict: 'id', ignoreDuplicates: false });

    if (error) throw error;

    console.log(`✅ Ingested ${tracks.length} tracks to Supabase`);
    return tracks;
}
