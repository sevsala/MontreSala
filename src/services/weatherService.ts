import { APP_CONFIG } from '../config';
import { DailyForecast, GeoLocation, WeatherData } from '../types';

export async function fetchWeatherData(loc: GeoLocation): Promise<WeatherData> {
  const cached = getCachedWeather();

  try {
    const lat = loc.latitude.toFixed(4);
    const lon = loc.longitude.toFixed(4);

    let res: Response | null = null;
    try {
      res = await fetch(`/api/weather?latitude=${lat}&longitude=${lon}`);
    } catch (e) {}

    if (!res || !res.ok) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      res = await fetch(url);
    }

    if (!res.ok) {
      if (cached) return cached;
      throw new Error(`Open-Meteo request failed: ${res.status}`);
    }

    const data = await res.json();
    const current = data.current_weather || {};
    const dailyRaw = data.daily || {};

    const daily: DailyForecast[] = [];
    const dates: string[] = dailyRaw.time || [];
    const codes: number[] = dailyRaw.weathercode || [];
    const maxTemps: number[] = dailyRaw.temperature_2m_max || [];
    const minTemps: number[] = dailyRaw.temperature_2m_min || [];
    const precipProb: number[] = dailyRaw.precipitation_probability_max || [];

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < Math.min(dates.length, APP_CONFIG.weather.forecastDays); i++) {
      const dStr = dates[i];
      const isToday = dStr === todayStr;
      const dateObj = new Date(dStr + 'T12:00:00');
      const dayName = isToday ? "Aujourd'hui" : getShortDayName(dateObj);
      const code = codes[i] ?? 0;
      const info = getWeatherInfo(code);

      daily.push({
        date: dStr,
        dayName,
        weatherCode: code,
        weatherDescription: info.label,
        iconName: info.icon,
        tempMax: Math.round(maxTemps[i] ?? 0),
        tempMin: Math.round(minTemps[i] ?? 0),
        precipitationProb: precipProb[i] !== undefined ? precipProb[i] : undefined
      });
    }

    const currentInfo = getWeatherInfo(current.weathercode ?? 0);

    const result: WeatherData = {
      currentTemp: Math.round(current.temperature ?? 0),
      currentWeatherCode: current.weathercode ?? 0,
      currentWeatherDesc: currentInfo.label,
      currentIcon: currentInfo.icon,
      isDay: current.is_day === 1,
      windSpeed: Math.round(current.windspeed ?? 0),
      daily,
      lastUpdated: Date.now()
    };

    cacheWeather(result);
    return result;
  } catch (err) {
    if (cached) return cached;
    // Fallback default
    return {
      currentTemp: 22,
      currentWeatherCode: 0,
      currentWeatherDesc: 'Ensoleillé',
      currentIcon: 'sun',
      isDay: true,
      windSpeed: 10,
      daily: [],
      lastUpdated: Date.now()
    };
  }
}

export function getWeatherInfo(code: number): { label: string; icon: string } {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0:
      return { label: 'Ciel dégagé', icon: 'sun' };
    case 1:
      return { label: 'Généralement clair', icon: 'sun' };
    case 2:
      return { label: 'Partiellement nuageux', icon: 'cloud-sun' };
    case 3:
      return { label: 'Couvert', icon: 'cloud' };
    case 45:
    case 48:
      return { label: 'Brume & Brouillard', icon: 'fog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Bruine', icon: 'drizzle' };
    case 61:
    case 63:
    case 65:
      return { label: 'Pluie', icon: 'rain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Neige', icon: 'snow' };
    case 80:
    case 81:
    case 82:
      return { label: 'Averses de pluie', icon: 'rain' };
    case 85:
    case 86:
      return { label: 'Averses de neige', icon: 'snow' };
    case 95:
      return { label: 'Orage', icon: 'thunderstorm' };
    case 96:
    case 99:
      return { label: 'Orage et grêle', icon: 'thunderstorm' };
    default:
      return { label: 'Variable', icon: 'cloud-sun' };
  }
}

function getShortDayName(date: Date): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[date.getDay()];
}

function getCachedWeather(): WeatherData | null {
  try {
    const item = localStorage.getItem(APP_CONFIG.cacheKeys.weather);
    if (item) {
      return JSON.parse(item) as WeatherData;
    }
  } catch (e) {}
  return null;
}

function cacheWeather(data: WeatherData) {
  try {
    localStorage.setItem(APP_CONFIG.cacheKeys.weather, JSON.stringify(data));
  } catch (e) {}
}
