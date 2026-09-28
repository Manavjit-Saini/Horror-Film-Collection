const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());

app.get('/api/movies', (req, res) => {
  const options = {
    hostname: 'horror-archive1.p.rapidapi.com',
    path: '/items?limit=50&page=10',
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'e72af88687mshe0efc1ec959c2dfp1505f7jsn42efc56937de',
      'x-rapidapi-host': 'horror-archive1.p.rapidapi.com'
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        res.status(apiRes.statusCode).json(jsonData);
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse JSON response', raw: data });
      }
    });
  });

  apiReq.on('error', (err) => {
    res.status(500).json({ error: 'Upstream API Request Failed', message: err.message });
  });

  apiReq.end();
});

module.exports = app;

