import { GeoLocation } from './types';

export const APP_CONFIG = {
  // Title & App Name
  appName: 'Montre Sala Kiosk',

  // Default location in Israel: Haïfa (or user can switch to Jerusalem, Tel Aviv, etc.)
  defaultLocation: {
    city: 'Haïfa',
    country: 'Israël',
    latitude: 32.7940,
    longitude: 34.9896,
    timezone: 'Asia/Jerusalem',
    geonameid: 294801
  } as GeoLocation,

  // Force Israeli location - NEVER auto-detect foreign server IPs
  autoDetectLocation: false,

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
