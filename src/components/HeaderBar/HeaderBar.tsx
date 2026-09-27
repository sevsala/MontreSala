import React from 'react';
import { GeoLocation, ThemeId } from '../../types';
import { THEME_OPTIONS } from '../../themes';
import styles from './HeaderBar.module.css';

interface HeaderBarProps {
  location: GeoLocation | null;
  hebrewDateHebrew?: string;
  isOnline: boolean;
  activeTheme: ThemeId;
  onOpenLocationModal: () => void;
  onOpenThemeModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  location,
  hebrewDateHebrew,
  isOnline,
  activeTheme,
  onOpenLocationModal,
  onOpenThemeModal
}) => {
  const currentTheme = THEME_OPTIONS.find((t) => t.id === activeTheme) || THEME_OPTIONS[0];

  return (
    <header className={styles.header}>
      <div className={styles.leftGroup}>
        <button
          className={styles.locationTag}
          onClick={onOpenLocationModal}
          title="Changer de ville"
          type="button"
        >
          <span className={styles.locationPin}>📍</span>
          <span className={styles.cityName}>
            {location ? `${location.city}${location.country ? `, ${location.country}` : ''}` : 'Chargement...'}
          </span>
          <span className={styles.changeLocationBtn}>Modifier</span>
        </button>

        <button
          className={styles.themeTag}
          onClick={onOpenThemeModal}
          title="Changer de palette de couleurs"
          type="button"
        >
          <span className={styles.themeIcon}>{currentTheme.icon}</span>
          <span className={styles.themeName}>{currentTheme.name.split('&')[0].trim()}</span>
          <span className={styles.changeThemeBtn}>Thème</span>
        </button>
      </div>

      {hebrewDateHebrew && (
        <div className={styles.hebrewTag} dir="rtl">
          <span className={styles.hebrewDate}>{hebrewDateHebrew}</span>
        </div>
      )}

      <div className={styles.statusIndicator}>
        <span className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`} />
        <span className={styles.statusText}>{isOnline ? 'EN DIRECT' : 'HORS LIGNE'}</span>
      </div>
    </header>
  );
};

