/**
 * Vercel Serverless Function — Deezer API Proxy
 * Route: GET /api/deezer?q=...&limit=...
 *
 * Proxies Deezer search requests server-side to avoid browser CORS restrictions.
 * Returns real album art URLs + 30-second MP3 preview URLs.
 */
export const config = {
    runtime: 'nodejs18.x',
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q = '', limit = '1' } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Missing query parameter: q' });
    }

    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${limit}`;

    try {
        const response = await fetch(deezerUrl, {
            headers: { 'User-Agent': 'BE4T-Platform/2.0' },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `Deezer returned ${response.status}` });
        }

        const data = await response.json();
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(data);
    } catch (err) {
        console.error('[/api/deezer] Error:', err.message);
        return res.status(500).json({ error: 'Deezer API unreachable', message: err.message });
    }
}
