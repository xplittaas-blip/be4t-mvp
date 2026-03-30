export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const trackId = req.query.track_id;
  if (!trackId) {
    return res.status(400).json({ error: 'track_id is required' });
  }

  try {
    // Since late 2024, Spotify requires an active Premium subscription attached to the Developer Account to use the standard API.
    // To bypass this and get the absolute best widget and data, we use the public Spotify oEmbed endpoint!
    const oEmbedUrl = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`;
    const spotifyResponse = await fetch(oEmbedUrl);

    if (!spotifyResponse.ok) {
      console.error("Spotify oEmbed Error", spotifyResponse.status);
      return res.status(spotifyResponse.status).json({ error: 'Failed to fetch from Spotify' });
    }

    const data = await spotifyResponse.json();

    // Extract the title and potentially the artist if it's in the title (usually oEmbed title is just the track name)
    // But the HTML string has the full iframe player which is what we really want!
    return res.status(200).json({
      title: data.title,
      image: data.thumbnail_url,
      html: data.html, // This is the official Spotify Embed Player!
      provider: data.provider_name
    });

  } catch (error) {
    console.error('Spotify API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch track data' });
  }
}
