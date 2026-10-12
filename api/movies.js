export default async function handler(req, res) {
  const { id, title, year } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    let movieId = id;

    // If no ID is provided, search by title and year first to get the correct movie ID
    if (!movieId) {
      if (!title) {
        return res.status(400).json({ error: 'Title or ID parameter is required' });
      }

      const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.results && searchData.results.length > 0) {
        const matchedMovie = searchData.results.find(m => {
          if (!m.release_date) return false;
          const movieYear = m.release_date.split('-')[0];
          return year ? movieYear === year : true;
        }) || searchData.results[0];

        movieId = matchedMovie.id;
      } else {
        return res.status(404).json({ error: 'Movie not found' });
      }
    }

    // Fetch full movie details including runtime and credits (director & cast) using the ID
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`;
    const detailsRes = await fetch(detailsUrl);
    const movieData = await detailsRes.json();

    if (!movieData || movieData.success === false) {
      return res.status(404).json({ error: 'Movie details not found' });
    }

    return res.status(200).json(movieData);

  } catch (error) {
    console.error('TMDB API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch movie details' });
  }
}
