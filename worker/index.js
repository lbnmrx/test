// PETIT SERVEUR CLOUDFLARE (Worker) DE MOBELE OS.
// Il ne gère qu'une adresse : /api/apps, qui lit et enregistre la configuration
// des apps de l'accueil dans le stockage KV « OS ». Toutes les autres adresses
// renvoient les pages du site fabriquées par Astro (dossier dist/).

const CLE = "apps";
const MAX = 50_000; // taille maximale acceptée (en caractères)

const json = (donnees, statut = 200) =>
  new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function valide(config) {
  if (!config || !Array.isArray(config.apps) || config.apps.length > 200) return false;
  return config.apps.every((a) => {
    if (!a || typeof a.id !== "string" || a.id.length > 100) return false;
    if (a.type === "lien") {
      if (typeof a.nom !== "string" || a.nom.length > 60) return false;
      try { return ["http:", "https:"].includes(new URL(a.url).protocol); } catch { return false; }
    }
    return true;
  });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/apps") {
      if (request.method === "GET") {
        const brut = await env.OS.get(CLE);
        return json(brut ? JSON.parse(brut) : null);
      }
      if (request.method === "PUT") {
        // Enregistrement réservé aux visites passées par Cloudflare Access (votre connexion).
        if (!request.headers.get("cf-access-jwt-assertion") && env.EXIGER_ACCESS !== "non") {
          return new Response("Connexion Cloudflare Access requise pour enregistrer.", { status: 403 });
        }
        const texte = await request.text();
        if (texte.length > MAX) return new Response("Configuration trop volumineuse.", { status: 413 });
        let config;
        try { config = JSON.parse(texte); } catch { return new Response("JSON invalide.", { status: 400 }); }
        if (!valide(config)) return new Response("Configuration invalide.", { status: 400 });
        await env.OS.put(CLE, JSON.stringify(config));
        return json({ ok: true });
      }
      return new Response("Méthode non autorisée.", { status: 405 });
    }

    return env.ASSETS.fetch(request);
  },
};
