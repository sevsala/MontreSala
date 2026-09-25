const https = require('https');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const now = new Date();
  const gy = req.query.gy || now.getFullYear();
  const gm = req.query.gm || now.getMonth() + 1;
  const gd = req.query.gd || now.getDate();

  const targetUrl = `https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1`;

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
