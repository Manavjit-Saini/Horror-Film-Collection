export default async function handler(req, res) {
  const { id, title, year } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB_API_KEY is not configured on Vercel" });
  }

  try {
    let url;
    if (id) {
      url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
    } else if (title) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
      if (year) url += `&primary_release_year=${year}`;
    } else {
      return res.status(400).json({ error: 'Missing query parameters' });
    }

    const response = await fetch(url);
    const data = await response.json();

    // Standardize: If searched by title, extract first result; if searched by ID, return object
    if (title && data.results) {
      return res.status(200).json(data.results[0] || null);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
}
