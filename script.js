document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('eras.json');
    const eras = await res.json();
    
    initNav(eras);
    
    // Automatically load the first era on startup so the page isn't blank
    if (eras.length > 0) {
      selectEra(eras[0]);
    }
  } catch (err) {
    console.error('Failed to load eras.json:', err);
    document.getElementById('movie-container').innerHTML = '<p>Error loading archive data.</p>';
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
        const res = await fetch(`/api/movies?id=${item.id}`);
        const data = await res.json();
        if (data.success === false || data.status_code) return null;
        return data;
      } catch (e) {
        console.error(`Failed to fetch ID ${item.id}:`, e);
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
