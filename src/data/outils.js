// LISTE DES OUTILS DE L'OS.
// Pour ajouter un outil : une ligne de plus ici, et sa page dans src/pages/outils/.
// - etat "actif"  : l'icône est cliquable
// - etat "bientot" : l'icône est affichée grisée, avec la mention « À venir »
// - icone : le dessin de l'icône (tracés SVG sur une grille de 24 × 24)

export const outils = [
  {
    nom: "Rack Designer",
    description: "Conception de racks techniques 19\" et 9,5\"",
    adresse: "/outils/rack-designer/",
    etat: "actif",
    icone: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M7 7h10M7 11h10M7 15h10M7 19h4"/><circle cx="16" cy="19" r=".6" fill="currentColor"/>',
  },
  {
    nom: "Planning d'essai",
    description: "Le mini-planning de l'apprentissage GitHub",
    adresse: "/planning/",
    etat: "actif",
    icone: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h3M13.5 13.5h3M7.5 17h3"/>',
  },
  {
    nom: "Suivi des missions",
    description: "Articles, facturation et reporting",
    etat: "bientot",
    icone: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  },
  {
    nom: "Propositions commerciales",
    description: "Études techniques multiroom",
    etat: "bientot",
    icone: '<path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5v5h5M9 13h6M9 17h6"/>',
  },
  {
    nom: "Photothèque presse",
    description: "Catalogue des photos presse",
    etat: "bientot",
    icone: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  },
  {
    nom: "Suivi magazine",
    description: "Fabrication et chemin de fer",
    etat: "bientot",
    icone: '<path d="M2.5 5.5c3-1.5 6.5-1.5 9.5.5 3-2 6.5-2 9.5-.5v14c-3-1.5-6.5-1.5-9.5.5-3-2-6.5-2-9.5-.5z"/><path d="M12 6v14"/>',
  },
  {
    nom: "Convertisseur WebP",
    description: "Conversion d'images JPG/PNG en WebP",
    etat: "bientot",
    icone: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
  },
];
