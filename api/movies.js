export default async function handler(req, res) {
  const { id, title } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!id && !title) {
    return res.status(400).json({ error: 'ID or Title parameter is required' });
  }

  try {
    let apiUrl = '';
    if (id) {
      // Fetch directly by exact TMDB movie ID
      apiUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
    } else {
      // Fallback search by title
      apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('TMDB API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch movie data' });
  }
}
