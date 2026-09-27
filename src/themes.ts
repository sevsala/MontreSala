import { ThemeId, ThemeOption } from './types';
import { APP_CONFIG } from './config';

export const THEME_OPTIONS: ThemeOption[] = [
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
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
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

export function applyThemeToDom(effectiveTheme: ThemeId): void {
  const root = document.documentElement;
  const isDark = effectiveTheme === 'midnight' || effectiveTheme === 'emerald';

  root.setAttribute('data-theme', effectiveTheme);
  root.setAttribute('data-dark', isDark ? 'true' : 'false');
  if (document.body) {
    document.body.setAttribute('data-theme', effectiveTheme);
    document.body.setAttribute('data-dark', isDark ? 'true' : 'false');
  }
}
