// RÉGLAGES D'ASTRO.
// - react() : permet d'utiliser des composants React (ceux de HeroUI) dans les pages.
// - tailwindcss() : fabrique les styles Tailwind dont HeroUI a besoin.
// Le site reste statique : Astro produit des fichiers HTML/CSS/JS dans dist/.
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
