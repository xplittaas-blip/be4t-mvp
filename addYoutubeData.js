import fs from 'fs';

const FALLBACK_FILE_PATH = 'src/data/fallbackSongs.json';

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to generate realistic YouTube data based on Spotify streams
const generateYoutubeData = (song) => {
    // Determine if it has an official video (80% chance for major artists)
    const hasOfficialVideo = Math.random() > 0.2;

    // YouTube views are typically higher or lower depending on the market, let's say 0.5x to 2x of Spotify streams
    const multiplier = (Math.random() * 1.5) + 0.5;
    const views = Math.floor(song.streams_estimate * multiplier);

    // Likes are usually 1-5% of views
    const likeRatio = (Math.random() * 0.04) + 0.01;
    const likes = Math.floor(views * likeRatio);

    // Comments are usually 0.1-0.5% of views
    const commentRatio = (Math.random() * 0.004) + 0.001;
    const comments = Math.floor(views * commentRatio);

    // Subscribers base
    const subscribers = random(100000, 15000000);

    // Random date in the last 2 years
    const daysAgo = random(10, 700);
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
        youtube_video_id: hasOfficialVideo ? `simulated_${song.id}` : null,
        youtube_url: hasOfficialVideo ? `https://youtube.com/watch?v=simulated_${song.id}` : null,
        youtube_title: `${song.artist} - ${song.title} (Official Video)`,
        youtube_thumbnail: song.cover_image, // Reusing cover image as thumbnail for MVP
        youtube_views: views,
        youtube_likes: likes,
        youtube_comments: comments,
        youtube_published_at: publishedAt,
        youtube_duration: `PT${random(2, 4)}M${random(10, 59)}S`,
        youtube_channel_id: `channel_${song.artist_id}`,
        youtube_channel_name: `${song.artist} Oficial`,
        youtube_channel_subscribers: subscribers,
        is_official_video: hasOfficialVideo
    };
};

async function run() {
    try {
        const rawData = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
        const songs = JSON.parse(rawData);

        const enrichedSongs = songs.map(song => {
            const ytData = generateYoutubeData(song);
            return {
                ...song,
                ...ytData
            };
        });

        fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(enrichedSongs, null, 2));
        console.log(`Successfully enriched ${enrichedSongs.length} songs with YouTube data.`);
    } catch (e) {
        console.error("Error updating JSON:", e);
    }
}

run();
