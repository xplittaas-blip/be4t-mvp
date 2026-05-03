/**
 * Vercel Serverless — Spotify Track Stats
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/spotify-track?id=<spotifyTrackId>
 *   → { popularity, name, artist, followers, external_url }
 *
 * GET /api/spotify-track?q=BICHOTA+KAROL+G
 *   → { popularity, name, artist, followers, external_url }
 *
 * Why serverless?  Spotify Client Credentials token must never be exposed to
 * the browser.  This function handles auth server-side and returns only the
 * fields the frontend needs.
 *
 * Cache: s-maxage=21600 (6 h) at Vercel Edge CDN → protects API quota.
 * With 20 songs + 12 h browser cache, max real API calls ≈ 20 req / day.
 */

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Warm-instance token cache (survives Lambda re-use within the same pod)
let _token = null;
let _tokenExpiry = 0;

async function getSpotifyToken() {
    if (_token && Date.now() < _tokenExpiry) return _token;
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set');
    }

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Spotify auth failed ${res.status}: ${text}`);
    }

    const { access_token, expires_in } = await res.json();
    _token = access_token;
    _tokenExpiry = Date.now() + (expires_in - 60) * 1000;
    return _token;
}

/**
 * Extract the fields we care about from a Spotify track object.
 */
function normalizeTrack(track) {
    return {
        spotify_id:   track.id,
        name:         track.name,
        artist:       track.artists?.[0]?.name ?? 'Unknown',
        popularity:   track.popularity ?? 0,        // 0-100 — real, updated daily
        followers:    track.artists?.[0]?.followers?.total ?? null,
        external_url: track.external_urls?.spotify ?? null,
        album_image:  track.album?.images?.[0]?.url ?? null,
    };
}

export default async function handler(req, res) {
    // CORS — allow browser calls from any origin (data is not sensitive)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id, q, market = 'CO' } = req.query;

    if (!id && !q) {
        return res.status(400).json({ error: 'Provide ?id=<spotifyId> or ?q=<search+query>' });
    }

    try {
        const token = await getSpotifyToken();

        let track = null;

        if (id) {
            // ── Direct lookup by Spotify track ID (fastest path) ────────────
            const r = await fetch(
                `https://api.spotify.com/v1/tracks/${id}?market=${market}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (r.ok) {
                track = await r.json();
            }
        }

        if (!track && q) {
            // ── Fallback: search by name + artist ───────────────────────────
            const r = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1&market=${market}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (r.ok) {
                const data = await r.json();
                track = data.tracks?.items?.[0] ?? null;
            }
        }

        if (!track) {
            return res.status(404).json({ error: 'Track not found on Spotify' });
        }

        // Cache 6h at Vercel Edge CDN (browser gets 30 min stale-while-revalidate)
        res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=1800');
        return res.status(200).json(normalizeTrack(track));

    } catch (err) {
        console.error('[/api/spotify-track] Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
