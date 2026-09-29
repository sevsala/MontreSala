import { ThemeId, ThemeOption } from './types';
import { APP_CONFIG } from './config';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'sunset_pop',
    name: 'Miami Sunset & Corail Pop',
    subtitle: 'Chaleureux, coucher de soleil & corail électrique',
    icon: '🌅',
    isDark: true,
    previewColors: {
      bg: '#180a24',
      card: '#290f3c',
      accent: '#ff4d6d',
      text: '#fff1f2'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Neo-Tokyo & Cyberpunk',
    subtitle: 'Néon magenta, cyan électrique & noir profond',
    icon: '⚡',
    isDark: true,
    previewColors: {
      bg: '#070714',
      card: '#0d0b24',
      accent: '#00f5d4',
      text: '#ffffff'
    }
  },
  {
    id: 'electric_lime',
    name: 'Electric Klein & Lime',
    subtitle: 'Bleu cobalt profond & vert lime fluo',
    icon: '🟢',
    isDark: true,
    previewColors: {
      bg: '#060b17',
      card: '#0a1733',
      accent: '#a3e635',
      text: '#ffffff'
    }
  },
  {
    id: 'jerusalem',
    name: 'Pierre de Jérusalem & Miel',
    subtitle: 'Chaleureux, lin & pierre naturelle dorée',
    icon: '🏛️',
    isDark: false,
    previewColors: {
      bg: '#faf7f2',
      card: '#ffffff',
      accent: '#d97706',
      text: '#1c1917'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Luxury & Or',
    subtitle: 'Noir OLED & doré suisse, anti-éblouissement',
    icon: '🌙',
    isDark: true,
    previewColors: {
      bg: '#080c14',
      card: '#0f172a',
      accent: '#f59e0b',
      text: '#f8fafc'
    }
  },
  {
    id: 'glacier',
    name: 'Glacier & Bleu Nuit',
    subtitle: 'Nordique, minimaliste & givré contemporain',
    icon: '❄️',
    isDark: false,
    previewColors: {
      bg: '#f0f6fc',
      card: '#ffffff',
      accent: '#0284c7',
      text: '#0b2545'
    }
  },
  {
    id: 'emerald',
    name: 'Émeraude & Laiton Brossé',
    subtitle: 'Horlogerie d\'exception & or champagne',
    icon: '🌲',
    isDark: true,
    previewColors: {
      bg: '#051a14',
      card: '#08261e',
      accent: '#eab308',
      text: '#fef9c3'
    }
  },
  {
    id: 'terracotta',
    name: 'Terracotta & Coucher de Soleil',
    subtitle: 'Chaleur méditerranéenne & argile cuite',
    icon: '🌅',
    isDark: false,
    previewColors: {
      bg: '#fdf6f0',
      card: '#ffffff',
      accent: '#ea580c',
      text: '#291e17'
    }
  },
  {
    id: 'auto',
    name: 'Auto Jour / Nuit',
    subtitle: 'Jérusalem en journée, Midnight la nuit',
    icon: '🔄',
    isDark: false,
    previewColors: {
      bg: '#faf7f2',
      card: '#0f172a',
      accent: '#f59e0b',
      text: '#1c1917'
    }
  }
];

export function getSavedTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(APP_CONFIG.cacheKeys.theme);
    if (saved && saved !== 'jerusalem' && THEME_OPTIONS.some(t => t.id === saved)) {
      return saved as ThemeId;
    }
  } catch (err) {
    console.warn('Unable to read saved theme:', err);
  }
  return APP_CONFIG.theme;
}

export function saveTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem(APP_CONFIG.cacheKeys.theme, themeId);
  } catch (err) {
    console.warn('Unable to save theme preference:', err);
  }
}

export function isNightTime(currentHour?: number): boolean {
  const hour = currentHour !== undefined ? currentHour : new Date().getHours();
  // Daytime is considered 06:30 to 19:30
  return hour >= 20 || hour < 7;
}

export function getEffectiveTheme(themeId: ThemeId, isShabbatActive?: boolean): ThemeId {
  if (themeId === 'auto') {
    if (isShabbatActive || isNightTime()) {
      return 'midnight';
    }
    return 'jerusalem';
  }
  return themeId;
}

// Generate concrete static CSS rules for older Safari (iOS 9.3.5)
// that does not reliably support CSS custom properties (var(--...))
function getStaticThemeCss(theme: ThemeId): string {
  if (theme === 'sunset_pop') {
    return `
      html, body, [class*="appContainer"] {
        background-color: #180a24 !important;
        color: #fff1f2 !important;
      }
      [class*="backgroundCanvas"] {
        background: linear-gradient(160deg, #180a24 0%, #290f3c 50%, #150620 100%) !important;
      }
      [class*="header"] {
        background: rgba(28, 12, 40, 0.95) !important;
        border-color: rgba(255, 77, 109, 0.25) !important;
        color: #fff1f2 !important;
      }
      [class*="locationTag"], [class*="themeTag"] {
        background: rgba(45, 18, 62, 0.9) !important;
        border-color: rgba(255, 77, 109, 0.4) !important;
        color: #fff1f2 !important;
      }
      [class*="cityName"], [class*="themeName"] {
        color: #fff1f2 !important;
      }
      [class*="hebrewTag"] {
        color: #facc15 !important;
      }
      [class*="digitsWrapper"], [class*="timeSegment"] {
        color: #fff1f2 !important;
        text-shadow: 0 4px 28px rgba(255, 77, 109, 0.3) !important;
      }
      [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
        color: #ff4d6d !important;
        text-shadow: 0 2px 16px rgba(255, 77, 109, 0.6) !important;
      }
      [class*="greetingPill"] {
        background: linear-gradient(135deg, rgba(65, 20, 52, 0.9) 0%, rgba(35, 10, 48, 0.95) 100%) !important;
        border-color: rgba(255, 77, 109, 0.55) !important;
      }
      [class*="greetingText"] {
        color: #fed7aa !important;
      }
      [class*="dateBar"] {
        background: rgba(32, 14, 46, 0.92) !important;
        border-color: rgba(255, 77, 109, 0.3) !important;
      }
      [class*="dateText"], [class*="gregorianDate"] {
        color: #fff1f2 !important;
      }
      [class*="hebrewDateRow"], [class*="hebrewDateHebrew"] {
        color: #facc15 !important;
      }
      [class*="hebrewDateTranslit"] {
        color: #f472b6 !important;
      }
      [class*="shabbatColumn"] [class*="container"], [class*="weatherColumn"] [class*="container"] {
        background: rgba(28, 12, 40, 0.92) !important;
        border-color: rgba(255, 77, 109, 0.35) !important;
        color: #fff1f2 !important;
      }
      [class*="title"] {
        color: #fff1f2 !important;
      }
      [class*="candleCard"] {
        background: linear-gradient(145deg, rgba(75, 20, 45, 0.95) 0%, rgba(55, 15, 35, 0.85) 100%) !important;
        border-color: rgba(255, 77, 109, 0.5) !important;
      }
      [class*="candleTimeValue"] {
        color: #fde047 !important;
      }
      [class*="havdalahCard"] {
        background: linear-gradient(145deg, rgba(45, 20, 70, 0.95) 0%, rgba(30, 15, 55, 0.85) 100%) !important;
        border-color: rgba(192, 132, 252, 0.4) !important;
      }
      [class*="havdalahTimeValue"] {
        color: #e9d5ff !important;
      }
      [class*="dayCard"] {
        background: rgba(40, 18, 58, 0.85) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      [class*="todayCard"] {
        background: linear-gradient(180deg, rgba(95, 25, 55, 0.9) 0%, rgba(45, 18, 70, 0.9) 100%) !important;
        border-color: rgba(255, 77, 109, 0.55) !important;
      }
      [class*="tempMax"] {
        color: #fff1f2 !important;
      }
      [class*="tempMin"] {
        color: #38bdf8 !important;
      }
      [class*="currentTemp"] {
        color: #fb923c !important;
      }
      [class*="currentSummary"] {
        background: rgba(40, 18, 58, 0.9) !important;
        border-color: rgba(251, 146, 60, 0.4) !important;
        color: #fff1f2 !important;
      }
      [class*="currentDesc"] {
        color: #fff1f2 !important;
      }
      [class*="parashaText"] {
        color: #facc15 !important;
      }
    `;
  }

  if (theme === 'cyberpunk') {
    return `
      html, body, [class*="appContainer"] {
        background-color: #070714 !important;
        color: #ffffff !important;
      }
      [class*="backgroundCanvas"] {
        background: linear-gradient(160deg, #070714 0%, #0d0b24 50%, #050510 100%) !important;
      }
      [class*="header"] {
        background: rgba(10, 10, 24, 0.95) !important;
        border-color: rgba(6, 182, 212, 0.3) !important;
        color: #ffffff !important;
      }
      [class*="locationTag"], [class*="themeTag"] {
        background: rgba(18, 18, 42, 0.9) !important;
        border-color: rgba(6, 182, 212, 0.45) !important;
        color: #ffffff !important;
      }
      [class*="cityName"], [class*="themeName"] {
        color: #ffffff !important;
      }
      [class*="hebrewTag"] {
        color: #00f5d4 !important;
      }
      [class*="digitsWrapper"], [class*="timeSegment"] {
        color: #ffffff !important;
        text-shadow: 0 4px 28px rgba(6, 182, 212, 0.3) !important;
      }
      [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
        color: #00f5d4 !important;
        text-shadow: 0 2px 18px rgba(0, 245, 212, 0.7) !important;
      }
      [class*="greetingPill"] {
        background: linear-gradient(135deg, rgba(15, 23, 50, 0.9) 0%, rgba(25, 10, 35, 0.95) 100%) !important;
        border-color: rgba(0, 245, 212, 0.5) !important;
      }
      [class*="greetingText"] {
        color: #00f5d4 !important;
      }
      [class*="dateBar"] {
        background: rgba(13, 11, 36, 0.92) !important;
        border-color: rgba(6, 182, 212, 0.3) !important;
      }
      [class*="dateText"], [class*="gregorianDate"] {
        color: #ffffff !important;
      }
      [class*="hebrewDateRow"], [class*="hebrewDateHebrew"] {
        color: #00f5d4 !important;
      }
      [class*="hebrewDateTranslit"] {
        color: #f472b6 !important;
      }
      [class*="shabbatColumn"] [class*="container"], [class*="weatherColumn"] [class*="container"] {
        background: rgba(13, 11, 36, 0.92) !important;
        border-color: rgba(6, 182, 212, 0.35) !important;
        color: #ffffff !important;
      }
      [class*="title"] {
        color: #ffffff !important;
      }
      [class*="candleCard"] {
        background: linear-gradient(145deg, rgba(50, 15, 35, 0.95) 0%, rgba(35, 10, 25, 0.85) 100%) !important;
        border-color: rgba(244, 63, 94, 0.5) !important;
      }
      [class*="candleTimeValue"] {
        color: #f43f5e !important;
      }
      [class*="havdalahCard"] {
        background: linear-gradient(145deg, rgba(10, 30, 45, 0.95) 0%, rgba(5, 20, 35, 0.85) 100%) !important;
        border-color: rgba(6, 182, 212, 0.45) !important;
      }
      [class*="havdalahTimeValue"] {
        color: #00f5d4 !important;
      }
      [class*="dayCard"] {
        background: rgba(15, 15, 38, 0.85) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      [class*="todayCard"] {
        background: linear-gradient(180deg, rgba(60, 15, 45, 0.9) 0%, rgba(15, 30, 60, 0.9) 100%) !important;
        border-color: rgba(0, 245, 212, 0.6) !important;
      }
      [class*="tempMax"] {
        color: #ffffff !important;
      }
      [class*="tempMin"] {
        color: #38bdf8 !important;
      }
      [class*="currentTemp"] {
        color: #00f5d4 !important;
      }
      [class*="currentSummary"] {
        background: rgba(15, 15, 38, 0.9) !important;
        border-color: rgba(6, 182, 212, 0.4) !important;
        color: #ffffff !important;
      }
      [class*="currentDesc"] {
        color: #ffffff !important;
      }
      [class*="parashaText"] {
        color: #00f5d4 !important;
      }
    `;
  }

  if (theme === 'electric_lime') {
    return `
      html, body, [class*="appContainer"] {
        background-color: #060b17 !important;
        color: #ffffff !important;
      }
      [class*="backgroundCanvas"] {
        background: linear-gradient(160deg, #060b17 0%, #0a1733 50%, #040812 100%) !important;
      }
      [class*="header"] {
        background: rgba(8, 15, 30, 0.95) !important;
        border-color: rgba(163, 230, 53, 0.3) !important;
        color: #ffffff !important;
      }
      [class*="locationTag"], [class*="themeTag"] {
        background: rgba(12, 24, 48, 0.9) !important;
        border-color: rgba(163, 230, 53, 0.45) !important;
        color: #ffffff !important;
      }
      [class*="cityName"], [class*="themeName"] {
        color: #ffffff !important;
      }
      [class*="hebrewTag"] {
        color: #a3e635 !important;
      }
      [class*="digitsWrapper"], [class*="timeSegment"] {
        color: #ffffff !important;
        text-shadow: 0 4px 28px rgba(163, 230, 53, 0.25) !important;
      }
      [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
        color: #a3e635 !important;
        text-shadow: 0 2px 18px rgba(163, 230, 53, 0.7) !important;
      }
      [class*="greetingPill"] {
        background: linear-gradient(135deg, rgba(10, 30, 20, 0.9) 0%, rgba(10, 20, 40, 0.95) 100%) !important;
        border-color: rgba(163, 230, 53, 0.55) !important;
      }
      [class*="greetingText"] {
        color: #bef264 !important;
      }
      [class*="dateBar"] {
        background: rgba(10, 20, 42, 0.92) !important;
        border-color: rgba(163, 230, 53, 0.3) !important;
      }
      [class*="dateText"], [class*="gregorianDate"] {
        color: #ffffff !important;
      }
      [class*="hebrewDateRow"], [class*="hebrewDateHebrew"] {
        color: #a3e635 !important;
      }
      [class*="hebrewDateTranslit"] {
        color: #93c5fd !important;
      }
      [class*="shabbatColumn"] [class*="container"], [class*="weatherColumn"] [class*="container"] {
        background: rgba(10, 20, 42, 0.92) !important;
        border-color: rgba(163, 230, 53, 0.35) !important;
        color: #ffffff !important;
      }
      [class*="title"] {
        color: #ffffff !important;
      }
      [class*="candleCard"] {
        background: linear-gradient(145deg, rgba(30, 45, 15, 0.95) 0%, rgba(20, 35, 10, 0.85) 100%) !important;
        border-color: rgba(163, 230, 53, 0.5) !important;
      }
      [class*="candleTimeValue"] {
        color: #bef264 !important;
      }
      [class*="havdalahCard"] {
        background: linear-gradient(145deg, rgba(15, 25, 55, 0.95) 0%, rgba(10, 18, 45, 0.85) 100%) !important;
        border-color: rgba(96, 165, 250, 0.45) !important;
      }
      [class*="havdalahTimeValue"] {
        color: #93c5fd !important;
      }
      [class*="dayCard"] {
        background: rgba(12, 25, 50, 0.85) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      [class*="todayCard"] {
        background: linear-gradient(180deg, rgba(30, 50, 15, 0.9) 0%, rgba(15, 30, 65, 0.9) 100%) !important;
        border-color: rgba(163, 230, 53, 0.6) !important;
      }
      [class*="tempMax"] {
        color: #ffffff !important;
      }
      [class*="tempMin"] {
        color: #60a5fa !important;
      }
      [class*="currentTemp"] {
        color: #a3e635 !important;
      }
      [class*="currentSummary"] {
        background: rgba(12, 25, 50, 0.9) !important;
        border-color: rgba(163, 230, 53, 0.4) !important;
        color: #ffffff !important;
      }
      [class*="currentDesc"] {
        color: #ffffff !important;
      }
      [class*="parashaText"] {
        color: #a3e635 !important;
      }
    `;
  }

  if (theme === 'midnight') {
    return `
      html, body, [class*="appContainer"] {
        background-color: #080c14 !important;
        color: #f8fafc !important;
      }
      [class*="backgroundCanvas"] {
        background: linear-gradient(160deg, #070a10 0%, #0c121e 50%, #080c14 100%) !important;
      }
      [class*="header"] {
        background: rgba(10, 15, 26, 0.95) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: #f8fafc !important;
      }
      [class*="locationTag"], [class*="themeTag"] {
        background: rgba(20, 30, 48, 0.9) !important;
        border-color: rgba(245, 158, 11, 0.4) !important;
        color: #f8fafc !important;
      }
      [class*="cityName"], [class*="themeName"] {
        color: #f8fafc !important;
      }
      [class*="hebrewTag"] {
        color: #fbbf24 !important;
      }
      [class*="digitsWrapper"], [class*="timeSegment"] {
        color: #f8fafc !important;
        text-shadow: 0 4px 25px rgba(245, 158, 11, 0.15) !important;
      }
      [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
        color: #f59e0b !important;
        text-shadow: 0 2px 14px rgba(245, 158, 11, 0.5) !important;
      }
      [class*="greetingPill"] {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%) !important;
        border-color: rgba(245, 158, 11, 0.5) !important;
      }
      [class*="greetingText"] {
        color: #fbbf24 !important;
      }
      [class*="dateBar"] {
        background: rgba(15, 23, 42, 0.9) !important;
        border-color: rgba(245, 158, 11, 0.3) !important;
      }
      [class*="dateText"], [class*="gregorianDate"] {
        color: #f1f5f9 !important;
      }
      [class*="hebrewDateRow"], [class*="hebrewDateHebrew"] {
        color: #fbbf24 !important;
      }
      [class*="hebrewDateTranslit"] {
        color: #94a3b8 !important;
      }
      [class*="shabbatColumn"] [class*="container"], [class*="weatherColumn"] [class*="container"] {
        background: rgba(13, 20, 36, 0.92) !important;
        border-color: rgba(245, 158, 11, 0.35) !important;
        color: #f8fafc !important;
      }
      [class*="title"] {
        color: #f8fafc !important;
      }
      [class*="candleCard"] {
        background: linear-gradient(145deg, rgba(45, 30, 15, 0.95) 0%, rgba(70, 45, 15, 0.85) 100%) !important;
        border-color: rgba(245, 158, 11, 0.5) !important;
      }
      [class*="candleTimeValue"] {
        color: #fcd34d !important;
      }
      [class*="havdalahCard"] {
        background: linear-gradient(145deg, rgba(25, 25, 60, 0.95) 0%, rgba(35, 30, 80, 0.85) 100%) !important;
        border-color: rgba(165, 180, 252, 0.4) !important;
      }
      [class*="havdalahTimeValue"] {
        color: #c7d2fe !important;
      }
      [class*="dayCard"] {
        background: rgba(20, 30, 52, 0.85) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      [class*="todayCard"] {
        background: linear-gradient(180deg, rgba(65, 45, 15, 0.9) 0%, rgba(20, 45, 75, 0.9) 100%) !important;
        border-color: rgba(245, 158, 11, 0.5) !important;
      }
      [class*="tempMax"] {
        color: #f8fafc !important;
      }
      [class*="tempMin"] {
        color: #38bdf8 !important;
      }
      [class*="currentTemp"] {
        color: #38bdf8 !important;
      }
      [class*="currentSummary"] {
        background: rgba(20, 30, 52, 0.9) !important;
        border-color: rgba(56, 189, 248, 0.4) !important;
        color: #f8fafc !important;
      }
      [class*="currentDesc"] {
        color: #f8fafc !important;
      }
      [class*="parashaText"] {
        color: #fbbf24 !important;
      }
    `;
  }

  if (theme === 'glacier') {
    return `
      html, body, [class*="appContainer"] {
        background-color: #f0f6fc !important;
        color: #0b2545 !important;
      }
      [class*="backgroundCanvas"] {
        background: linear-gradient(160deg, #f0f6fc 0%, #e2ecf7 50%, #d8e5f3 100%) !important;
      }
      [class*="digitsWrapper"], [class*="timeSegment"] {
        color: #0b2545 !important;
      }
      [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
        color: #0284c7 !important;
      }
      [class*="candleTimeValue"] {
        color: #b45309 !important;
      }
      [class*="havdalahTimeValue"] {
        color: #0284c7 !important;
      }
      [class*="parashaText"] {
        color: #0284c7 !important;
      }
      [class*="tempMin"], [class*="currentTemp"] {
        color: #0284c7 !important;
      }
    `;
  }

  if (theme === 'emerald') {
    return `
      html, body, [class*="appContainer"] {
        background-color: #051a14 !important;
        color: #fefce8 !important;
      }
      [class*="backgroundCanvas"] {
        background: linear-gradient(160deg, #051a14 0%, #08261e 50%, #03130e 100%) !important;
      }
      [class*="header"] {
        background: rgba(5, 26, 20, 0.95) !important;
        border-color: rgba(234, 179, 8, 0.25) !important;
      }
      [class*="locationTag"], [class*="themeTag"] {
        background: rgba(10, 40, 32, 0.9) !important;
        border-color: rgba(234, 179, 8, 0.4) !important;
        color: #fefce8 !important;
      }
      [class*="digitsWrapper"], [class*="timeSegment"] {
        color: #fef9c3 !important;
      }
      [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
        color: #eab308 !important;
      }
      [class*="greetingPill"] {
        background: rgba(8, 38, 30, 0.95) !important;
        border-color: rgba(234, 179, 8, 0.5) !important;
      }
      [class*="greetingText"] {
        color: #fef08a !important;
      }
      [class*="dateBar"] {
        background: rgba(6, 30, 22, 0.92) !important;
        border-color: rgba(234, 179, 8, 0.3) !important;
      }
      [class*="dateText"], [class*="gregorianDate"] {
        color: #fefce8 !important;
      }
      [class*="hebrewDateRow"], [class*="hebrewDateHebrew"] {
        color: #facc15 !important;
      }
      [class*="shabbatColumn"] [class*="container"], [class*="weatherColumn"] [class*="container"] {
        background: rgba(6, 28, 22, 0.92) !important;
        border-color: rgba(234, 179, 8, 0.35) !important;
      }
      [class*="title"] {
        color: #fefce8 !important;
      }
      [class*="candleCard"] {
        background: linear-gradient(145deg, rgba(45, 35, 10, 0.95) 0%, rgba(65, 45, 10, 0.85) 100%) !important;
        border-color: rgba(234, 179, 8, 0.5) !important;
      }
      [class*="candleTimeValue"] {
        color: #fef08a !important;
      }
      [class*="havdalahCard"] {
        background: linear-gradient(145deg, rgba(15, 35, 35, 0.95) 0%, rgba(20, 50, 45, 0.85) 100%) !important;
        border-color: rgba(94, 234, 212, 0.35) !important;
      }
      [class*="havdalahTimeValue"] {
        color: #99f6e4 !important;
      }
      [class*="dayCard"] {
        background: rgba(10, 40, 32, 0.85) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      [class*="todayCard"] {
        background: linear-gradient(180deg, rgba(65, 50, 10, 0.9) 0%, rgba(15, 45, 40, 0.9) 100%) !important;
        border-color: rgba(234, 179, 8, 0.5) !important;
      }
      [class*="tempMax"] {
        color: #fef9c3 !important;
      }
      [class*="tempMin"], [class*="currentTemp"] {
        color: #5eead4 !important;
      }
      [class*="currentSummary"] {
        background: rgba(10, 40, 32, 0.9) !important;
        border-color: rgba(94, 234, 212, 0.4) !important;
      }
      [class*="currentDesc"] {
        color: #fefce8 !important;
      }
      [class*="parashaText"] {
        color: #facc15 !important;
      }
    `;
  }

  if (theme === 'terracotta') {
    return `
      html, body, [class*="appContainer"] {
        background-color: #fdf6f0 !important;
        color: #291e17 !important;
      }
      [class*="backgroundCanvas"] {
        background: linear-gradient(160deg, #fdf6f0 0%, #f6ebe1 50%, #eedbc9 100%) !important;
      }
      [class*="digitsWrapper"], [class*="timeSegment"] {
        color: #291e17 !important;
      }
      [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
        color: #ea580c !important;
      }
      [class*="greetingPill"] {
        background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%) !important;
        border-color: #fed7aa !important;
      }
      [class*="greetingText"] {
        color: #9a3412 !important;
      }
      [class*="candleTimeValue"] {
        color: #c2410c !important;
      }
      [class*="havdalahTimeValue"] {
        color: #6b21a8 !important;
      }
      [class*="parashaText"] {
        color: #c2410c !important;
      }
    `;
  }

  // Default: Jerusalem Stone & Honey
  return `
    html, body, [class*="appContainer"] {
      background-color: #faf7f2 !important;
      color: #1c1917 !important;
    }
    [class*="backgroundCanvas"] {
      background: linear-gradient(160deg, #faf7f2 0%, #f3ede2 50%, #eae2d3 100%) !important;
    }
    [class*="header"] {
      background: rgba(255, 255, 255, 0.95) !important;
      border-color: #e7dfd5 !important;
    }
    [class*="digitsWrapper"], [class*="timeSegment"] {
      color: #1c1917 !important;
    }
    [class*="colon"], [class*="secondsColon"], [class*="secondsDigits"] {
      color: #d97706 !important;
    }
    [class*="greetingPill"] {
      background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%) !important;
      border-color: #fde047 !important;
    }
    [class*="greetingText"] {
      color: #92400e !important;
    }
    [class*="dateBar"] {
      background: rgba(255, 255, 255, 0.96) !important;
      border-color: #e7dfd5 !important;
    }
    [class*="dateText"], [class*="gregorianDate"] {
      color: #1c1917 !important;
    }
    [class*="hebrewDateRow"], [class*="hebrewDateHebrew"] {
      color: #b45309 !important;
    }
    [class*="shabbatColumn"] [class*="container"], [class*="weatherColumn"] [class*="container"] {
      background: rgba(255, 255, 255, 0.95) !important;
      border-color: #e7dfd5 !important;
    }
    [class*="shabbatColumn"] [class*="container"] {
      border-color: #fed7aa !important;
    }
    [class*="title"] {
      color: #1c1917 !important;
    }
    [class*="candleCard"] {
      background: linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%) !important;
      border-color: #fde68a !important;
    }
    [class*="candleTimeValue"] {
      color: #b45309 !important;
    }
    [class*="havdalahCard"] {
      background: linear-gradient(145deg, #faf5ff 0%, #ede9fe 100%) !important;
      border-color: #ddd6fe !important;
    }
    [class*="havdalahTimeValue"] {
      color: #4338ca !important;
    }
    [class*="parashaText"] {
      color: #b45309 !important;
    }
    [class*="dayCard"] {
      background: #ffffff !important;
      border-color: #e7dfd5 !important;
    }
    [class*="todayCard"] {
      background: linear-gradient(180deg, #fef3c7 0%, #e0f2fe 100%) !important;
      border-color: #fcd34d !important;
    }
    [class*="tempMax"] {
      color: #1c1917 !important;
    }
    [class*="tempMin"] {
      color: #0284c7 !important;
    }
    [class*="currentTemp"] {
      color: #d97706 !important;
    }
    [class*="currentDesc"] {
      color: #1c1917 !important;
    }
  `;
}

export function applyThemeToDom(effectiveTheme: ThemeId): void {
  const root = document.documentElement;
  const isDark =
    effectiveTheme === 'midnight' ||
    effectiveTheme === 'emerald' ||
    effectiveTheme === 'sunset_pop' ||
    effectiveTheme === 'cyberpunk' ||
    effectiveTheme === 'electric_lime';

  root.setAttribute('data-theme', effectiveTheme);
  root.setAttribute('data-dark', isDark ? 'true' : 'false');
  if (document.body) {
    document.body.setAttribute('data-theme', effectiveTheme);
    document.body.setAttribute('data-dark', isDark ? 'true' : 'false');
  }

  // Inject or update pure static CSS for 100% compatibility with older iPad (iOS 9.3.5)
  try {
    let styleEl = document.getElementById('montre-active-palette') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'montre-active-palette';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = getStaticThemeCss(effectiveTheme);
  } catch (err) {
    console.warn('Unable to inject static theme CSS:', err);
  }
}
