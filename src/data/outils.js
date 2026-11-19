// CATALOGUE DES APPS INTÉGRÉES À MOBELE OS.
// Pour ajouter un outil : une entrée de plus ici, et sa page dans src/pages/outils/.
// - id      : identifiant unique (sert à mémoriser l'ordre et la visibilité)
// - etat    : "actif" (cliquable) ou "bientot" (icône estompée, pas encore intégrée)
// - couleur : les deux teintes du dégradé de l'icône
// - icone   : le dessin (tracés SVG sur une grille de 24 × 24, en blanc sur le dégradé)
// Les raccourcis vers des sites externes ne sont pas ici : ils s'ajoutent depuis
// la page Réglages et sont enregistrés chez Cloudflare.

export const outils = [
  {
    id: "rack-designer",
    nom: "Rack Designer",
    adresse: "/outils/rack-designer/",
    etat: "actif",
    couleur: ["#9fd36a", "#5f9f2f"],
    icone: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M7 7h10M7 11h10M7 15h10M7 19h4"/>',
  },
  {
    id: "suivi-magazine",
    nom: "Suivi magazine",
    etat: "bientot",
    couleur: ["#ff8a65", "#d84315"],
    icone: '<path d="M2.5 5.5c3-1.5 6.5-1.5 9.5.5 3-2 6.5-2 9.5-.5v14c-3-1.5-6.5-1.5-9.5.5-3-2-6.5-2-9.5-.5z"/><path d="M12 6v14"/>',
  },
  {
    id: "suivi-missions",
    nom: "Suivi missions",
    etat: "bientot",
    couleur: ["#64b5f6", "#1565c0"],
    icone: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  },
  {
    id: "phototheque",
    nom: "Photothèque",
    etat: "bientot",
    couleur: ["#ba68c8", "#6a1b9a"],
    icone: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  },
  {
    id: "convertisseur-webp",
    nom: "WebP",
    adresse: "/outils/convertisseur-webp/",
    etat: "actif",
    couleur: ["#4db6ac", "#00695c"],
    icone: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
  },
];
