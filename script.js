// Load the 6 narrative eras on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('./eras.json');
    const eras = await response.json();
    renderEraButtons(eras);
    
    // Default: Load the first era automatically
    if (eras.length > 0) {
      selectEra(eras[0]);
    }
  } catch (error) {
    console.error('Failed to load eras:', error);
  }
});

// Render buttons/cards for each era
function renderEraButtons(eras) {
  const container = document.getElementById('movie-container'); // or your era container
  if (!container) return;

  // Render era selection UI
  const eraNav = document.createElement('nav');
  eraNav.className = 'era-nav';

  eras.forEach(era => {
    const btn = document.createElement('button');
    btn.innerText = era.title;
    btn.onclick = () => selectEra(era);
    eraNav.appendChild(btn);
  });

  document.body.insertBefore(eraNav, container);
}

// Fetch corresponding movies from TMDB via serverless proxy
async function selectEra(era) {
  const container = document.getElementById('movie-container');
  container.innerHTML = `<h2>${era.title} (${era.startYear} - ${era.endYear})</h2><p>${era.culturalContext}</p><div class="grid">Loading movies...</div>`;

  try {
    const res = await fetch(`/api/movies?startYear=${era.startYear}&endYear=${era.endYear}`);
    const data = await res.json();
    
    renderMovies(data.results || []);
  } catch (err) {
    console.error(err);
    container.querySelector('.grid').innerHTML = '<p>Error loading films for this era.</p>';
  }
}

// Display the movie cards on screen
function renderMovies(movies) {
  const grid = document.querySelector('.grid');
  if (!grid) return;

  grid.innerHTML = movies.map(movie => {
    const poster = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    return `
      <div class="movie-card">
        <img src="${poster}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <p>Released: ${movie.release_date || 'N/A'}</p>
      </div>
    `;
  }).join('');
}
