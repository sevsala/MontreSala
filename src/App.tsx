import React, { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from './config';
import { GeoLocation, ShabbatTimes, WeatherData } from './types';
import {
  detectLocation,
  saveManualLocation,
  clearManualLocation
} from './services/geoService';
import { fetchShabbatTimes } from './services/hebcalService';
import { fetchWeatherData } from './services/weatherService';
import { useWakeLock } from './hooks/useWakeLock';
import { HeaderBar } from './components/HeaderBar/HeaderBar';
import { Clock } from './components/Clock/Clock';
import { ShabbatWidget } from './components/ShabbatWidget/ShabbatWidget';
import { WeatherWidget } from './components/WeatherWidget/WeatherWidget';
import { LocationModal } from './components/LocationModal/LocationModal';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import styles from './App.module.css';

export const App: React.FC = () => {
  // Prevent tablet / kiosk screen sleep
  useWakeLock();

  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [shabbatTimes, setShabbatTimes] = useState<ShabbatTimes | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [loadingShabbat, setLoadingShabbat] = useState<boolean>(true);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Load location once at boot
  useEffect(() => {
    let isMounted = true;

    async function initLocation() {
      const loc = await detectLocation();
      if (isMounted) {
        setLocation(loc);
      }
    }

    initLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Shabbat & Weather data based on location
  const refreshData = useCallback(async (currentLoc: GeoLocation) => {
    // Fetch Shabbat
    try {
      const shabbatData = await fetchShabbatTimes(currentLoc);
      setShabbatTimes(shabbatData);
    } catch (err) {
      console.warn('Failed to load Shabbat data:', err);
    } finally {
      setLoadingShabbat(false);
    }

    // Fetch Weather
    try {
      const weatherData = await fetchWeatherData(currentLoc);
      setWeather(weatherData);
    } catch (err) {
      console.warn('Failed to load weather data:', err);
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    if (!location) return;

    // Initial fetch
    refreshData(location);

    // Periodic refresh for Shabbat
    const shabbatInterval = setInterval(() => {
      fetchShabbatTimes(location).then(setShabbatTimes).catch(() => {});
    }, APP_CONFIG.shabbat.refreshIntervalMs);

    // Periodic refresh for Weather
    const weatherInterval = setInterval(() => {
      fetchWeatherData(location).then(setWeather).catch(() => {});
    }, APP_CONFIG.weather.refreshIntervalMs);

    return () => {
      clearInterval(shabbatInterval);
      clearInterval(weatherInterval);
    };
  }, [location, refreshData]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (location) {
        refreshData(location);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location, refreshData]);

  // Handlers for manual location selection
  const handleSelectLocation = useCallback(
    (newLoc: GeoLocation) => {
      saveManualLocation(newLoc);
      setLocation(newLoc);
      setLoadingShabbat(true);
      setLoadingWeather(true);
      refreshData(newLoc);
    },
    [refreshData]
  );

  const handleResetAuto = useCallback(async () => {
    clearManualLocation();
    setLoadingShabbat(true);
    setLoadingWeather(true);
    const loc = await detectLocation();
    setLocation(loc);
    refreshData(loc);
  }, [refreshData]);

  return (
    <div className={styles.appContainer}>
      {/* Background ambient gradient */}
      <div className={styles.backgroundCanvas} />

      {/* Top Header Bar */}
      <HeaderBar
        location={location}
        hebrewDateHebrew={shabbatTimes?.hebrewDateHebrew}
        isOnline={isOnline}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Dominant Big Digital Clock */}
        <section className={styles.clockSection}>
          <ErrorBoundary fallbackTitle="Erreur d'horloge">
            <Clock
              hebrewDateStr={shabbatTimes?.hebrewDateStr}
              hebrewDateHebrew={shabbatTimes?.hebrewDateHebrew}
            />
          </ErrorBoundary>
        </section>

        {/* Widgets Strip Below Clock */}
        <section className={styles.widgetsSection}>
          {/* Shabbat & Jewish Times Widget */}
          <div className={styles.shabbatColumn}>
            <ErrorBoundary fallbackTitle="Horaires de Chabbat momentanément indisponibles">
              <ShabbatWidget
                shabbatTimes={shabbatTimes}
                loading={loadingShabbat}
              />
            </ErrorBoundary>
          </div>

          {/* 7-Day Weather Widget */}
          <div className={styles.weatherColumn}>
            <ErrorBoundary fallbackTitle="Prévisions météo momentanément indisponibles">
              <WeatherWidget
                weather={weather}
                loading={loadingWeather}
              />
            </ErrorBoundary>
          </div>
        </section>
      </main>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        currentLocation={location}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        onResetAuto={handleResetAuto}
      />
    </div>
  );
};

export default App;
