export default async function handler(req, res) {
  const { title, year, id } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    let url;
    
    // If an ID is provided, fetch directly from TMDB's movie details endpoint (100% accurate)
    if (id) {
      url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
    } 
    // Otherwise, use title search as fallback
    else if (title) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
      if (year) url += `&primary_release_year=${year}`;
    } else {
      return res.status(400).json({ error: 'Missing query parameters' });
    }

    const response = await fetch(url);
    const data = await response.json();

    // Format ID lookup to match the array structure expected by your frontend script
    if (id) {
      return res.status(200).json({ results: [data] });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
