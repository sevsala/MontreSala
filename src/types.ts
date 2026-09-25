export interface GeoLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  geonameid?: number;
}

export interface ShabbatTimes {
  candleLighting?: {
    time: string; // "18:34"
    dateStr: string; // ISO date
  };
  havdalah?: {
    time: string; // "19:35"
    dateStr: string; // ISO date
  };
  candleLightingMinutesBeforeSunset?: number;
  parasha?: string;
  parashaHebrew?: string;
  hebrewDateStr?: string;
  hebrewDateHebrew?: string;
  upcomingHoliday?: {
    title: string;
    hebrewTitle?: string;
    date: string;
    isYomTov: boolean;
  };
  isShabbatNow: boolean;
  timeUntilCandles?: string;
  utcOffsetSeconds?: number;
  lastUpdated: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  weatherDescription: string;
  iconName: string;
  tempMax: number;
  tempMin: number;
  precipitationProb?: number;
}

export interface WeatherData {
  currentTemp: number;
  currentWeatherCode: number;
  currentWeatherDesc: string;
  currentIcon: string;
  isDay: boolean;
  windSpeed: number;
  daily: DailyForecast[];
  utcOffsetSeconds?: number;
  lastUpdated: number;
}

