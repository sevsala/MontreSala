# Montre Kiosk - Horloge Digitale, Chabbat & Météo

Une application React conçue comme un tableau de bord d'affichage mural ou écran connecté (kiosk), **hautement compatible avec les anciens appareils** (anciennes tablettes iPad 2/3/4, tablettes Android sous anciennes versions de Chrome, etc.).

---

## 🌟 Fonctionnalités

1. **Grande Horloge Digitale "Cyber Glow"** :
   - Affichage XXL des heures et minutes avec halo lumineux cyan/bleu glacier.
   - Secondes synchronisées à la milliseconde près pour un affichage fluide et sans à-coups.
   - Deux-points (`:`) clignotants animés.
   - Date grégorienne complète en français (ex: *Vendredi 25 Septembre 2026*).
   - Date hébraïque complète en hébreu et translittérée (ex: *כ״ה באלול תשפ״ו*).

2. **Widget Chabbat & Fêtes Juives (API Hebcal)** :
   - Heure exacte d'allumage des bougies (*Hadlakat Nerot*) pour le vendredi ou veille de fête.
   - Heure de Havdalah (*Motsé Chabbat*) calculée (50 min après coucher du soleil).
   - Nom de la Paracha de la semaine en hébreu et français (ex: *פרשת נצבים-וילך • Nitzavim-Vayeilech*).
   - Décompte avant allumage ou badge animé *"Chabbat Chalom ! 🍷"* pendant Chabbat.
   - Prochaine fête juive (Roch Hachana, Yom Kippour, Souccot, Pessa'h, etc.).

3. **Widget Météo sur 7 Jours (API Open-Meteo)** :
   - Température actuelle (°C), description météo en français, vitesse du vent.
   - Prévisions sur 7 jours : nom du jour, icône SVG vectorielle légère, températures max/min, probabilité de pluie.
   - 100% gratuit, sans clé API requise.

4. **Conception Spéciale pour Écrans et Anciennes Tablettes** :
   - **Mode Kiosk / Non-interactif** : aucun clic requis, s'adapte à 100% de la hauteur de l'écran sans barres de défilement.
   - **Anti-veille (Screen Wake Lock)** : empêche l'écran de la tablette de s'éteindre ou de se mettre en veille (avec dégradation douce sur navigateurs anciens).
   - **Compatibilité Rétro (Legacy Browsers)** :
     - Plugin `@vitejs/plugin-legacy` générant automatiquement un bundle ES5/SystemJS avec polyfills (`core-js`, `regenerator-runtime`) pour Safari iOS 9+ et Chrome 49+.
     - CSS Modules préfixés automatiquement via Autoprefixer (`-webkit-`, `-moz-`).
     - Icônes météo SVG intégrées (aucun CDN externe risquant d'échouer sur les vieux certificats SSL).
   - **Résilience Réseau** :
     - Mise en cache automatique dans `localStorage` des horaires de Chabbat et de la météo : l'affichage reste complet même en cas de coupure Wi-Fi temporaire.
     - Rafraîchissement automatique en arrière-plan et reconnexion immédiate dès le retour du réseau.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (testé compatible de Node 14 à Node 20+)
- npm

### Installation
```bash
npm install
```

### Lancement pour iPad / Anciens Appareils (iOS 9.3.5)
> [!IMPORTANT]
> Safari sur iOS 9.3.5 ne supporte pas les modules ES natifs du mode `dev`. Vous devez lancer le serveur avec la version compilée (legacy) :
```bash
npm start
# (ou npm run build && npm run preview)
```
Le serveur démarre sur le port 3000 avec tous les polyfills (`whatwg-fetch`, `core-js`, SystemJS) requis pour iOS 9.3.5.

### Lancement en mode Développement (Navigateurs Récents uniquement)
```bash
npm run dev
```
Le dossier `dist/` contiendra la version moderne et la version legacy (compatible avec les anciens navigateurs).

---

## 📱 Utilisation sur une Ancienne Tablette / iPad

### Sur iPad (iOS 9 / 10 / 12 / etc.) :
1. Connectez l'iPad au même réseau Wi-Fi que l'ordinateur (ou déployez le dossier `dist/` sur un hébergement web).
2. Ouvrez **Safari** et accédez à l'adresse IP locale (ex: `http://192.168.1.50:3000`).
3. Cliquez sur le bouton de partage de Safari et choisissez **"Sur l'écran d'accueil"** (*Add to Home Screen*).
4. Lancez l'application depuis la nouvelle icône : elle s'ouvrira en **plein écran sans barres d'adresse**.

### Sur Tablette Android :
1. Ouvrez le navigateur Chrome et accédez à l'adresse.
2. Menu (3 points) > **"Ajouter à l'écran d'accueil"** ou installez une application comme **Fully Kiosk Browser** pour un mode kiosque verrouillé.

---

## ⚙️ Configuration (`src/config.ts`)

Vous pouvez personnaliser les réglages dans [src/config.ts](file:///Users/severinesala/Documents/vibepepe/MontreSala/src/config.ts) :

- `autoDetectLocation` : `true` pour détecter automatiquement la ville via l'adresse IP.
- `defaultLocation` : Coordonnées de repli (par défaut Jérusalem, modifiable pour Paris, Tel Aviv, etc.).
- `clock.use24Hour` : Format 24h (`true`) ou 12h (`false`).
- `shabbat.havdalahMinutesPastSunset` : Nombre de minutes après le coucher du soleil pour la Havdalah (50 min par défaut).
- `weather.forecastDays` : Nombre de jours de prévisions météo (7 jours par défaut).
