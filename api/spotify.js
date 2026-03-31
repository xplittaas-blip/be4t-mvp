/**
 * Vercel Serverless Function — Spotify API Proxy
 * Route: GET /api/spotify?q=<query>&limit=<n>
 *
 * Handles Client Credentials auth + track search server-side.
 * No CORS issues. Token never exposed to the browser.
 */

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID     || '489bc7138c044636947cad63e742a0c3';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'f35bbbeb0d204c998b50f00b9e389e08';

// In-memory token cache (survives within the same Lambda warm instance)
let _token = null;
let _tokenExpiry = 0;

async function getToken() {
    if (_token && Date.now() < _tokenExpiry) return _token;

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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q = '', limit = '1', market = 'CO' } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing ?q= parameter' });

    try {
        const token = await getToken();

        const searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}&market=${market}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!searchRes.ok) {
            return res.status(searchRes.status).json({ error: `Spotify search failed: ${searchRes.status}` });
        }

        const data = await searchRes.json();
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(data);
    } catch (err) {
        console.error('[/api/spotify] Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
