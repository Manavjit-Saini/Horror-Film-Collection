export default async function handler(req, res) {
  const { id, title, year } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // 1. Direct Lookup by Exact TMDB ID (100% accurate, no search guessing)
    if (id) {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
      const data = await response.json();
      if (data && data.id) return res.status(200).json(data);
    }

    // 2. Fallback Search by Title + Year
    if (title) {
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
      if (year) searchUrl += `&primary_release_year=${year}`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Look for exact title match first
        const exactMatch = data.results.find(m => 
          m.title.toLowerCase() === title.toLowerCase()
        ) || data.results[0];

        return res.status(200).json(exactMatch);
      }
    }

    return res.status(404).json({ error: 'Movie not found' });
  } catch (error) {
    console.error('TMDB API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch movie data' });
  }
}
