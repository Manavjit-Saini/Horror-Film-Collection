export default async function handler(req, res) {
  const { title } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!title) {
    return res.status(400).json({ error: 'Title parameter is required' });
  }

  try {
    // Search TMDB by title without restrictive year filtering
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('TMDB API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
