
const express = require('express');
const cors = require('cors');
const app = express();

// Allow cross-origin requests from your frontend
app.use(cors());

// Proxy route for fetching horror movies
app.get('/api/movies', async (req, res) => {
  try {
    const response = await fetch('https://horror-archive1.p.rapidapi.com/items?limit=50&page=10', {
      headers: {
        'x-rapidapi-key': 'e72af88687mshe0efc1ec959c2dfp1505f7jsn42efc56937de',
  'x-rapidapi-host': 'horror-archive1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API response status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch horror movies' });
  }
});

// Export app for Vercel serverless deployment
module.exports = app;

