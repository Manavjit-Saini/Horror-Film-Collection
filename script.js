document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('./eras.json');
    if (!response.ok) throw new Error('Failed to load eras.json');
    const eras = await response.json();

    renderEraButtons(eras);

    if (eras.length > 0) {
      selectEra(eras[0]);
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

function renderEraButtons(eras) {
  let eraNav = document.querySelector('.era-nav');
  if (!eraNav) {
    eraNav = document.createElement('nav');
    eraNav.className = 'era-nav';
    const container = document.getElementById('movie-container');
    document.body.insertBefore(eraNav, container);
  }

  eraNav.innerHTML = '';
  eras.forEach(era => {
    const btn = document.createElement('button');
    btn.innerText = era.title;
    btn.onclick = () => selectEra(era);
    eraNav.appendChild(btn);
  });
}

async function selectEra(era) {
  const container = document.getElementById('movie-container');
  if (!container) return;

  container.innerHTML = `
    <div class="era-header">
      <h2>${era.title}</h2>
      <p><strong>Thematic Focus:</strong> ${era.thematicFocus}</p>
      <p><strong>Cultural Context:</strong> ${era.culturalContext}</p>
    </div>
    <div class="grid"><p>Loading films...</p></div>
  `;

  try {
    const promises = era.featuredMovies.map(item =>
      fetch(`/api/movies?title=${encodeURIComponent(item.title)}&year=${item.year}`)
        .then(res => res.json())
        .then(data => (data.results && data.results[0] ? data.results[0] : null))
    );

    const movies = (await Promise.all(promises)).filter(m => m !== null);
    renderMovies(movies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    const grid = container.querySelector('.grid');
    if (grid) grid.innerHTML = '<p>Error loading movie data.</p>';
  }
}

function renderMovies(movies) {
  const grid = document.querySelector('.grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = '<p>No movies found.</p>';
    return;
  }

  grid.innerHTML = movies.map(movie => {
    const poster = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

    return `
      <div class="movie-card">
        <img src="${poster}" alt="${movie.title || 'Movie Poster'}" />
        <div class="movie-info">
          <h3>${movie.title || 'Untitled'}</h3>
          <p>Released: ${year}</p>
        </div>
      </div>
    `;
  }).join('');
}
