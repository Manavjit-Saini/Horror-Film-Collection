const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/movies', async (req, res) => {
  try {
    const response = await fetch('https://horror-archive1.p.rapidapi.com/items?limit=50&page=10', {
      headers: {
        'x-rapidapi-key': 'e72af88687mshe0efc1ec959c2dfp1505f7jsn42efc56937de',
        'x-rapidapi-host': 'horror-archive1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `API status: ${response.status}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch horror movies', details: error.message });
  }
});

module.exports = app;

