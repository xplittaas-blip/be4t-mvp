/**
 * Vercel Serverless — Deezer Track Preview Fetcher
 * GET /api/deezer?id=<deezerTrackId>
 *
 * Returns a fresh preview URL for the given Deezer track ID.
 * Used ONLY for audio preview on-demand (never for catalog metadata).
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id, q } = req.query;

    // Support both track ID lookup and search query
    const deezerUrl = id
        ? `https://api.deezer.com/track/${id}`
        : `https://api.deezer.com/search?q=${encodeURIComponent(q || '')}&limit=1`;

    try {
        const r = await fetch(deezerUrl, { headers: { 'User-Agent': 'BE4T/2.0' } });
        if (!r.ok) return res.status(r.status).json({ error: `Deezer ${r.status}` });
        const data = await r.json();

        // Normalize: single track vs search result
        const track = data.id ? data : data.data?.[0];
        if (!track) return res.status(404).json({ error: 'Track not found' });

        res.setHeader('Cache-Control', 's-maxage=1800'); // cache 30min
        return res.status(200).json({
            id: track.id,
            title: track.title,
            preview: track.preview,
            cover: track.album?.cover_xl || track.album?.cover_big,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
