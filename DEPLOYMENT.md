# 🚀 Guide Complet de Déploiement & Mise à Jour — MontreSala Kiosk

Ce guide détaille **comment mettre à jour le site en ligne (Vercel)**, **comment le faire tourner en local sur votre réseau domestique (pour iPad / tablette murale)**, et comment modifier la configuration (thèmes, villes, horaires).

---

## 📋 Table des Matières
1. [Mettre à jour le site en ligne (Déploiement Automatique GitHub / Vercel)](#1-mettre-à-jour-le-site-en-ligne-automatique)
2. [Déploiement manuel via Vercel CLI (Sans Git)](#2-déploiement-manuel-via-vercel-cli)
3. [Serveur Local pour iPad & Écran Mural (Réseau Domestique)](#3-serveur-local-pour-ipad--écran-mural)
4. [Personnalisation (Thèmes, Ville par défaut, Chabbat)](#4-personnalisation-rapide)
5. [Résolution des problèmes (Troubleshooting)](#5-résolution-des-problèmes)

---

## 1. Mettre à jour le site en ligne (Automatique)

Le projet est relié au dépôt GitHub **[sevsala/MontreSala](https://github.com/sevsala/MontreSala)**.  
Chaque fois que vous poussez des modifications sur la branche `main`, **Vercel détecte le commit, compile le projet (`npm run build`) et met à jour le site en ligne automatiquement en moins de 60 secondes**.

### Procédure pas à pas depuis le terminal :

```bash
# 1. Vérifiez les fichiers que vous avez modifiés
git status

# 2. Ajoutez tous les fichiers modifiés
git add .

# 3. Créez un commit avec un message explicatif
git commit -m "Mise à jour : nouveaux styles et réglages"

# 4. Envoyez sur GitHub (déclenche le déploiement Vercel automatique)
git push origin main
```

> [!TIP]
> Une fois le `git push` terminé, vous pouvez ouvrir votre tableau de bord **[vercel.com](https://vercel.com)** pour voir la progression de la mise en ligne en direct.

---

## 2. Déploiement manuel via Vercel CLI

Si vous préférez déployer directement depuis votre terminal sans passer par Git :

```bash
# Déploiement direct en production
npx vercel --prod
```

Si c'est votre première fois :
1. Vercel vous demandera de vous connecter (via navigateur ou email).
2. Sélectionnez le projet `MontreSala`.
3. Vercel lira le fichier `vercel.json` et déploiera automatiquement le dossier `dist/`.

---

## 3. Serveur Local pour iPad & Écran Mural

Pour une ancienne tablette (iPad 2/3/4 sous iOS 9.3.5) ou un écran fixé au mur, le projet intègre un serveur Node.js avec proxy API et polyfills legacy.

### Lancer ou redémarrer le serveur local :

```bash
# 1. Se placer dans le dossier du projet
cd /Users/severinesala/Documents/vibepepe/MontreSala

# 2. Compiler la dernière version et lancer le serveur (Port 3000)
npm start
```
*(Le script `npm start` exécute automatiquement `npm run build` puis `node server.js`)*.

### Trouver l'adresse IP de votre ordinateur sur le réseau Wi-Fi :
Dans votre terminal :
```bash
ipconfig getifaddr en0
# ou bien :
ifconfig | grep "inet " | grep -v 127.0.0.1
```
*Exemple de résultat : `192.168.1.50`*

### Afficher sur la tablette / iPad :
1. Connectez la tablette sur le **même réseau Wi-Fi** que votre ordinateur.
2. Ouvrez **Safari** et tapez :  
   `http://192.168.1.50:3000` *(remplacez par votre IP locale)*  
   *(ou l'URL de votre site Vercel si la tablette est connectée à Internet)*.
3. Cliquez sur le bouton de partage de Safari (icône avec un carré et une flèche) et choisissez **"Sur l'écran d'accueil"** (*Add to Home Screen*).
4. Lancez MontreSala depuis cette nouvelle icône : **l'application s'ouvre en plein écran sans barre d'adresse ni boutons de navigation**, avec anti-veille automatique !

---

## 4. Personnalisation Rapide

### A. Changer la palette de couleurs
* **Depuis l'écran :** Cliquez sur le bouton `🎨 Thème` en haut à gauche pour choisir parmi les 6 presets en direct (Jérusalem Stone, Midnight Luxury, Glacier, Émeraude, Terracotta, Auto Jour/Nuit).
* **Par défaut dans le code :** Modifiez [src/config.ts](src/config.ts) :
  ```typescript
  theme: 'jerusalem', // Options: 'jerusalem' | 'midnight' | 'glacier' | 'emerald' | 'terracotta' | 'auto'
  ```

### B. Changer la ville par défaut
Dans [src/config.ts](src/config.ts) :
```typescript
defaultLocation: {
  city: 'Haïfa', // ou 'Jérusalem', 'Tel Aviv', 'Paris', etc.
  country: 'Israël',
  latitude: 32.7940,
  longitude: 34.9896,
  timezone: 'Asia/Jerusalem',
  geonameid: 294801
},
```

### C. Ajuster les horaires de Chabbat
Dans [src/config.ts](src/config.ts) :
```typescript
shabbat: {
  havdalahMinutesPastSunset: 50, // 50 min (Rabeinu Tam) ou 42 min / 72 min
  candleLightingMinutesBeforeSunset: 18, // 18 min (ou 40 min pour Jérusalem)
},
```

---

## 5. Résolution des Problèmes

### L'écran de l'iPad affiche une ancienne version après mise à jour :
* **Safari garde les fichiers en cache.** Pour forcer la mise à jour :
  1. Fermez l'application plein écran (double-clic bouton Home -> glisser vers le haut).
  2. Allez dans **Réglages > Safari > Avancé > Données de sites** et supprimez les données pour le site.
  3. Relancez l'application.

### Erreur `address already in use 0.0.0.0:3000` :
Un ancien serveur tourne déjà en arrière-plan. Pour le libérer :
```bash
# Trouver le processus et le fermer :
lsof -ti :3000 | xargs kill -9
# Puis relancer :
npm start
```

### Compatibilité anciens navigateurs (iOS 9.3.5 / Safari 9) :
* Le plugin Vite `@vitejs/plugin-legacy` génère automatiquement deux versions lors du `npm run build` :
  - Un bundle moderne ES modules (`index.html`)
  - Un bundle ES5 compatible avec polyfills (`SystemJS`, `whatwg-fetch`, `core-js`).
* Toutes les icônes météo sont en SVG inline, évitant les échecs de certificats SSL sur les vieux systèmes.
