# Guide de Démarrage - VoyageBj

Bienvenue sur le projet VoyageBj. Voici comment lancer et travailler sur le projet.

## Prérequis
- Node.js (v18+ recommandé)
- npm ou yarn

## Installation
Installez les dépendances du projet après clonage du repo :
```bash
npm install
# ou
yarn install
```

## Lancer le serveur de développement
Pour démarrer l'application en local :
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173` (par défaut).

## Construire pour la production
Pour compiler le projet :
```bash
npm run build
```
Les fichiers compilés seront dans le dossier `dist/`.

## Structure du Code
Le code est organisé par fonctionnalités dans `src/features`.
- Si vous travaillez sur l'espace compagnie, allez dans `src/features/company`.
- Si vous modifiez des composants globaux (Navbar, Footer), allez dans `src/shared/components`.

## Bonnes Pratiques
- Utilisez des chemins relatifs pour les imports internes à une feature.
- Utilisez les composants partagés de `src/shared/components` pour garder une UI cohérente.
- Commentez votre code en français pour faciliter la compréhension.
