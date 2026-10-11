export default async function handler(req, res) {
  const { ids, startYear, endYear } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  try {
    // If specific movie IDs are provided in the query, fetch those specific films
    if (ids) {
      const idList = ids.split(',');
      const promises = idList.map(id =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`).then(r => r.json())
      );
      const results = await Promise.all(promises);

      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json({ results });
    }

    // Fallback search query
    const startDate = `${startYear || 1930}-01-01`;
    const endDate = `${endYear || 2026}-12-31`;
    const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=vote_count.desc&page=1`;

    const response = await fetch(tmdbUrl);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
