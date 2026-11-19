# Mon carnet d'apprentissage GitHub
Premier essai.
Deuxième essai corrigé sur une branche.

## Mon OS

Ce dépôt contient mon OS personnel : un site [Astro](https://astro.build) au thème HeroUI (vert #8cc757, clair/sombre), publié par Cloudflare à chaque fusion dans `main`.

- `src/pages/index.astro` : l'accueil (tableau de bord du jour + grille des outils)
- `src/pages/outils/` : une page par outil
- `src/data/outils.js` : la liste des outils affichés sur l'accueil (ajouter un outil = une ligne ici)
- `src/components/` : les pièces réutilisables (barre du haut, tableau de bord, grille d'outils)
- `src/layouts/Gabarit.astro` : le cadre commun à toutes les pages
- `src/styles/global.css` : le thème (HeroUI + couleur principale)
- `public/` : les fichiers publiés tels quels (favicon, application Rack Designer)
- `package.json` : les outils nécessaires et les commandes (`dev`, `build`)
- `astro.config.mjs` : les réglages d'Astro (React, Tailwind)
- `wrangler.jsonc` : les réglages Cloudflare (dossier publié, aperçus de branche)
