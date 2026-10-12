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
    // 1. Gather all movies across all subgenres in this era
    let allMovieItems = [];
    if (era.subgenres && era.subgenres.length > 0) {
      allMovieItems = era.subgenres.flatMap(sg => sg.movies || []);
    } else if (era.featuredMovies) {
      allMovieItems = era.featuredMovies;
    }

    // 2. Fetch movies sequentially with a 50ms delay to prevent HTTP 429 rate limits
    const movies = [];
    for (const item of allMovieItems) {
      try {
        const res = await fetch(`/api/movies?title=${encodeURIComponent(item.title)}&year=${item.year}`);
        const data = await res.json();
        
        // Debug log placed correctly inside the loop:
        console.log(`Checking "${item.title}":`, data);

        if (data.results && data.results[0]) {
          movies.push(data.results[0]);
        } else {
          console.warn(`No TMDB match found for: ${item.title} (${item.year})`);
        }
      } catch (e) {
        console.error(`Failed to fetch ${item.title}:`, e);
      }
      // Small 50ms pause between API calls to stay under rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // 3. Render the full list into the grid
    renderMovies(movies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    const grid = container.querySelector('.grid');
    if (grid) grid.innerHTML = '<p>Error loading movie data.</p>';
  }
}
