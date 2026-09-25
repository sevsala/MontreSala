import React from 'react';
import { WeatherData } from '../../types';
import { WeatherIcon } from '../common/WeatherIcons';
import styles from './WeatherWidget.module.css';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  loading = false
}) => {
  if (loading && !weather) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>⛅</span>
          <span className={styles.title}>Météo de la semaine</span>
        </div>
        <div className={styles.skeleton}>Chargement des prévisions...</div>
      </div>
    );
  }

  const currentTemp = weather ? weather.currentTemp : '--';
  const currentDesc = weather ? weather.currentWeatherDesc : 'Chargement...';
  const currentIcon = weather ? weather.currentIcon : 'sun';
  const windSpeed = weather ? weather.windSpeed : '--';
  const daily = weather?.daily || [];

  return (
    <div className={styles.container}>
      {/* Widget Header & Current Weather Snapshot */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.headerIcon}>⛅</span>
          <h2 className={styles.title}>Météo de la semaine</h2>
        </div>

        {/* Current Condition Pill */}
        <div className={styles.currentSummary}>
          <WeatherIcon name={currentIcon} size={24} />
          <span className={styles.currentTemp}>{currentTemp}°C</span>
          <span className={styles.currentDesc}>{currentDesc}</span>
          <span className={styles.windInfo}>💨 {windSpeed} km/h</span>
        </div>
      </div>

      {/* 7-Day Forecast Horizontal Strip */}
      <div className={styles.forecastGrid}>
        {daily.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={day.date}
              className={`${styles.dayCard} ${isToday ? styles.todayCard : ''}`}
            >
              <span className={styles.dayName}>{day.dayName}</span>

              <div className={styles.iconWrap}>
                <WeatherIcon name={day.iconName} size={28} />
              </div>

              <div className={styles.tempRange}>
                <span className={styles.tempMax}>{day.tempMax}°</span>
                <span className={styles.tempMin}>{day.tempMin}°</span>
              </div>

              {day.precipitationProb !== undefined && day.precipitationProb > 10 && (
                <div className={styles.precipBadge}>
                  💧 {day.precipitationProb}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
