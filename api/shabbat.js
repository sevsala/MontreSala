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

  const { geonameid, latitude, longitude, lat, lon, tzid } = req.query;

  let targetUrl;
  if (geonameid) {
    targetUrl = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${geonameid}&M=on&lg=s`;
  } else {
    const finalLat = latitude || lat || '32.0919';
    const finalLon = longitude || lon || '34.8851';
    const safeTz = resolveSafeTimezone(tzid, finalLat, finalLon);

    let b = req.query.b;
    if (!b) {
      const numLat = parseFloat(finalLat);
      const numLon = parseFloat(finalLon);
      if (numLat >= 31.70 && numLat <= 31.85 && numLon >= 35.15 && numLon <= 35.28) {
        b = '40'; // Jerusalem
      } else if (numLat >= 32.75 && numLat <= 32.86 && numLon >= 34.93 && numLon <= 35.08) {
        b = '30'; // Haifa
      } else if (numLat >= 29.0 && numLat <= 34.0 && numLon >= 34.0 && numLon <= 36.0) {
        b = '20'; // Central Israel
      } else {
        b = '18';
      }
    }

    targetUrl = `https://www.hebcal.com/shabbat?cfg=json&latitude=${finalLat}&longitude=${finalLon}&tzid=${encodeURIComponent(safeTz)}&b=${b}&M=on&lg=s`;
  }

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
