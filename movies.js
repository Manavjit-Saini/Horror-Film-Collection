import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!TMDB_API_KEY) {
    return res.status(500).json({ success: false, error: 'TMDB API key is missing in environment variables' });
  }

  try {
    const { id, title, year } = req.query;
    let tmdbUrl = '';

    // Determine if the key is a long Bearer token or a short v3 API key
    const isBearer = TMDB_API_KEY.length > 50; 
    const fetchOptions = isBearer ? {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
      }
    } : {};

    if (id) {
      tmdbUrl = isBearer 
        ? `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits`
        : `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    } else if (title) {
      let searchUrl = isBearer
        ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}`
        : `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;

      if (year) searchUrl += `&primary_release_year=${year}`;

      const searchRes = await fetch(searchUrl, fetchOptions);
      const searchData = await searchRes.json();

      if (!searchData.results || searchData.results.length === 0) {
        return res.status(404).json({ success: false, error: 'Movie not found', queryReceived: { title, year } });
      }

      const movieId = searchData.results[0].id;
      tmdbUrl = isBearer
        ? `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`
        : `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    } else {
      return res.status(400).json({ error: 'Movie ID or title is required' });
    }

    const response = await fetch(tmdbUrl, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.status_message || 'TMDB Error' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Movies API error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}