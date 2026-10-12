document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('eras.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const eras = await res.json();
    
    initNav(eras);
    if (eras.length > 0) selectEra(eras[0]);
  } catch (err) {
    console.error('Failed to load eras.json:', err);
    const container = document.getElementById('movie-container');
    if (container) {
      container.innerHTML = `<p style="color: red; text-align: center;">Error loading eras data: ${err.message}</p>`;
    }
  }
});

function initNav(eras) {
  const navContainer = document.querySelector('.era-nav');
  if (!navContainer) return;

  navContainer.innerHTML = '';
  eras.forEach((era) => {
    const btn = document.createElement('button');
    btn.textContent = era.title;
    btn.addEventListener('click', () => selectEra(era));
    navContainer.appendChild(btn);
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
    let allMovieItems = [];
    if (era.subgenres && era.subgenres.length > 0) {
      allMovieItems = era.subgenres.flatMap(sg => sg.movies || []);
    } else if (era.featuredMovies) {
      allMovieItems = era.featuredMovies;
    }

    const moviePromises = allMovieItems.map(async (item) => {
      try {
        const res = await fetch(`/api/movies?title=${encodeURIComponent(item.title)}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results[0]; // Take top search match
        }
        return null;
      } catch (e) {
        console.error(`Failed to fetch title ${item.title}:`, e);
        return null;
      }
    });

    const movies = (await Promise.all(moviePromises)).filter(Boolean);
    renderMovies(movies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    const grid = container.querySelector('.grid');
    if (grid) grid.innerHTML = '<p>Error loading movie data.</p>';
  }
}

function renderMovies(movies) {
  const grid = document.querySelector('#movie-container .grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = '<p>No films found.</p>';
    return;
  }

  grid.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>Released: ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
      </div>
    </div>
  `).join('');
}
