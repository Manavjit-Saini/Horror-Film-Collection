export default async function handler(req, res) {
  const { title, year } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  try {
    if (title) {
      const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&primary_release_year=${year || ''}`;
      const response = await fetch(searchUrl);
      const data = await response.json();

      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json(data);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ results: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
