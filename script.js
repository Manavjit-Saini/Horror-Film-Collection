document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('eras.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    // Fetch as raw text first and sanitize hidden control characters to prevent JSON parse errors
    const rawText = await res.text();
    const cleanText = rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
    const eras = JSON.parse(cleanText);
    
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

// Creates navigation buttons dynamically in .era-nav
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

// Handles selecting an era and fetching movie data
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
        let fetchUrl = '/api/movies?';
        if (item.id) {
          fetchUrl += `id=${item.id}`;
        } else {
          fetchUrl += `title=${encodeURIComponent(item.title)}&year=${item.year}`;
        }

        const res = await fetch(fetchUrl);
        const data = await res.json();
        
        // Skip empty or error payloads
        if (!data || data.success === false || !data.title) return null;
        return data;
      } catch (e) {
        console.error(`Failed to fetch ${item.title || item.id}:`, e);
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

// Renders the movies array into HTML cards
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
