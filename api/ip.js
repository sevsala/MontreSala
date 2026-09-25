const https = require('https');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const targetUrl = 'https://ipwho.is/';

  https.get(targetUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => (data += chunk));
    apiRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(apiRes.statusCode).send(data);
    });
  }).on('error', (err) => {
    res.status(502).json({ error: 'Proxy request failed', message: err.message });
  });
};
