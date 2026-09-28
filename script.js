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

    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';

      const title = movie.title || 'Untitled Horror Movie';
      const year = movie.year || 'N/A';
      
      // Use full CDN URL or placeholder fallback
      const posterUrl = movie.poster && movie.poster.startsWith('http')
        ? movie.poster 
        : `https://via.placeholder.com/300x450/111/fff?text=${encodeURIComponent(title)}`;

      card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x450/111/fff?text=${encodeURIComponent(title)}'" />
        <h3>${title}</h3>
        <p>${year}</p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching horror movies:', error);
  }
}

fetchHorrorMovies();
