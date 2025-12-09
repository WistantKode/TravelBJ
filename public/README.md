# Dossier Public

Ce dossier contient les ressources statiques publiques de l'application VoyageBj.

## Contenu

### favicon.png
Icône de l'application VoyageBj affichée dans les onglets du navigateur.

**Caractéristiques:**
- Format: PNG
- Taille: 512x512px (optimisé pour toutes les résolutions)
- Design: Bus stylisé sur fond vert (#008751) avec accents aux couleurs du drapeau béninois
- Usage: Favicon, Apple Touch Icon, icône d'application

**Références dans le code:**
```html
<link rel="icon" type="image/png" sizes="32x32" href="/public/favicon.png">
<link rel="icon" type="image/png" sizes="16x16" href="/public/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/public/favicon.png">
```

## Ajout de nouvelles ressources

Pour ajouter de nouvelles ressources publiques:
1. Placez le fichier dans ce dossier `/public`
2. Référencez-le dans votre code avec le chemin `/public/nom-du-fichier`
3. Documentez-le dans ce README
