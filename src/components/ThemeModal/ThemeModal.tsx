import React from 'react';
import { ThemeId } from '../../types';
import { THEME_OPTIONS } from '../../themes';
import styles from './ThemeModal.module.css';

interface ThemeModalProps {
  isOpen: boolean;
  activeTheme: ThemeId;
  onClose: () => void;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  activeTheme,
  onClose,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <span className={styles.modalIcon}>🎨</span>
            <h3 className={styles.modalTitle}>Choisir la palette de couleurs</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer" type="button">
            ✕
          </button>
        </div>

        {/* Options list */}
        <div className={styles.themeList}>
          {THEME_OPTIONS.map((theme) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                className={`${styles.themeOptionCard} ${isSelected ? styles.selectedCard : ''}`}
                onClick={() => {
                  onSelectTheme(theme.id);
                }}
              >
                <div className={styles.optionLeft}>
                  <div className={styles.optionIcon}>{theme.icon}</div>
                  <div className={styles.optionMeta}>
                    <div className={styles.optionName}>{theme.name}</div>
                    <div className={styles.optionSubtitle}>{theme.subtitle}</div>
                  </div>
                </div>

                <div className={styles.optionRight}>
                  {/* Color preview palette swatch */}
                  <div className={styles.palettePreview} title="Aperçu des couleurs">
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: theme.previewColors.bg }}
                      title="Fond"
                    />
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: theme.previewColors.card }}
                      title="Cartes"
                    />
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: theme.previewColors.accent }}
                      title="Accent"
                    />
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: theme.previewColors.text }}
                      title="Texte"
                    />
                  </div>

                  {isSelected && (
                    <span className={styles.activeBadge}>
                      <span>✓</span>
                      <span>Actif</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerHint}>
            Par défaut : <code>src/config.ts</code> (propriété <code>theme</code>)
          </div>
          <button className={styles.doneBtn} onClick={onClose} type="button">
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
