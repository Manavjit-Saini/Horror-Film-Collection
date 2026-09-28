async function fetchHorrorMovies() {
  const url = '/api/movies';

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    // Get the HTML element where movies will display
    const container = document.getElementById('movie-container');
    if (!container) return;
    container.innerHTML = '';

    // Loop through movies and display them
    data.results.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';

      card.innerHTML = `
        <img src="${movie.primaryImage || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.titleText?.text || 'Movie Poster'}" />
        <h3>${movie.titleText?.text || 'Untitled'}</h3>
        <p>${movie.releaseYear?.year || 'N/A'}</p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching horror movies:', error);
  }
}

fetchHorrorMovies();
