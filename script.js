let activeMoviesList = [];
let isWatchlistView = false;

document.addEventListener('DOMContentLoaded', async () => {
  setupModalEvents();

  try {
    const res = await fetch('eras.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

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

// Creates navigation buttons dynamically in .era-nav with active states + Watchlist tab
function initNav(eras) {
  const navContainer = document.querySelector('.era-nav');
  if (!navContainer) return;

  navContainer.innerHTML = '';

  eras.forEach((era, index) => {
    const btn = document.createElement('button');
    btn.textContent = era.title;
    btn.setAttribute('data-era-id', era.id || index);

    btn.addEventListener('click', (e) => {
      isWatchlistView = false;
      selectEra(era);
      document.querySelectorAll('.era-nav button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });

    navContainer.appendChild(btn);
  });

  const watchlistBtn = document.createElement('button');
  watchlistBtn.textContent = '⭐ My Watchlist';
  watchlistBtn.style.backgroundColor = '#8b0000';
  watchlistBtn.addEventListener('click', (e) => {
    isWatchlistView = true;
    fetchWatchlist();
    document.querySelectorAll('.era-nav button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  });
  navContainer.appendChild(watchlistBtn);

  const firstBtn = navContainer.querySelector('button');
  if (firstBtn) firstBtn.classList.add('active');
}

// Handles selecting an era and fetching movie data
async function selectEra(era) {
  const container = document.getElementById('movie-container');
  if (!container) return;

  container.innerHTML = `
    <div class="era-header">
      <h2>${era.title}</h2>
      ${era.thematicFocus ? `<p><strong>Thematic Focus:</strong> ${era.thematicFocus}</p>` : ''}
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

// Fetches and displays the user's saved watchlist from MongoDB
async function fetchWatchlist() {
  const container = document.getElementById('movie-container');
  if (!container) return;

  container.innerHTML = `
    <div class="era-header">
      <h2>My Watchlist</h2>
      <p><strong>Saved Films:</strong> Movies you have added to your personal collection.</p>
    </div>
    <div class="grid"><p>Loading watchlist...</p></div>
  `;

  try {
    const res = await fetch('/api/watchlist');
    if (!res.ok) throw new Error('Failed to fetch watchlist');

    const movies = await res.json();
    renderMovies(movies);
  } catch (err) {
    console.error('Error loading watchlist:', err);
    const grid = container.querySelector('.grid');
    if (grid) grid.innerHTML = '<p>Error loading watchlist data.</p>';
  }
}

// Renders the movies array into HTML cards
function renderMovies(movies) {
  activeMoviesList = movies;
  const grid = document.querySelector('#movie-container .grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = '<p>No films found.</p>';
    return;
  }

  grid.innerHTML = movies.map((movie, index) => {
    const posterPathVal = movie.poster_path || movie.posterPath;
    const posterUrl = posterPathVal
      ? `https://image.tmdb.org/t/p/w500${posterPathVal}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    const releaseDateVal = movie.release_date || movie.releaseDate;
    const year = releaseDateVal ? releaseDateVal.split('-')[0] : 'N/A';
    const userRatingBadge = movie.userRating
      ? `<p class="user-rating-badge">Your Rating: ${'★'.repeat(movie.userRating)}${'☆'.repeat(5 - movie.userRating)}</p>`
      : '';

    return `
      <div class="movie-card" data-index="${index}" style="cursor: pointer;">
        <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>Released: ${year}</p>
          ${userRatingBadge}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = card.getAttribute('data-index');
      openMovieModal(activeMoviesList[idx]);
    });
  });
}

function renderStarRatingHtml(currentRating) {
  const starsHtml = [1, 2, 3, 4, 5].map(star => {
    const filled = Number(currentRating) >= star;
    return `
      <button
        type="button"
        class="star-rating-btn"
        data-star="${star}"
        aria-label="Rate ${star} out of 5 stars"
        style="background: none; border: none; cursor: pointer; font-size: 1.35rem; padding: 0 0.1rem; color: ${filled ? '#f5b942' : '#556070'}; line-height: 1;"
      >
        ${filled ? '★' : '☆'}
      </button>
    `;
  }).join('');

  const clearBtnHtml = currentRating
    ? `<button type="button" id="clear-star-rating-btn" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.78rem; cursor: pointer; margin-left: 0.35rem;">Clear</button>`
    : '';

  return `
    <div id="star-rating-widget" style="display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
      <span style="font-size: 0.88rem; color: #cbd5e1; margin-right: 0.25rem;"><strong>Rating:</strong></span>
      <div style="display: inline-flex; align-items: center;">${starsHtml}</div>
      ${clearBtnHtml}
    </div>
  `;
}

function renderWatchlistBtnHtml(isSaved) {
  if (!isSaved) {
    return `
      <button
        id="watchlist-toggle-btn"
        type="button"
        class="watchlist-action-btn"
        style="background-color: #b91c1c; color: #ffffff; cursor: pointer;"
      >
        ⭐ Add to Watchlist
      </button>
    `;
  }

  return `
    <button
      id="watchlist-toggle-btn"
      type="button"
      class="watchlist-action-btn added"
      title="Click to remove from watchlist"
      style="cursor: pointer;"
    >
      ✓ In Your Watchlist
    </button>
  `;
}

// Opens the detail modal overlay
async function openMovieModal(movie) {
  const modal = document.getElementById('movie-modal');
  const modalBody = document.getElementById('modal-body');
  if (!modal || !modalBody || !movie) return;

  let fullMovie = { ...movie };
  const movieId = fullMovie.id || fullMovie.tmdbId;
  const releaseDateVal = fullMovie.release_date || fullMovie.releaseDate;
  const year = releaseDateVal ? releaseDateVal.split('-')[0] : '';

  // Hydrate missing TMDB fields (overview, credits, vote_average, runtime) for watchlist items
  if (!fullMovie.overview || !fullMovie.credits) {
    try {
      const query = movieId
        ? `id=${encodeURIComponent(movieId)}`
        : `title=${encodeURIComponent(fullMovie.title)}&year=${encodeURIComponent(year)}`;
      const detailRes = await fetch(`/api/movies?${query}`);
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        fullMovie = {
          ...detailData,
          ...fullMovie,
          overview: fullMovie.overview || detailData.overview,
          vote_average: fullMovie.vote_average ?? detailData.vote_average,
          runtime: fullMovie.runtime ?? detailData.runtime,
          credits: fullMovie.credits || detailData.credits
        };
      }
    } catch (err) {
      console.error('Error hydrating movie details:', err);
    }
  }

  const posterPathVal = fullMovie.poster_path || fullMovie.posterPath;
  const posterUrl = posterPathVal
    ? `https://image.tmdb.org/t/p/w500${posterPathVal}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const finalReleaseDate = fullMovie.release_date || fullMovie.releaseDate;
  const displayYear = finalReleaseDate ? finalReleaseDate.split('-')[0] : 'N/A';
  const rating = fullMovie.vote_average ? `${fullMovie.vote_average.toFixed(1)} / 10` : 'N/A';
  const overview = fullMovie.overview || 'No overview available for this title.';

  let runtimeFormatted = '';
  if (fullMovie.runtime) {
    const hours = Math.floor(fullMovie.runtime / 60);
    const mins = fullMovie.runtime % 60;
    runtimeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  let directorName = 'N/A';
  if (fullMovie.credits && fullMovie.credits.crew) {
    const director = fullMovie.credits.crew.find(person => person.job === 'Director');
    if (director) directorName = director.name;
  }

  let castNames = 'N/A';
  if (fullMovie.credits && fullMovie.credits.cast) {
    castNames = fullMovie.credits.cast.slice(0, 3).map(actor => actor.name).join(', ');
  }

  const resolvedId = Number(fullMovie.id || fullMovie.tmdbId);

  let savedRecord = null;
  try {
    const res = await fetch('/api/watchlist');
    if (res.ok) {
      const savedList = await res.json();
      savedRecord = savedList.find(m => Number(m.tmdbId) === resolvedId) || null;
    }
  } catch (err) {
    console.error('Error checking watchlist status:', err);
  }

  let isAlreadySaved = Boolean(savedRecord);
  let currentRating = savedRecord?.userRating ?? fullMovie.userRating ?? null;

  modalBody.innerHTML = `
    <img class="modal-poster" src="${posterUrl}" alt="${fullMovie.title}">
    <div class="modal-details">
      <h2>${fullMovie.title} (${displayYear})</h2>

      <div class="modal-meta-row">
        <span class="modal-rating">★ ${rating}</span>
        ${runtimeFormatted ? `<span>• ${runtimeFormatted}</span>` : ''}
        <span>• Horror</span>
      </div>

      <p class="modal-overview">${overview}</p>

      <div class="modal-crew-info">
        <p><strong>Director:</strong> ${directorName}</p>
        <p><strong>Cast:</strong> ${castNames}</p>
      </div>

      <div id="modal-user-actions"></div>
    </div>
  `;

  modal.classList.remove('hidden');

  function renderAndBindActions() {
    const actionsBox = document.getElementById('modal-user-actions');
    if (!actionsBox) return;

    actionsBox.innerHTML = `
      ${isAlreadySaved ? renderStarRatingHtml(currentRating) : ''}
      ${renderWatchlistBtnHtml(isAlreadySaved)}
    `;

    const toggleBtn = document.getElementById('watchlist-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', async () => {
        toggleBtn.disabled = true;

        if (!isAlreadySaved) {
          toggleBtn.classList.add('clicked');
          try {
            const response = await fetch('/api/watchlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tmdbId: resolvedId,
                title: fullMovie.title,
                posterPath: posterPathVal,
                releaseDate: finalReleaseDate,
                overview: fullMovie.overview || ''
              })
            });

            if (response.ok) {
              const data = await response.json();
              isAlreadySaved = true;
              currentRating = data.movie?.userRating ?? null;
              renderAndBindActions();
              if (isWatchlistView) fetchWatchlist();
            } else {
              alert('Failed to save movie.');
              toggleBtn.classList.remove('clicked');
              toggleBtn.disabled = false;
            }
          } catch (err) {
            console.error('Error saving movie:', err);
            toggleBtn.classList.remove('clicked');
            toggleBtn.disabled = false;
          }
        } else {
          try {
            const res = await fetch(`/api/watchlist?tmdbId=${encodeURIComponent(resolvedId)}`, {
              method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to remove movie');

            isAlreadySaved = false;
            currentRating = null;
            fullMovie.userRating = null;
            renderAndBindActions();
            if (isWatchlistView) fetchWatchlist();
          } catch (err) {
            console.error('Error removing movie:', err);
            toggleBtn.disabled = false;
            alert('Failed to remove movie from watchlist.');
          }
        }
      });
    }

    async function saveStarRating(newStar) {
      try {
        const res = await fetch('/api/watchlist', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tmdbId: resolvedId,
            userRating: newStar
          })
        });

        if (!res.ok) throw new Error('Failed to update star rating');
        const data = await res.json();
        currentRating = data.movie?.userRating ?? null;
        fullMovie.userRating = currentRating;
        renderAndBindActions();
        if (isWatchlistView) fetchWatchlist();
      } catch (err) {
        console.error('Error saving star rating:', err);
      }
    }

    document.querySelectorAll('.star-rating-btn').forEach(starBtn => {
      starBtn.addEventListener('click', async () => {
        const clickedStar = Number(starBtn.getAttribute('data-star'));
        // Clicking the already-selected star clears it; otherwise sets 1-5
        const nextRating = currentRating === clickedStar ? null : clickedStar;
        await saveStarRating(nextRating);
      });
    });

    const clearStarBtn = document.getElementById('clear-star-rating-btn');
    if (clearStarBtn) {
      clearStarBtn.addEventListener('click', async () => {
        await saveStarRating(null);
      });
    }
  }

  renderAndBindActions();
}

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