export default async function handler(req, res) {
  const { startYear = '1930', endYear = '2026' } = req.query;

  const startDate = `${startYear}-01-01`;
  const endDate = `${endYear}-12-31`;
  const apiKey = process.env.TMDB_API_KEY;

  const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=popularity.desc&page=1`;

  try {
    const response = await fetch(tmdbUrl);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch movies from TMDB' });
  }
}
