async function fetchHorrorMovies() {
  const url = 'https://horror-archive1.p.rapidapi.com/items?limit=50&page=10';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'e72af88687mshe0efc1ec959c2dfp1505f7jsn42efc56937de',
      'x-rapidapi-host': 'horror-archive1.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);

    // Get the HTML element where movies will display
    const container = document.getElementById('movie-container');
    if (!container) return;
    container.innerHTML = '';

    // Loop through movies and display them
    data.results.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <h3>${movie.title || 'Untitled'} (${movie.year || 'N/A'})</h3>
        <p>${movie.description ? movie.description.substring(0, 120) + '...' : 'No description available.'}</p>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

// Call the function when the page loads
fetchHorrorMovies();