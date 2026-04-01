/**
 * BE4T — Preview Service
 *
 * Fetches a fresh (never-expired) Deezer preview URL on demand.
 * In dev:  Vite proxy /deezer-api → api.deezer.com
 * In prod: Vercel serverless /api/deezer?id=<trackId>
 *
 * Caches results in memory so repeated plays don't refetch.
 */

const _cache = new Map(); // deezer_id → preview URL string

export async function fetchPreviewUrl(deezerId) {
    if (!deezerId) return null;
    const key = String(deezerId);
    if (_cache.has(key)) return _cache.get(key);

    try {
        const url = import.meta.env.DEV
            ? `/deezer-api/track/${deezerId}`
            : `/api/deezer?id=${deezerId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Deezer ${res.status}`);
        const data = await res.json();

        // In dev, /deezer-api returns full Deezer track object
        // In prod, /api/deezer returns { id, title, preview, cover }
        const preview = data.preview || null;
        if (preview) _cache.set(key, preview);
        return preview;
    } catch (err) {
        console.warn(`[PreviewService] Failed to fetch preview for deezer_id=${deezerId}:`, err.message);
        return null;
    }
}
