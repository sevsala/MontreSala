const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// In-memory cache for API requests (10 min TTL)
const apiCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function fetchHttps(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js MontreSala Proxy)'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Add CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Proxy Endpoints ---

  // 1. Shabbat times proxy
  if (pathname === '/api/shabbat') {
    const lat = parsedUrl.query.latitude || parsedUrl.query.lat || '32.0919';
    const lon = parsedUrl.query.longitude || parsedUrl.query.lon || '34.8851';
    const tzid = resolveSafeTimezone(parsedUrl.query.tzid, lat, lon);
    const m = parsedUrl.query.m || '50';
    const b = parsedUrl.query.b || '18';

    const targetUrl = `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lon}&tzid=${encodeURIComponent(tzid)}&m=${m}&b=${b}&M=on&lg=s`;
    return handleProxy(targetUrl, res);
  }

  // 2. Hebrew date converter proxy
  if (pathname === '/api/hebcal-converter') {
    const now = new Date();
    const gy = parsedUrl.query.gy || now.getFullYear();
    const gm = parsedUrl.query.gm || now.getMonth() + 1;
    const gd = parsedUrl.query.gd || now.getDate();

    const targetUrl = `https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1`;
    return handleProxy(targetUrl, res);
  }

  // 3. Weather forecast proxy
  if (pathname === '/api/weather') {
    const lat = parsedUrl.query.latitude || parsedUrl.query.lat || '32.0919';
    const lon = parsedUrl.query.longitude || parsedUrl.query.lon || '34.8851';

    const targetUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    return handleProxy(targetUrl, res);
  }

  // 4. Geocoding / city search proxy
  if (pathname === '/api/geocoding' || pathname === '/api/search') {
    const query = parsedUrl.query.name || parsedUrl.query.q || '';
    if (!query) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results: [] }));
      return;
    }

    const targetUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=fr`;
    return handleProxy(targetUrl, res);
  }

  // 5. IP geolocation proxy
  if (pathname === '/api/ip') {
    const targetUrl = 'https://ipwho.is/';
    return handleProxy(targetUrl, res);
  }

  // --- Static Files Serving ---
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // If requesting directory or root, serve index.html
  if (safePath === '/' || safePath === '' || !path.extname(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const indexFile = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexFile, (err2, content) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found - please run npm run build');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Set cache headers: no-cache for index.html, 1 year cache for fingerprinted assets
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

async function handleProxy(targetUrl, res) {
  // Check memory cache
  const cached = apiCache.get(targetUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Cache': 'HIT'
    });
    res.end(cached.body);
    return;
  }

  try {
    const response = await fetchHttps(targetUrl);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      apiCache.set(targetUrl, {
        timestamp: Date.now(),
        body: response.body
      });
    }

    res.writeHead(response.statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Cache': 'MISS'
    });
    res.end(response.body);
  } catch (err) {
    console.error('Proxy error for', targetUrl, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy request failed', message: err.message }));
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(` MontreSala Legacy Server is running!`);
  console.log(` Local:   http://localhost:${PORT}/`);
  console.log(` iPad:    http://<Your-IP>:${PORT}/`);
  console.log(` Proxying external APIs via local HTTP for iOS 9!`);
  console.log(`==================================================\n`);
});
