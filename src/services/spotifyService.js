/**
 * BE4T — Spotify Service (4-Artist Catalog Edition)
 *
 * REGLA DE ORO: Si una canción no tiene preview_url, se descarta.
 * Solo se incluyen hits reales que se puedan escuchar.
 *
 * Artists: Feid, Danny Ocean, Karol G, Ryan Castro
 * Target:  5 tracks per artist → 20 total (100% with preview_url)
 *
 * Dev mode:  Vite proxy → /spotify-token  + /spotify-api
 * Prod mode: Vercel serverless  → /api/spotify
 */

const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID     || '489bc7138c044636947cad63e742a0c3';
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'f35bbbeb0d204c998b50f00b9e389e08';

// ── Dev token cache ──────────────────────────────────────────────────────────
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

// ── Unified search — works in dev (Vite proxy) and prod (Vercel fn) ──────────
async function searchTracks(query, limit = 50, market = 'CO') {
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

// ── REGLA DE ORO: Fetch N tracks that HAVE preview_url ────────────────────────
async function getArtistTracksWithPreview(artistName, count = 5) {
    const query = `artist:"${artistName}"`;
    const allTracks = await searchTracks(query, 50, 'CO');

    // Filter: must be the main artist AND have a non-null preview_url
    const withPreview = allTracks.filter(track => {
        const isMainArtist = track.artists?.some(
            a => a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                 artistName.toLowerCase().includes(a.name.toLowerCase())
        );
        return isMainArtist && track.preview_url;
    });

    console.log(`🎵 ${artistName}: ${withPreview.length} tracks con preview (de ${allTracks.length} totales)`);

    // If we still don't have enough, do a broader search
    if (withPreview.length < count) {
        console.warn(`⚠️  ${artistName}: solo ${withPreview.length}/${count} con preview en CO market. Intentando ES market…`);
        try {
            const altTracks = await searchTracks(query, 50, 'ES');
            const altWithPreview = altTracks.filter(track => {
                const isMainArtist = track.artists?.some(
                    a => a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                         artistName.toLowerCase().includes(a.name.toLowerCase())
                );
                // Avoid duplicates
                const alreadyHave = withPreview.some(t => t.id === track.id);
                return isMainArtist && track.preview_url && !alreadyHave;
            });
            withPreview.push(...altWithPreview);
            console.log(`🌍 ${artistName}: +${altWithPreview.length} adicionales desde ES market`);
        } catch (e) {
            console.warn(`[BE4T] Alt market search failed:`, e.message);
        }
    }

    return withPreview.slice(0, count);
}

// ── Artist catalog ───────────────────────────────────────────────────────────
const ARTISTS = [
    { name: 'Feid',        genre: 'reggaeton', accentColor: '#a78bfa', roiBase: 22.0 },
    { name: 'Danny Ocean', genre: 'latin_pop', accentColor: '#34d399', roiBase: 18.5 },
    { name: 'Karol G',     genre: 'reggaeton', accentColor: '#f472b6', roiBase: 20.5 },
    { name: 'Ryan Castro', genre: 'reggaeton', accentColor: '#fb923c', roiBase: 19.0 },
];

// ── Normalize Spotify track → SongCard schema ─────────────────────────────────
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

    // ✅ HIGH-RES cover from Spotify (640x640 preferred, fallback to 300x300)
    const coverUrl = track.album?.images?.[0]?.url   // 640x640
                  || track.album?.images?.[1]?.url   // 300x300
                  || null;                            // No Unsplash fallback — regla de oro

    const artistName = track.artists?.map(a => a.name).join(', ') || artist.name;

    const genreLabel = genre === 'reggaeton' ? 'Reggaetón / Urbano'
                     : genre === 'latin_pop'  ? 'Latin Pop'
                     : 'Urbano';

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
        // ✅ SPOTIFY-ONLY — no Unsplash, no stock images
        cover_url:        coverUrl,
        image:            coverUrl,
        // ✅ GUARANTEED non-null (filtered before calling this function)
        preview_url:      track.preview_url,
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

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Fetches top tracks per artist from Spotify.
 * REGLA DE ORO: ONLY returns tracks with preview_url !== null.
 * If an artist has fewer than 5 playable tracks, those slots are
 * simply omitted — no silent fallbacks with broken covers.
 */
export async function fetchDemoSongs20() {
    console.log('🎵 [BE4T] Buscando Top 5 Spotify tracks (con preview) — Feid, Danny Ocean, Karol G, Ryan Castro');

    const allSongs = [];
    let totalWithPreview = 0;

    for (const artist of ARTISTS) {
        try {
            const tracks = await getArtistTracksWithPreview(artist.name, 5);

            if (tracks.length === 0) {
                console.warn(`[BE4T] ⚠️  ${artist.name}: 0 tracks con preview — omitiendo del catálogo.`);
                continue;
            }

            const artistSongs = tracks.map((track, i) =>
                normalizeTrack(track, artist, allSongs.length + i)
            );

            totalWithPreview += artistSongs.length;
            allSongs.push(...artistSongs);

            console.log(`✅ ${artist.name}: ${artistSongs.length} tracks añadidos (todos con preview + cover Spotify)`);
        } catch (err) {
            console.error(`[BE4T] ❌ ${artist.name} falló completamente:`, err.message);
            // ✅ REGLA DE ORO: NO fallback sin preview — no se añade nada
        }
    }

    console.log(`\n🎉 Total: ${allSongs.length} songs | ${totalWithPreview}/${allSongs.length} con preview de 30s`);
    if (allSongs[0]) {
        console.log('🖼  Cover[0]:', allSongs[0].cover_url?.slice(0, 80) + '…');
        console.log('🎵 Preview[0]:', allSongs[0].preview_url?.slice(0, 80) + '…');
    }

    return allSongs;
}

// ── Legacy aliases (backwards compat) ────────────────────────────────────────
export const fetchTop20Reggaeton = fetchDemoSongs20;
export async function ingestTracksToSupabase() { return fetchDemoSongs20(); }
