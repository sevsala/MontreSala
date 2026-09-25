import { APP_CONFIG } from '../config';
import { GeoLocation, ShabbatTimes } from '../types';

function getSafeTimezone(tz?: string, lat?: number, lon?: number): string {
  if (tz && tz !== 'undefined' && tz !== 'null' && tz !== 'UTC') return tz;
  if (lat && lon && lat >= 29 && lat <= 34 && lon >= 34 && lon <= 36) {
    return 'Asia/Jerusalem';
  }
  if (lat && lon && lat >= 42 && lat <= 51 && lon >= -5 && lon <= 10) {
    return 'Europe/Paris';
  }
  return 'Asia/Jerusalem';
}

export async function fetchShabbatTimes(loc: GeoLocation): Promise<ShabbatTimes> {
  const cached = getCachedShabbat();

  try {
    const lat = loc.latitude.toFixed(4);
    const lon = loc.longitude.toFixed(4);
    const safeTz = getSafeTimezone(loc.timezone, loc.latitude, loc.longitude);
    const tzid = encodeURIComponent(safeTz);
    const m = APP_CONFIG.shabbat.havdalahMinutesPastSunset;
    const b = APP_CONFIG.shabbat.candleLightingMinutesBeforeSunset;

    let res: Response | null = null;

    // 1. Try local proxy first (immune to iOS 9 Let's Encrypt certificate failure)
    try {
      res = await fetch(`/api/shabbat?latitude=${lat}&longitude=${lon}&tzid=${tzid}&m=${m}&b=${b}`);
    } catch (e) {
      // Local proxy failed or not available, fallback to direct
    }

    // 2. Direct fallback
    if (!res || !res.ok) {
      const directUrl = `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lon}&tzid=${tzid}&m=${m}&b=${b}&M=on&lg=s`;
      res = await fetch(directUrl);
    }

    if (!res.ok) {
      if (cached) return cached;
      throw new Error(`Hebcal request failed with status ${res.status}`);
    }

    const data = await res.json();
    const items: Array<any> = data.items || [];

    let candleLighting: { time: string; dateStr: string } | undefined;
    let havdalah: { time: string; dateStr: string } | undefined;
    let parasha: string | undefined;
    let parashaHebrew: string | undefined;
    let upcomingHoliday: { title: string; hebrewTitle?: string; date: string; isYomTov: boolean } | undefined;

    const now = new Date();

    const nowTime = now.getTime();

    const candleItems = items.filter((i) => i.category === 'candles');
    const havdalahItems = items.filter((i) => i.category === 'havdalah');
    const parashaItem = items.find((i) => i.category === 'parashat');
    const holidayItems = items.filter((i) => i.category === 'holiday');

    // Find the relevant Havdalah: first one in the future, or the last in list
    const activeHavdalah =
      havdalahItems.find((h) => new Date(h.date).getTime() >= nowTime) ||
      havdalahItems[havdalahItems.length - 1];

    // Find candle lighting associated with this cycle (before havdalah) or first future candle
    let activeCandle: any = null;
    if (activeHavdalah) {
      const havdalahTime = new Date(activeHavdalah.date).getTime();
      const precedingCandles = candleItems.filter(
        (c) => new Date(c.date).getTime() <= havdalahTime
      );
      activeCandle = precedingCandles[precedingCandles.length - 1];
    }

    if (!activeCandle) {
      activeCandle =
        candleItems.find((c) => new Date(c.date).getTime() >= nowTime) ||
        candleItems[candleItems.length - 1];
    }

    if (activeCandle) {
      candleLighting = {
        time: formatTimeFromDateString(activeCandle.date),
        dateStr: activeCandle.date
      };
    }

    if (activeHavdalah) {
      havdalah = {
        time: formatTimeFromDateString(activeHavdalah.date),
        dateStr: activeHavdalah.date
      };
    }

    if (parashaItem) {
      parasha = parashaItem.title;
      parashaHebrew = parashaItem.hebrew;
    }

    const nextHoliday = holidayItems.find(
      (h) => new Date(h.date).getTime() >= nowTime - 24 * 3600 * 1000
    );
    if (nextHoliday) {
      upcomingHoliday = {
        title: nextHoliday.title,
        hebrewTitle: nextHoliday.hebrew,
        date: nextHoliday.date,
        isYomTov: nextHoliday.yomtov === true
      };
    }

    // Also get current Hebrew Date
    const hebrewDateInfo = await fetchHebrewDate(now);

    // Calculate if it is currently Shabbat / Yom Tov
    const isShabbatNow = checkIsShabbat(candleLighting?.dateStr, havdalah?.dateStr);

    // Time until candle lighting
    let timeUntilCandles: string | undefined;
    if (candleLighting && !isShabbatNow) {
      timeUntilCandles = computeTimeUntil(candleLighting.dateStr);
    }

    const result: ShabbatTimes = {
      candleLighting,
      havdalah,
      parasha,
      parashaHebrew,
      hebrewDateStr: hebrewDateInfo.translit,
      hebrewDateHebrew: hebrewDateInfo.hebrew,
      upcomingHoliday,
      isShabbatNow,
      timeUntilCandles,
      lastUpdated: Date.now()
    };

    cacheShabbat(result);
    return result;
  } catch (err) {
    if (cached) return cached;
    // Fallback safe object
    return {
      isShabbatNow: false,
      lastUpdated: Date.now()
    };
  }
}

async function fetchHebrewDate(date: Date): Promise<{ translit: string; hebrew: string }> {
  try {
    const gy = date.getFullYear();
    const gm = date.getMonth() + 1;
    const gd = date.getDate();

    let res: Response | null = null;
    try {
      res = await fetch(`/api/hebcal-converter?gy=${gy}&gm=${gm}&gd=${gd}`);
    } catch (e) {}

    if (!res || !res.ok) {
      res = await fetch(`https://www.hebcal.com/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1`);
    }

    if (res && res.ok) {
      const data = await res.json();
      return {
        translit: `${data.hd} ${data.hm} ${data.hy}`,
        hebrew: data.hebrew || ''
      };
    }
  } catch (e) {
    // Ignore error
  }
  return { translit: '', hebrew: '' };
}

function formatTimeFromDateString(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (e) {
    return '--:--';
  }
}

function checkIsShabbat(candleDateStr?: string, havdalahDateStr?: string): boolean {
  if (!candleDateStr || !havdalahDateStr) return false;
  const now = Date.now();
  const candleTime = new Date(candleDateStr).getTime();
  const havdalahTime = new Date(havdalahDateStr).getTime();

  return now >= candleTime && now <= havdalahTime;
}

function computeTimeUntil(targetDateStr: string): string | undefined {
  const diffMs = new Date(targetDateStr).getTime() - Date.now();
  if (diffMs <= 0 || diffMs > 7 * 24 * 3600 * 1000) return undefined;

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `dans ${days}j ${remHours}h`;
  }
  if (hours > 0) {
    return `dans ${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `dans ${minutes} min`;
}

function getCachedShabbat(): ShabbatTimes | null {
  try {
    const item = localStorage.getItem(APP_CONFIG.cacheKeys.shabbat);
    if (item) {
      return JSON.parse(item) as ShabbatTimes;
    }
  } catch (e) {}
  return null;
}

function cacheShabbat(data: ShabbatTimes) {
  try {
    localStorage.setItem(APP_CONFIG.cacheKeys.shabbat, JSON.stringify(data));
  } catch (e) {}
}
