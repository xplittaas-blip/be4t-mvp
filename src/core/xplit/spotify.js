import fallbackData from '../../data/fallbackSongs.json';

const CACHE_KEY = 'xplit_marketplace_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getMarketplaceData = async () => {
    try {
        // 1. Check LocalStorage Cache
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
            const cachedObj = JSON.parse(cachedStr);
            const now = new Date().getTime();
            if (now - cachedObj.timestamp < CACHE_EXPIRY_MS) {
                console.log("Loaded marketplace data from cache.");
                return cachedObj.data;
            }
        }

        // 2. Try fetching from live unified API route (optional future enhancement)
        // const response = await fetch('/api/spotify-marketplace');
        // if (response.ok) {
        //     const data = await response.json();
        //     localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: new Date().getTime(), data }));
        //     return data;
        // }
        // throw new Error("Live API failed or not active");

        // 3. Fallback to Local High-Quality JSON Matrix (Current Implementation for MVP)
        console.log("Using guaranteed local fallback matrix for 60-track catalog.");
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: new Date().getTime(), data: fallbackData }));
        return fallbackData;

    } catch (error) {
        console.error("Error retrieving marketplace data:", error);
        // Absolute fallback if everything fails
        return fallbackData;
    }
};

// Helper function to extract unique artists for the filter system
export const getUniqueArtists = (songs) => {
    const artistNames = Array.from(new Set(songs.map(s => s.artist)));
    return artistNames.sort();
};

// Helper function to extract unique artists with their avatars for stories
export const getArtistProfiles = (songs) => {
    const artistMap = new Map();
    songs.forEach(song => {
        if (!artistMap.has(song.artist)) {
            artistMap.set(song.artist, {
                name: song.artist,
                image: song.cover_image
            });
        }
    });
    // Sort alphabetically
    return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};
