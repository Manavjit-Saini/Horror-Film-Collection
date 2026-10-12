export default async function handler(req, res) {
  const { title, year } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!title) {
    return res.status(400).json({ error: 'Title parameter is required' });
  }

  try {
    let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
    if (year) {
      searchUrl += `&primary_release_year=${year}`;
    }

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Find an exact title match (case-insensitive) from the results, fallback to first result if none exact
      const exactMatch = data.results.find(m => 
        m.title.toLowerCase() === title.toLowerCase()
      ) || data.results[0];

      return res.status(200).json(exactMatch);
    }

    return res.status(404).json({ error: 'Movie not found' });
  } catch (error) {
    console.error('TMDB API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
