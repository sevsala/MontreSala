const https = require('https');

function resolveSafeTimezone(tz, lat, lon) {
  if (tz && tz !== 'undefined' && tz !== 'null' && tz !== 'UTC') return tz;
  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);
  if (!isNaN(numLat) && !isNaN(numLon)) {
    if (numLat >= 29 && numLat <= 34 && numLon >= 34 && numLon <= 36) {
      return 'Asia/Jerusalem';
    }
    if (numLat >= 42 && numLat <= 51 && numLon >= -5 && numLon <= 10) {
      return 'Europe/Paris';
    }
  }
  return 'Asia/Jerusalem';
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { latitude, longitude, lat, lon, tzid, m = '50', b = '18' } = req.query;
  const finalLat = latitude || lat || '32.0919';
  const finalLon = longitude || lon || '34.8851';
  const safeTz = resolveSafeTimezone(tzid, finalLat, finalLon);

  const targetUrl = `https://www.hebcal.com/shabbat?cfg=json&latitude=${finalLat}&longitude=${finalLon}&tzid=${encodeURIComponent(safeTz)}&m=${m}&b=${b}&M=on&lg=s`;

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
