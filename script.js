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
        // Ignore errors or empty returns
        if (!data || data.success === false || !data.title) return null;
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
