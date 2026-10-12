export default async function handler(req, res) {
  const { title, year } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!title) {
    return res.status(400).json({ error: 'Title parameter is required' });
  }

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Find a result that matches the release year if provided, otherwise take the first result
      const matchedMovie = data.results.find(m => {
        if (!m.release_date) return false;
        const movieYear = m.release_date.split('-')[0];
        return year ? movieYear === year : true;
      }) || data.results[0];

      return res.status(200).json(matchedMovie);
    }

    return res.status(404).json({ error: 'Movie not found' });
  } catch (error) {
    console.error('TMDB API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
