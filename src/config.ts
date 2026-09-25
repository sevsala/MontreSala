import { GeoLocation } from './types';

export const APP_CONFIG = {
  // Title & App Name
  appName: 'Montre Sala Kiosk',

  // Fallback location if auto-detection (IP) is unavailable
  defaultLocation: {
    city: 'Jérusalem',
    country: 'Israël',
    latitude: 31.7683,
    longitude: 35.2137,
    timezone: 'Asia/Jerusalem',
    geonameid: 281184
  } as GeoLocation,

  // Set to true to automatically detect location via IP address on startup
  autoDetectLocation: true,

  // Clock settings
  clock: {
    use24Hour: true,
    showSeconds: true,
    showHebrewDate: true,
    blinkColon: true,
    tickIntervalMs: 1000
  },

  // Shabbat settings
  shabbat: {
    havdalahMinutesPastSunset: 50, // Standard Rabeinu Tam / 50 min
    candleLightingMinutesBeforeSunset: 18, // 18 min (or 40 min in Jerusalem)
    refreshIntervalMs: 60 * 60 * 1000 // Refresh every 1 hour
  },

  // Weather settings
  weather: {
    refreshIntervalMs: 30 * 60 * 1000, // Refresh every 30 minutes
    temperatureUnit: 'celsius',
    forecastDays: 7
  },

  // LocalStorage cache keys
  cacheKeys: {
    location: 'montre_cached_location',
    shabbat: 'montre_cached_shabbat',
    weather: 'montre_cached_weather'
  }
};
