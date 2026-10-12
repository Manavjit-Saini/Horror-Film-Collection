// Active movie list stored in memory for modal lookups
let activeMoviesList = [];

document.addEventListener('DOMContentLoaded', async () => {
  setupModalEvents();

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
  activeMoviesList = movies; // Save reference for modal lookup
  const grid = document.querySelector('#movie-container .grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = '<p>No films found.</p>';
    return;
  }

  grid.innerHTML = movies.map((movie, index) => {
    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

    return `
      <div class="movie-card" data-index="${index}" style="cursor: pointer;">
        <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>Released: ${year}</p>
        </div>
      </div>
    `;
  }).join('');

  // Attach click events to open the detail modal for each card
  document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = card.getAttribute('data-index');
      openMovieModal(activeMoviesList[idx]);
    });
  });
}

// Opens the detail modal overlay for a selected movie
function openMovieModal(movie) {
  const modal = document.getElementById('movie-modal');
  const modalBody = document.getElementById('modal-body');
  if (!modal || !modalBody || !movie) return;

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  const rating = movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : 'N/A';
  const overview = movie.overview || 'No overview available for this title.';

  modalBody.innerHTML = `
    <img class="modal-poster" src="${posterUrl}" alt="${movie.title}">
    <div class="modal-details">
      <h2>${movie.title} (${year})</h2>
      <div class="modal-meta">Rating: ★ ${rating}</div>
      <p class="modal-overview">${overview}</p>
    </div>
  `;

  modal.classList.remove('hidden');
}

// Sets up close button and backdrop click listeners for the modal
function setupModalEvents() {
  const modal = document.getElementById('movie-modal');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }
}
