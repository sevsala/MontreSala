import React from 'react';
import { GeoLocation } from '../../types';
import styles from './HeaderBar.module.css';

interface HeaderBarProps {
  location: GeoLocation | null;
  hebrewDateHebrew?: string;
  isOnline: boolean;
  onOpenLocationModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  location,
  hebrewDateHebrew,
  isOnline,
  onOpenLocationModal
}) => {
  return (
    <header className={styles.header}>
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
