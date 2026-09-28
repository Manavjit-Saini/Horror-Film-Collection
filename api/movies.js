export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch horror movies', details: error.message });
  }
}
