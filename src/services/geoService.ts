import { APP_CONFIG } from '../config';
import { GeoLocation } from '../types';

const MANUAL_LOCATION_KEY = 'montre_manual_location';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const PRESET_LOCATIONS: GeoLocation[] = [
  // Israel
  { city: 'Petah Tikva', country: 'Israël', latitude: 32.0919, longitude: 34.8851, timezone: 'Asia/Jerusalem', geonameid: 293918 },
  { city: 'Tel Aviv', country: 'Israël', latitude: 32.0853, longitude: 34.7818, timezone: 'Asia/Jerusalem', geonameid: 293397 },
  { city: 'Jérusalem', country: 'Israël', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem', geonameid: 281184 },
  { city: 'Netanya', country: 'Israël', latitude: 32.3215, longitude: 34.8532, timezone: 'Asia/Jerusalem', geonameid: 294071 },
  { city: 'Ashdod', country: 'Israël', latitude: 31.8044, longitude: 34.6553, timezone: 'Asia/Jerusalem', geonameid: 295629 },
  { city: 'Haïfa', country: 'Israël', latitude: 32.7940, longitude: 34.9896, timezone: 'Asia/Jerusalem', geonameid: 294801 },
  { city: 'Raanana', country: 'Israël', latitude: 32.1848, longitude: 34.8713, timezone: 'Asia/Jerusalem', geonameid: 293703 },
  { city: 'Herzliya', country: 'Israël', latitude: 32.1663, longitude: 34.8433, timezone: 'Asia/Jerusalem', geonameid: 294952 },

  // France
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', geonameid: 2988507 },
  { city: 'Marseille', country: 'France', latitude: 43.2965, longitude: 5.3698, timezone: 'Europe/Paris', geonameid: 2995469 },
  { city: 'Lyon', country: 'France', latitude: 45.7640, longitude: 4.8357, timezone: 'Europe/Paris', geonameid: 2996944 },
  { city: 'Strasbourg', country: 'France', latitude: 48.5734, longitude: 7.7521, timezone: 'Europe/Paris', geonameid: 2973783 },
  { city: 'Nice', country: 'France', latitude: 43.7102, longitude: 7.2620, timezone: 'Europe/Paris', geonameid: 2990440 },
  { city: 'Toulouse', country: 'France', latitude: 43.6047, longitude: 1.4442, timezone: 'Europe/Paris', geonameid: 2972315 },

  // International
  { city: 'New York', country: 'États-Unis', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', geonameid: 5128581 },
  { city: 'Miami', country: 'États-Unis', latitude: 25.7617, longitude: -80.1918, timezone: 'America/New_York', geonameid: 4164138 },
  { city: 'Londres', country: 'Royaume-Uni', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', geonameid: 2643743 }
];

export async function detectLocation(): Promise<GeoLocation> {
  // 1. First check if user manually specified a location
  try {
    const manual = localStorage.getItem(MANUAL_LOCATION_KEY);
    if (manual) {
      const parsed = JSON.parse(manual);
      if (parsed && parsed.latitude && parsed.longitude) {
        return parsed as GeoLocation;
      }
    }
  } catch (e) {}

  if (!APP_CONFIG.autoDetectLocation) {
    return APP_CONFIG.defaultLocation;
  }

  // 2. Check local IP cache
  try {
    const cached = localStorage.getItem(APP_CONFIG.cacheKeys.location);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
        return parsed.data as GeoLocation;
      }
    }
  } catch (e) {}

  // 3. Try primary IP service (via local proxy first for iOS 9, fallback to direct)
  try {
    let res: Response | null = null;
    try {
      res = await fetch('/api/ip');
    } catch (e) {}

    if (!res || !res.ok) {
      res = await fetch('https://ipwho.is/');
    }

    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        const rawLoc: GeoLocation = {
          city: data.city || 'Localité',
          country: data.country || '',
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: (data.timezone && data.timezone.id) || 'Asia/Jerusalem'
        };
        const loc = enrichLocationWithPreset(rawLoc);
        saveToCache(loc);
        return loc;
      }
    }
  } catch (e) {}

  // 4. Try secondary IP service: freeipapi.com
  try {
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const rawLoc: GeoLocation = {
          city: data.cityName || 'Localité',
          country: data.countryName || '',
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          timezone: data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        };
        const loc = enrichLocationWithPreset(rawLoc);
        saveToCache(loc);
        return loc;
      }
    }
  } catch (e) {}

  // 5. Return cached data even if expired
  try {
    const cached = localStorage.getItem(APP_CONFIG.cacheKeys.location);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.data) return parsed.data;
    }
  } catch (e) {}

  // 6. Default fallback location
  return APP_CONFIG.defaultLocation;
}

function enrichLocationWithPreset(loc: GeoLocation): GeoLocation {
  if (loc.geonameid) return loc;
  const match = PRESET_LOCATIONS.find((p) => {
    if (p.city.toLowerCase() === loc.city.toLowerCase()) return true;
    const dLat = Math.abs(p.latitude - loc.latitude);
    const dLon = Math.abs(p.longitude - loc.longitude);
    return dLat < 0.15 && dLon < 0.15; // within ~15 km
  });
  if (match) {
    return {
      ...loc,
      city: match.city,
      country: match.country,
      timezone: match.timezone,
      geonameid: match.geonameid
    };
  }
  return loc;
}

export function saveManualLocation(loc: GeoLocation) {
  try {
    localStorage.setItem(MANUAL_LOCATION_KEY, JSON.stringify(loc));
  } catch (e) {}
}

export function clearManualLocation() {
  try {
    localStorage.removeItem(MANUAL_LOCATION_KEY);
    localStorage.removeItem(APP_CONFIG.cacheKeys.location);
  } catch (e) {}
}

export function hasManualLocation(): boolean {
  try {
    return !!localStorage.getItem(MANUAL_LOCATION_KEY);
  } catch (e) {
    return false;
  }
}

export async function searchCities(query: string): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    let res: Response | null = null;
    try {
      res = await fetch(`/api/geocoding?name=${encodeURIComponent(trimmed)}`);
    } catch (e) {}

    if (!res || !res.ok) {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=fr`;
      res = await fetch(url);
    }

    if (!res.ok) return [];

    const data = await res.json();
    const results: any[] = data.results || [];

    return results.map((r) => ({
      city: r.name,
      country: r.country || '',
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone || 'UTC',
      geonameid: r.id
    }));
  } catch (e) {
    return [];
  }
}

function saveToCache(location: GeoLocation) {
  try {
    localStorage.setItem(
      APP_CONFIG.cacheKeys.location,
      JSON.stringify({ timestamp: Date.now(), data: location })
    );
  } catch (e) {}
}
