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

function getCityCandleLightingMinutes(loc: GeoLocation): number {
  const cityName = (loc.city || '').toLowerCase();
  const lat = loc.latitude;
  const lon = loc.longitude;

  // Jerusalem: 40 minutes (Minhag Yerushalayim)
  if (
    cityName.includes('jerusalem') ||
    cityName.includes('jérusalem') ||
    (lat >= 31.70 && lat <= 31.85 && lon >= 35.15 && lon <= 35.28)
  ) {
    return 40;
  }

  // Haifa: 30 minutes (Minhag Haifa)
  if (
    cityName.includes('haifa') ||
    cityName.includes('haïfa') ||
    (lat >= 32.75 && lat <= 32.86 && lon >= 34.93 && lon <= 35.08)
  ) {
    return 30;
  }

  // Other cities in Israel: 20 minutes (Tel Aviv, Petah Tikva, etc.)
  if (
    loc.country === 'Israël' ||
    loc.country === 'Israel' ||
    (lat >= 29.4 && lat <= 33.4 && lon >= 34.2 && lon <= 35.9)
  ) {
    return 20;
  }

  return 18;
}

export async function fetchShabbatTimes(loc: GeoLocation, targetDate?: Date): Promise<ShabbatTimes> {
  const cached = !targetDate ? getCachedShabbat() : null;

  try {
    const lat = loc.latitude.toFixed(4);
    const lon = loc.longitude.toFixed(4);
    const safeTz = getSafeTimezone(loc.timezone, loc.latitude, loc.longitude);
    const tzid = encodeURIComponent(safeTz);
    const b = getCityCandleLightingMinutes(loc);

    let dateParams = '';
    if (targetDate) {
      dateParams = `&gy=${targetDate.getFullYear()}&gm=${targetDate.getMonth() + 1}&gd=${targetDate.getDate()}`;
    }

    let res: Response | null = null;

    // 1. Try local proxy first (immune to iOS 9 Let's Encrypt certificate failure)
    try {
      if (loc.geonameid) {
        res = await fetch(`/api/shabbat?geonameid=${loc.geonameid}&M=on${dateParams}`);
      } else {
        res = await fetch(`/api/shabbat?latitude=${lat}&longitude=${lon}&tzid=${tzid}&b=${b}&M=on${dateParams}`);
      }
    } catch (e) {
      // Local proxy failed or not available, fallback to direct
    }

    // 2. Direct fallback
    if (!res || !res.ok) {
      const directUrl = loc.geonameid
        ? `https://www.hebcal.com/shabbat?cfg=json&geonameid=${loc.geonameid}&M=on&lg=s${dateParams}`
        : `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lon}&tzid=${tzid}&b=${b}&M=on&lg=s${dateParams}`;
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
      havdalahItems.find((h) => parseIsoToTimestamp(h.date) >= nowTime) ||
      havdalahItems[havdalahItems.length - 1];

    // If this entire cycle's Havdalah is already in the past, query for next cycle
    if (!targetDate && activeHavdalah && parseIsoToTimestamp(activeHavdalah.date) < nowTime) {
      const tomorrow = new Date(nowTime + 24 * 3600 * 1000);
      return fetchShabbatTimes(loc, tomorrow);
    }

    // Find candle lighting associated with this cycle (before havdalah) or first future candle
    let activeCandle: any = null;
    if (activeHavdalah) {
      const havdalahTime = parseIsoToTimestamp(activeHavdalah.date);
      const precedingCandles = candleItems.filter(
        (c) => parseIsoToTimestamp(c.date) <= havdalahTime
      );
      activeCandle = precedingCandles[precedingCandles.length - 1];
    }

    if (!activeCandle) {
      activeCandle =
        candleItems.find((c) => parseIsoToTimestamp(c.date) >= nowTime) ||
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

    const candleMinutes = loc.geonameid ? getCityCandleLightingMinutes(loc) : b;
    const offsetSeconds =
      getUtcOffsetSecondsFromIso(activeCandle?.date) ||
      getUtcOffsetSecondsFromIso(activeHavdalah?.date);

    const result: ShabbatTimes = {
      candleLighting,
      havdalah,
      candleLightingMinutesBeforeSunset: candleMinutes,
      parasha,
      parashaHebrew,
      hebrewDateStr: hebrewDateInfo.translit,
      hebrewDateHebrew: hebrewDateInfo.hebrew,
      upcomingHoliday,
      isShabbatNow,
      timeUntilCandles,
      utcOffsetSeconds: offsetSeconds,
      lastUpdated: Date.now()
    };

    cacheShabbat(result);
    return result;
  } catch (err) {
    console.warn('Network fetch failed for Shabbat, using cached or fallback:', err);
    if (cached && cached.candleLighting && cached.havdalah) {
      return cached;
    }
    return getDefaultIsraeliShabbatTimes(loc);
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
    // 1. Direct regex extract from ISO-8601 (e.g. "2026-09-25T18:13:00+03:00" -> "18:13")
    // Hebcal computes the exact civil time in that city. Extracting HH:mm directly preserves
    // the local time and avoids unwanted timezone conversion to the iPad's system timezone.
    const match = isoString.match(/T(\d{1,2}:\d{2})/);
    if (match) {
      return match[1];
    }
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (e) {
    return '--:--';
  }
}

function getUtcOffsetSecondsFromIso(isoString?: string): number | undefined {
  if (!isoString) return undefined;
  const match = isoString.match(/([+-])(\d{2}):(\d{2})$/);
  if (match) {
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const mins = parseInt(match[3], 10);
    return sign * (hours * 3600 + mins * 60);
  }
  return undefined;
}

export function parseIsoToTimestamp(isoString?: string): number {
  if (!isoString) return NaN;
  const ts = new Date(isoString).getTime();
  if (!isNaN(ts)) return ts;
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:([+-])(\d{2}):?(\d{2}))?/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const hh = parseInt(match[4], 10);
    const mm = parseInt(match[5], 10);
    const ss = match[6] ? parseInt(match[6], 10) : 0;
    const utcMs = Date.UTC(y, m, d, hh, mm, ss);
    if (match[7] && match[8]) {
      const sign = match[7] === '-' ? 1 : -1;
      const offsetMs = (parseInt(match[8], 10) * 3600 + parseInt(match[9] || '0', 10) * 60) * 1000;
      return utcMs + sign * offsetMs;
    }
    return utcMs;
  }
  return NaN;
}

export function formatCountdown(diffMs: number): string | undefined {
  if (diffMs <= 0) return undefined;

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad2 = (n: number) => String(n).padStart(2, '0');

  if (days > 0) {
    return `dans ${days}j ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`;
  }
  if (hours > 0) {
    return `dans ${hours}h ${pad2(minutes)}m ${pad2(seconds)}s`;
  }
  if (minutes > 0) {
    return `dans ${minutes}m ${pad2(seconds)}s`;
  }
  return `dans ${seconds}s`;
}

export function checkIsShabbat(candleDateStr?: string, havdalahDateStr?: string, nowMs: number = Date.now()): boolean {
  if (!candleDateStr || !havdalahDateStr) return false;
  const candleTime = parseIsoToTimestamp(candleDateStr);
  const havdalahTime = parseIsoToTimestamp(havdalahDateStr);
  if (isNaN(candleTime) || isNaN(havdalahTime)) return false;

  return nowMs >= candleTime && nowMs <= havdalahTime;
}

export function computeTimeUntil(targetDateStr: string, nowMs: number = Date.now()): string | undefined {
  const targetMs = parseIsoToTimestamp(targetDateStr);
  if (isNaN(targetMs)) return undefined;
  return formatCountdown(targetMs - nowMs);
}

function getDefaultIsraeliShabbatTimes(loc: GeoLocation): ShabbatTimes {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const daysUntilFriday = (5 - day + 7) % 7;
  const fridayDate = new Date(now.getTime() + daysUntilFriday * 86400 * 1000);
  const saturdayDate = new Date(fridayDate.getTime() + 86400 * 1000);

  const yF = fridayDate.getFullYear();
  const mF = String(fridayDate.getMonth() + 1).padStart(2, '0');
  const dF = String(fridayDate.getDate()).padStart(2, '0');

  const yS = saturdayDate.getFullYear();
  const mS = String(saturdayDate.getMonth() + 1).padStart(2, '0');
  const dS = String(saturdayDate.getDate()).padStart(2, '0');

  const isJerusalem = loc.city?.toLowerCase().includes('jérusalem') || loc.city?.toLowerCase().includes('jerusalem');
  const candleTime = isJerusalem ? '17:38' : '17:55';
  const havdalahTime = isJerusalem ? '18:55' : '18:59';
  const candleMinutes = isJerusalem ? 40 : 18;

  const candleIso = `${yF}-${mF}-${dF}T${candleTime}:00+03:00`;
  const havdalahIso = `${yS}-${mS}-${dS}T${havdalahTime}:00+03:00`;

  return {
    candleLighting: {
      time: candleTime,
      dateStr: candleIso
    },
    havdalah: {
      time: havdalahTime,
      dateStr: havdalahIso
    },
    candleLightingMinutesBeforeSunset: candleMinutes,
    isShabbatNow: checkIsShabbat(candleIso, havdalahIso),
    timeUntilCandles: computeTimeUntil(candleIso),
    lastUpdated: Date.now()
  };
}

function getCachedShabbat(): ShabbatTimes | null {
  try {
    const item = localStorage.getItem(APP_CONFIG.cacheKeys.shabbat);
    if (item) {
      const parsed = JSON.parse(item) as ShabbatTimes;
      // Do not wipe valid data if network fails - only discard if corrupted
      if (parsed && parsed.candleLighting?.time && parsed.havdalah?.time) {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

function cacheShabbat(data: ShabbatTimes) {
  try {
    if (data && data.candleLighting && data.havdalah) {
      localStorage.setItem(APP_CONFIG.cacheKeys.shabbat, JSON.stringify(data));
    }
  } catch (e) {}
}

