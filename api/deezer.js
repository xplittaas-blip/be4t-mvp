/**
 * Vercel Serverless Function — Deezer API Proxy
 * Route: /api/deezer?q=...&limit=...
 *
 * Forwards requests to api.deezer.com without CORS restrictions.
 * This replaces the Vite dev proxy for production deployments.
 */
export default async function handler(req, res) {
    // CORS headers — allow any origin for the demo
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Build Deezer URL from query params
    const params = new URLSearchParams(req.query);
    const deezerUrl = `https://api.deezer.com/search?${params.toString()}`;

    try {
        const response = await fetch(deezerUrl, {
            headers: {
                'User-Agent': 'BE4T-Platform/1.0',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `Deezer returned ${response.status}` });
        }

        const data = await response.json();
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(data);
    } catch (err) {
        console.error('Deezer proxy error:', err.message);
        return res.status(500).json({ error: 'Deezer API unreachable', message: err.message });
    }
}
