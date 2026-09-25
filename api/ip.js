module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Always return Israeli location by default
  return res.status(200).json({
    success: true,
    city: 'Haïfa',
    country: 'Israël',
    latitude: 32.7940,
    longitude: 34.9896,
    timezone: {
      id: 'Asia/Jerusalem',
      utc: '+03:00'
    }
  });
};
