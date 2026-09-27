import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShabbatTimes } from '../../types';
import { formatCountdown, parseIsoToTimestamp } from '../../services/hebcalService';
import styles from './ShabbatWidget.module.css';

interface ShabbatWidgetProps {
  shabbatTimes: ShabbatTimes | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export const ShabbatWidget: React.FC<ShabbatWidgetProps> = ({
  shabbatTimes,
  loading = false,
  onRefresh
}) => {
  // Live timestamp ticking every second synchronized to second boundary
  const [now, setNow] = useState<number>(() => Date.now());
  const hasTriggeredRefreshAfterHavdalahRef = useRef(false);

  useEffect(() => {
    let timerId: any;

    const tick = () => {
      setNow(Date.now());
      const delay = 1000 - (Date.now() % 1000);
      timerId = setTimeout(tick, delay);
    };

    const initialDelay = 1000 - (Date.now() % 1000);
    timerId = setTimeout(tick, initialDelay);

    return () => clearTimeout(timerId);
  }, []);

  const candleTimeMs = useMemo(() => {
    if (!shabbatTimes?.candleLighting?.dateStr) return null;
    const ts = parseIsoToTimestamp(shabbatTimes.candleLighting.dateStr);
    return isNaN(ts) ? null : ts;
  }, [shabbatTimes?.candleLighting?.dateStr]);

  const havdalahTimeMs = useMemo(() => {
    if (!shabbatTimes?.havdalah?.dateStr) return null;
    const ts = parseIsoToTimestamp(shabbatTimes.havdalah.dateStr);
    return isNaN(ts) ? null : ts;
  }, [shabbatTimes?.havdalah?.dateStr]);

  // Live real-time check whether Shabbat is active right now
  const isShabbat = useMemo(() => {
    if (candleTimeMs !== null && havdalahTimeMs !== null) {
      return now >= candleTimeMs && now < havdalahTimeMs;
    }
    return Boolean(shabbatTimes?.isShabbatNow);
  }, [candleTimeMs, havdalahTimeMs, now, shabbatTimes?.isShabbatNow]);

  // Live real-time countdown to candle lighting
  const countdown = useMemo(() => {
    if (isShabbat) return null;
    if (candleTimeMs !== null) {
      const diffMs = candleTimeMs - now;
      if (diffMs > 0) {
        return formatCountdown(diffMs);
      }
      return null;
    }
    return shabbatTimes?.timeUntilCandles || null;
  }, [isShabbat, candleTimeMs, now, shabbatTimes?.timeUntilCandles]);

  // Auto-refresh when Shabbat ends (Havdalah passed) to load next cycle
  useEffect(() => {
    if (havdalahTimeMs !== null && now >= havdalahTimeMs) {
      if (!hasTriggeredRefreshAfterHavdalahRef.current) {
        hasTriggeredRefreshAfterHavdalahRef.current = true;
        onRefresh?.();
      }
    } else {
      hasTriggeredRefreshAfterHavdalahRef.current = false;
    }
  }, [havdalahTimeMs, now, onRefresh]);

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

  const candleTime = shabbatTimes?.candleLighting?.time || '--:--';
  const havdalahTime = shabbatTimes?.havdalah?.time || '--:--';
  const parasha = shabbatTimes?.parasha;
  const parashaHebrew = shabbatTimes?.parashaHebrew;
  const holiday = shabbatTimes?.upcomingHoliday;

  // Havdalah subtext: during Shabbat, show live countdown to Havdalah
  const havdalahSub = useMemo(() => {
    if (isShabbat && havdalahTimeMs !== null && havdalahTimeMs > now) {
      const remainingMs = havdalahTimeMs - now;
      const formatted = formatCountdown(remainingMs);
      if (formatted) {
        return `Sortie ${formatted}`;
      }
    }
    return 'Samedi soir (3 étoiles)';
  }, [isShabbat, havdalahTimeMs, now]);

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
          <div className={styles.cardSub}>{havdalahSub}</div>
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
