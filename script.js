async function fetchHorrorMovies() {
  const url = '/api/movies';

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('API Response:', data);

    const container = document.getElementById('movie-container');
    if (!container) return;
    container.innerHTML = '';

    const movies = data.results || [];

    for (const movie of movies) {
      const card = document.createElement('div');
      card.className = 'movie-card';

      const title = movie.title || 'Untitled Horror Movie';
      const year = movie.year || 'N/A';
      const imdbId = movie.external_ids?.imdb;

      // Primary fallback poster
      let posterUrl = `https://via.placeholder.com/300x450/111/fff?text=${encodeURIComponent(title)}`;

      // Fetch actual poster image using IMDb ID via OMDb public endpoint if available
      if (imdbId) {
        try {
          const imgRes = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=trilogy`);
          const imgData = await imgRes.json();
          if (imgData.Poster && imgData.Poster !== 'N/A') {
            posterUrl = imgData.Poster;
          }
        } catch (e) {
          console.error('Poster fetch failed for', title, e);
        }
      }

      card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x450/111/fff?text=${encodeURIComponent(title)}'" />
        <h3>${title}</h3>
        <p>${year}</p>
      `;

      container.appendChild(card);
    }
  } catch (error) {
    console.error('Error fetching horror movies:', error);
  }
}

fetchHorrorMovies();
