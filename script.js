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
    console.error('Error:', error);
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

  let categoriesHTML = '';

  era.subgenres.forEach(sub => {
    const cardsHTML = sub.movies.map(movie => {
      const poster = `https://image.tmdb.org/t/p/w500${movie.id}`;
      return `
        <div class="movie-card">
          <img src="https://image.tmdb.org/t/p/w500/${movie.id}.jpg" 
               onerror="this.src='https://via.placeholder.com/500x750/1f1f23/ffffff?text=${encodeURIComponent(movie.title)}'" 
               alt="${movie.title}" />
          <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>Released: ${movie.year}</p>
          </div>
        </div>
      `;
    }).join('');

    categoriesHTML += `
      <div class="subgenre-section">
        <h3 class="category-title">${sub.category}</h3>
        <div class="grid">${cardsHTML}</div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="era-header">
      <h2>${era.title}</h2>
      <p><strong>Thematic Focus:</strong> ${era.thematicFocus}</p>
      <p><strong>Cultural Context:</strong> ${era.culturalContext}</p>
    </div>
    <div class="subgenres-container">
      ${categoriesHTML}
    </div>
  `;

  // Fetch real TMDB poster paths asynchronously
  fetchMoviePosters(era);
}

async function fetchMoviePosters(era) {
  for (const sub of era.subgenres) {
    for (const movie of sub.movies) {
      try {
        const res = await fetch(`/api/movies?ids=${movie.id}`);
        const data = await res.json();
        if (data.results && data.results[0] && data.results[0].poster_path) {
          const imgs = document.querySelectorAll(`img[alt="${movie.title}"]`);
          imgs.forEach(img => {
            img.src = `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
          });
        }
      } catch (err) {
        console.error(`Poster load error for ${movie.title}:`, err);
      }
    }
  }
}
