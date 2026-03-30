import { getMarketplaceData } from './spotify';

const YT_CACHE_KEY = 'xplit_youtube_cache';
const YT_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

export const getYoutubeTraction = async (songId) => {
    try {
        // In a real scenario with API keys:
        // 1. Check local storage for YT_CACHE_KEY
        // 2. Fetch from https://www.googleapis.com/youtube/v3/search
        // 3. Cache the result for 24h

        // For this MVP, we use the pre-enriched fallback data 
        // to prevent quota exhaustion and guarantee data quality.
        const allData = await getMarketplaceData();
        const songRecord = allData.find(s => s.id === songId);

        if (songRecord && songRecord.youtube_views) {
            return {
                videoId: songRecord.youtube_video_id,
                url: songRecord.youtube_url,
                title: songRecord.youtube_title,
                thumbnail: songRecord.youtube_thumbnail,
                views: songRecord.youtube_views,
                likes: songRecord.youtube_likes,
                comments: songRecord.youtube_comments,
                publishedAt: songRecord.youtube_published_at,
                duration: songRecord.youtube_duration,
                channelId: songRecord.youtube_channel_id,
                channelName: songRecord.youtube_channel_name,
                channelSubscribers: songRecord.youtube_channel_subscribers,
                isOfficial: songRecord.is_official_video
            };
        }
        return null; // Graceful fallback if no YouTube data exists for this song
    } catch (error) {
        console.error("Error retrieving YouTube traction data:", error);
        return null;
    }
};

// Formatting helper
export const formatViews = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};
