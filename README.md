# Mon carnet d'apprentissage GitHub
Premier essai.
Deuxième essai corrigé sur une branche.

## Le site

Ce dépôt contient un mini-site [Astro](https://astro.build), publié par Cloudflare à chaque fusion dans `main`.

- `src/pages/` : chaque fichier devient une page du site
- `src/components/` : les pièces réutilisables (en-tête, planning)
- `src/layouts/` : le gabarit commun à toutes les pages
- `src/styles/` : l'apparence commune
- `package.json` : les outils nécessaires et les commandes (`dev`, `build`)
- `astro.config.mjs` : les réglages d'Astro

Réglages Cloudflare (projet Workers) : commande de compilation `npm run build` dans le tableau de bord ; le dossier publié (`dist`) est indiqué dans `wrangler.jsonc`.
