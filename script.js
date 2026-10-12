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
    // 1. Gather all movies across all subgenres
    let allMovieItems = [];
    if (era.subgenres && era.subgenres.length > 0) {
      allMovieItems = era.subgenres.flatMap(sg => sg.movies || []);
    } else if (era.featuredMovies) {
      allMovieItems = era.featuredMovies;
    }

    // 2. Fetch all movies using their exact TMDB IDs in parallel
    const moviePromises = allMovieItems.map(async (item) => {
      try {
        const res = await fetch(`/api/movies?id=${item.id}`);
        const data = await res.json();
        // If TMDB returns an error object or empty, return null
        if (data.success === false || data.status_code) return null;
        return data;
      } catch (e) {
        console.error(`Failed to fetch ID ${item.id}:`, e);
        return null;
      }
    });

    const movies = (await Promise.all(moviePromises)).filter(Boolean);

    // 3. Render the full list into the grid
    renderMovies(movies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    const grid = container.querySelector('.grid');
    if (grid) grid.innerHTML = '<p>Error loading movie data.</p>';
  }
}
