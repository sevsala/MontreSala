import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../../config';
import styles from './Clock.module.css';

interface ClockProps {
  hebrewDateStr?: string;
  hebrewDateHebrew?: string;
  utcOffsetSeconds?: number;
}

export const Clock: React.FC<ClockProps> = ({
  hebrewDateStr,
  hebrewDateHebrew,
  utcOffsetSeconds
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Synchronize precisely with system clock tick
    let timerId: any;

    const tick = () => {
      setTime(new Date());
      const now = Date.now();
      const delay = 1000 - (now % 1000);
      timerId = setTimeout(tick, delay);
    };

    const initialDelay = 1000 - (Date.now() % 1000);
    timerId = setTimeout(tick, initialDelay);

    return () => clearTimeout(timerId);
  }, []);

  const hasOffset = typeof utcOffsetSeconds === 'number';
  const effectiveDate = hasOffset
    ? new Date(time.getTime() + (utcOffsetSeconds as number) * 1000)
    : time;

  const hours = String(hasOffset ? effectiveDate.getUTCHours() : effectiveDate.getHours()).padStart(2, '0');
  const minutes = String(hasOffset ? effectiveDate.getUTCMinutes() : effectiveDate.getMinutes()).padStart(2, '0');
  const seconds = String(hasOffset ? effectiveDate.getUTCSeconds() : effectiveDate.getSeconds()).padStart(2, '0');

  // Format Gregorian date in French
  const dayIndex = hasOffset ? effectiveDate.getUTCDay() : effectiveDate.getDay();
  const monthIndex = hasOffset ? effectiveDate.getUTCMonth() : effectiveDate.getMonth();
  const dayNumber = hasOffset ? effectiveDate.getUTCDate() : effectiveDate.getDate();
  const yearNumber = hasOffset ? effectiveDate.getUTCFullYear() : effectiveDate.getFullYear();
  const hourNumber = hasOffset ? effectiveDate.getUTCHours() : effectiveDate.getHours();

  const dayName = getDayNameFr(dayIndex);
  const monthName = getMonthNameFr(monthIndex);
  const fullGregorianDate = `${dayName} ${dayNumber} ${monthName} ${yearNumber}`;

  // Cheerful greeting adapted to time and Jewish week
  const greeting = getCheerfulGreeting(dayIndex, hourNumber);

  return (
    <div className={styles.clockContainer}>
      {/* Ambient background glow orb */}
      <div className={styles.ambientGlow} />

      {/* Cheerful Friendly Greeting Pill */}
      <div className={styles.greetingPill}>
        <span className={styles.greetingIcon}>{greeting.icon}</span>
        <span className={styles.greetingText}>{greeting.text}</span>
      </div>

      {/* Main Digital Time Display */}
      <div className={styles.timeDisplay}>
        <div className={styles.digitsWrapper}>
          <span className={styles.timeSegment}>{hours}</span>
          <span className={styles.colon}>:</span>
          <span className={styles.timeSegment}>{minutes}</span>
          {APP_CONFIG.clock.showSeconds && (
            <span className={styles.secondsBlock}>
              <span className={styles.secondsColon}>:</span>
              <span className={styles.secondsDigits}>{seconds}</span>
            </span>
          )}
        </div>
      </div>

      {/* Date Sub-Bar */}
      <div className={styles.dateBar}>
        <div className={styles.gregorianDate}>
          <span className={styles.calendarIcon}>📅</span>
          <span className={styles.dateText}>{fullGregorianDate}</span>
        </div>

        {APP_CONFIG.clock.showHebrewDate && (hebrewDateStr || hebrewDateHebrew) && (
          <div className={styles.hebrewDateRow}>
            <span className={styles.menorahIcon}>🕎</span>
            {hebrewDateHebrew && (
              <span className={styles.hebrewDateHebrew} dir="rtl">
                {hebrewDateHebrew}
              </span>
            )}
            {hebrewDateStr && (
              <span className={styles.hebrewDateTranslit}>
                ({hebrewDateStr})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function getDayNameFr(dayIndex: number): string {
  const days = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi'
  ];
  return days[dayIndex];
}

function getMonthNameFr(monthIndex: number): string {
  const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ];
  return months[monthIndex];
}

function getCheerfulGreeting(day: number, hour: number): { text: string; icon: string } {
  if (day === 5 && hour >= 13) {
    return { text: 'Chabbat Chalom !', icon: '🕯️✨' };
  }
  if (day === 6 && hour < 20) {
    return { text: 'Chabbat Chalom !', icon: '🍷✨' };
  }
  if (day === 6 && hour >= 20) {
    return { text: 'Chavoua Tov !', icon: '✨' };
  }
  if (day === 0 && hour < 13) {
    return { text: 'Chavoua Tov & Belle semaine', icon: '☀️' };
  }
  if (hour >= 5 && hour < 12) {
    return { text: 'Bonjour & Belle journée', icon: '☀️' };
  }
  if (hour >= 12 && hour < 18) {
    return { text: 'Bon après-midi', icon: '🌤️' };
  }
  if (hour >= 18 && hour < 23) {
    return { text: 'Bonne soirée', icon: '🌙' };
  }
  return { text: 'Douce nuit', icon: '✨' };
}
