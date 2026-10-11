// Run as soon as the HTML page finishes loading
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Fetch your JSON narrative file from the root directory
    const response = await fetch('./eras.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch eras.json (Status: ${response.status})`);
    }

    const eras = await response.json();

    // 2. Build the top navigation buttons for each era
    renderEraButtons(eras);

    // 3. Automatically load and display the first era on startup
    if (eras.length > 0) {
      selectEra(eras[0]);
    }
  } catch (error) {
    console.error('Error loading initial era data:', error);
    const container = document.getElementById('movie-container');
    if (container) {
      container.innerHTML = '<p class="error">Failed to load eras. Please check that eras.json exists in your project root.</p>';
    }
  }
});

// Render navigation buttons dynamically
function renderEraButtons(eras) {
  let eraNav = document.querySelector('.era-nav');

  // Create <nav class="era-nav"> if it doesn't already exist in HTML
  if (!eraNav) {
    eraNav = document.createElement('nav');
    eraNav.className = 'era-nav';
    const container = document.getElementById('movie-container');
    document.body.insertBefore(eraNav, container);
  }

  // Clear existing buttons
  eraNav.innerHTML = '';

  // Create a button for each era in eras.json
  eras.forEach(era => {
    const btn = document.createElement('button');
    btn.innerText = era.title;
    btn.onclick = () => selectEra(era);
    eraNav.appendChild(btn);
  });
}

// Display selected era details and fetch corresponding films
async function selectEra(era) {
  const container = document.getElementById('movie-container');
  if (!container) return;

  // 1. Render era title, thematic focus, and cultural context
  container.innerHTML = `
    <div class="era-header">
      <h2>${era.title} (${era.startYear} - ${era.endYear})</h2>
      <p><strong>Thematic Focus:</strong> ${era.thematicFocus}</p>
      <p><strong>Cultural Context:</strong> ${era.culturalContext}</p>
    </div>
    <div class="grid"><p class="loading">Fetching films from TMDB...</p></div>
  `;

  try {
    // 2. Build the API query URL based on featured IDs or date range
    let url = `/api/movies?startYear=${era.startYear}&endYear=${era.endYear}`;
    if (era.featuredMovieIds && era.featuredMovieIds.length > 0) {
      url = `/api/movies?ids=${era.featuredMovieIds.join(',')}`;
    }

    // 3. Fetch movies via Vercel serverless proxy
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Proxy error: ${res.status}`);
    }

    const data = await res.json();
    
    // 4. Render movie cards into the grid
    renderMovies(data.results || []);
  } catch (err) {
    console.error('Error fetching era movies:', err);
    const grid = container.querySelector('.grid');
    if (grid) {
      grid.innerHTML = '<p class="error">Error loading films for this era. Please verify your TMDB_API_KEY environment variable on Vercel.</p>';
    }
  }
}

// Render movie cards grid HTML
function renderMovies(movies) {
  const grid = document.querySelector('.grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = '<p>No movies found for this era.</p>';
    return;
  }

  grid.innerHTML = movies
    .map(movie => {
      // TMDB poster image path or fallback placeholder
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

      // Format release date year if present
      const releaseYear = movie.release_date
        ? movie.release_date.split('-')[0]
        : 'N/A';

      return `
        <div class="movie-card">
          <img src="${poster}" alt="${movie.title}" loading="lazy" />
          <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>Released: ${releaseYear}</p>
          </div>
        </div>
      `;
    })
    .join('');
}
