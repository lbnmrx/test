// LOGIQUE COMMUNE À L'ACCUEIL ET AUX RÉGLAGES.
// La configuration enregistrée chez Cloudflare a cette forme :
//   { apps: [ { id, masque }, { id, type: "lien", nom, url, couleur, masque }, … ] }
// L'ordre du tableau est l'ordre d'affichage.
import { outils } from "../data/outils.js";

export const COULEURS_LIEN = ["#8cc757", "#64b5f6", "#ff8a65", "#ba68c8", "#4db6ac", "#f6c344", "#90a4ae", "#ef5350"];

// Lit la configuration enregistrée ; renvoie null si rien n'est enregistré ou si le serveur ne répond pas.
export async function chargerConfig() {
  try {
    const r = await fetch("/api/apps", { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function enregistrerConfig(config) {
  const r = await fetch("/api/apps", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!r.ok) throw new Error((await r.text()) || `Erreur ${r.status}`);
}

// Combine le catalogue des outils et la configuration : ordre, visibilité, raccourcis.
// Un outil ajouté au catalogue après coup apparaît automatiquement à la fin.
export function fusionner(config) {
  const parId = new Map(outils.map((o) => [o.id, o]));
  const liste = [];
  const vus = new Set();
  for (const e of (config && config.apps) || []) {
    if (e.type === "lien") {
      if (e.url) liste.push({ ...e, masque: !!e.masque });
    } else if (parId.has(e.id) && !vus.has(e.id)) {
      liste.push({ ...parId.get(e.id), type: "outil", masque: !!e.masque });
      vus.add(e.id);
    }
  }
  for (const o of outils) if (!vus.has(o.id)) liste.push({ ...o, type: "outil", masque: false });
  return liste;
}

// Ce qui est enregistré : l'essentiel seulement (les outils gardent leur définition dans le code).
export function versConfig(liste) {
  return {
    apps: liste.map((a) =>
      a.type === "lien"
        ? { id: a.id, type: "lien", nom: a.nom, url: a.url, couleur: a.couleur, masque: !!a.masque }
        : { id: a.id, masque: !!a.masque }
    ),
  };
}

export function domaine(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}
