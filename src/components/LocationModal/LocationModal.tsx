import React, { useState, useEffect } from 'react';
import { GeoLocation } from '../../types';
import {
  PRESET_LOCATIONS,
  searchCities,
  hasManualLocation
} from '../../services/geoService';
import styles from './LocationModal.module.css';

interface LocationModalProps {
  isOpen: boolean;
  currentLocation: GeoLocation | null;
  onClose: () => void;
  onSelectLocation: (location: GeoLocation) => void;
  onResetAuto: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  currentLocation,
  onClose,
  onSelectLocation,
  onResetAuto
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchCities(query);
      setSearchResults(results);
      setSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const isManual = hasManualLocation();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <span className={styles.modalIcon}>📍</span>
            <h3 className={styles.modalTitle}>Modifier la localisation</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {/* Current Location Badge */}
        {currentLocation && (
          <div className={styles.currentBadge}>
            <span className={styles.currentLabel}>Ville actuelle :</span>
            <span className={styles.currentValue}>
              {currentLocation.city}, {currentLocation.country}
            </span>
            {isManual && <span className={styles.manualTag}>Manuel</span>}
          </div>
        )}

        {/* Search Input */}
        <div className={styles.searchSection}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher une ville (ex: Petah Tikva, Paris, Nice...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {searching && <span className={styles.searchingText}>Recherche...</span>}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={styles.resultsList}>
            <div className={styles.sectionTitle}>Résultats de recherche :</div>
            {searchResults.map((loc, i) => (
              <button
                key={`${loc.city}-${loc.country}-${i}`}
                className={styles.resultItem}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
              >
                <span className={styles.cityNameBold}>{loc.city}</span>
                <span className={styles.countrySub}>{loc.country}</span>
              </button>
            ))}
          </div>
        )}

        {/* Preset Communities */}
        <div className={styles.presetsSection}>
          <div className={styles.sectionTitle}>Villes fréquentes :</div>
          <div className={styles.presetGrid}>
            {PRESET_LOCATIONS.map((loc) => {
              const isSelected =
                currentLocation?.city.toLowerCase() === loc.city.toLowerCase();
              return (
                <button
                  key={`${loc.city}-${loc.country}`}
                  className={`${styles.presetChip} ${isSelected ? styles.presetSelected : ''}`}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                >
                  {loc.city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button
            className={styles.resetBtn}
            onClick={() => {
              onResetAuto();
              onClose();
            }}
          >
            🔄 Rétablir détection automatique par IP
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
