import React from 'react';
import { ShabbatTimes } from '../../types';
import styles from './ShabbatWidget.module.css';

interface ShabbatWidgetProps {
  shabbatTimes: ShabbatTimes | null;
  loading?: boolean;
}

export const ShabbatWidget: React.FC<ShabbatWidgetProps> = ({
  shabbatTimes,
  loading = false
}) => {
  if (loading && !shabbatTimes) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.titleIcon}>🕯️</span>
          <span className={styles.title}>Horaires de Chabbat</span>
        </div>
        <div className={styles.skeleton}>Chargement des horaires...</div>
      </div>
    );
  }

  const isShabbat = shabbatTimes?.isShabbatNow;
  const candleTime = shabbatTimes?.candleLighting?.time || '--:--';
  const havdalahTime = shabbatTimes?.havdalah?.time || '--:--';
  const parasha = shabbatTimes?.parasha;
  const parashaHebrew = shabbatTimes?.parashaHebrew;
  const countdown = shabbatTimes?.timeUntilCandles;
  const holiday = shabbatTimes?.upcomingHoliday;

  return (
    <div className={`${styles.container} ${isShabbat ? styles.isShabbatActive : ''}`}>
      {/* Widget Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.titleIcon}>🕯️</span>
          <h2 className={styles.title}>Chabbat & Zmanim</h2>
        </div>

        {/* Status Pill */}
        {isShabbat ? (
          <div className={styles.statusShabbatNow}>
            <span className={styles.pulseDot} />
            <span>Chabbat Chalom ! 🍷</span>
          </div>
        ) : countdown ? (
          <div className={styles.statusCountdown}>
            <span>Allumage {countdown}</span>
          </div>
        ) : null}
      </div>

      {/* Main Times Grid */}
      <div className={styles.timesGrid}>
        {/* Candle Lighting */}
        <div className={`${styles.timeCard} ${styles.candleCard}`}>
          <div className={styles.cardIconRow}>
            <span className={styles.flameIcon}>🕯️</span>
            <span className={styles.cardLabel}>Allumage des bougies</span>
          </div>
          <div className={`${styles.cardTimeValue} ${styles.candleTimeValue}`}>{candleTime}</div>
          <div className={styles.cardSub}>
            Vendredi ({shabbatTimes?.candleLightingMinutesBeforeSunset || 18} min avant coucher)
          </div>
        </div>

        {/* Havdalah */}
        <div className={`${styles.timeCard} ${styles.havdalahCard}`}>
          <div className={styles.cardIconRow}>
            <span className={styles.moonIcon}>✨</span>
            <span className={styles.cardLabel}>Sortie de Chabbat</span>
          </div>
          <div className={`${styles.cardTimeValue} ${styles.havdalahTimeValue}`}>{havdalahTime}</div>
          <div className={styles.cardSub}>Samedi soir (3 étoiles)</div>
        </div>
      </div>

      {/* Bottom Info Bar: Parasha & Upcoming Holiday */}
      <div className={styles.footerInfo}>
        {parasha && (
          <div className={styles.parashaBlock}>
            <span className={styles.infoLabel}>Paracha :</span>
            <span className={styles.parashaText}>
              {parashaHebrew ? `${parashaHebrew} • ` : ''}
              {parasha.replace('Parashat ', '')}
            </span>
          </div>
        )}

        {holiday && (
          <div className={styles.holidayBlock}>
            <span className={styles.holidayBadge}>Prochaine fête</span>
            <span className={styles.holidayTitle}>
              {holiday.hebrewTitle ? `${holiday.hebrewTitle} ` : ''}
              ({holiday.title})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
