// COMPOSANT INTERACTIF : la page Réglages des apps de l'accueil.
// - réordonner (flèches), afficher ou masquer chaque app
// - ajouter, renommer ou supprimer des raccourcis vers des sites externes
// - « Enregistrer » envoie la configuration chez Cloudflare (stockage KV)
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Switch, TextField } from "@heroui/react";
import { Pastille } from "./IconeApp.jsx";
import { COULEURS_LIEN, chargerConfig, enregistrerConfig, fusionner, versConfig } from "../lib/apps.js";

function normaliserUrl(saisie) {
  const s = saisie.trim();
  if (!s) return "";
  const avecProtocole = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try { return new URL(avecProtocole).href; } catch { return ""; }
}

function Fleche({ sens, ...props }) {
  return (
    <Button size="sm" variant="ghost" isIconOnly aria-label={sens === "haut" ? "Monter" : "Descendre"} {...props}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={sens === "haut" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
      </svg>
    </Button>
  );
}

export default function Reglages() {
  const [apps, setApps] = useState(null);
  const [modifie, setModifie] = useState(false);
  const [etat, setEtat] = useState({ type: "", texte: "" });
  const [nom, setNom] = useState("");
  const [url, setUrl] = useState("");
  const [couleur, setCouleur] = useState(COULEURS_LIEN[0]);

  useEffect(() => { chargerConfig().then((c) => setApps(fusionner(c))); }, []);

  // Empêche de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    const avertir = (e) => { if (modifie) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [modifie]);

  const changer = (nouvelle) => { setApps(nouvelle); setModifie(true); setEtat({ type: "", texte: "" }); };
  const deplacer = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= apps.length) return;
    const l = [...apps]; [l[i], l[j]] = [l[j], l[i]]; changer(l);
  };
  const maj = (i, champs) => changer(apps.map((a, k) => (k === i ? { ...a, ...champs } : a)));

  function ajouter(e) {
    e.preventDefault();
    const adresse = normaliserUrl(url);
    if (!nom.trim() || !adresse) { setEtat({ type: "erreur", texte: "Indiquez un nom et une adresse valide." }); return; }
    changer([...apps, { id: `lien-${Date.now()}`, type: "lien", nom: nom.trim(), url: adresse, couleur, masque: false }]);
    setNom(""); setUrl("");
  }

  async function enregistrer() {
    setEtat({ type: "encours", texte: "Enregistrement…" });
    try {
      await enregistrerConfig(versConfig(apps));
      setModifie(false);
      setEtat({ type: "ok", texte: "Enregistré. L'accueil est à jour." });
    } catch (err) {
      setEtat({ type: "erreur", texte: `Enregistrement impossible : ${err.message}` });
    }
  }

  if (!apps) return <p className="text-muted">Chargement…</p>;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Card.Header>
          <Card.Title>Apps de l'accueil</Card.Title>
          <Card.Description>Flèches pour changer l'ordre, interrupteur pour afficher ou masquer.</Card.Description>
        </Card.Header>
        <Card.Content className="gap-1">
          {apps.map((a, i) => (
            <div key={a.id} className="ligne-reglage flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex flex-col">
                <Fleche sens="haut" isDisabled={i === 0} onPress={() => deplacer(i, -1)} />
                <Fleche sens="bas" isDisabled={i === apps.length - 1} onPress={() => deplacer(i, 1)} />
              </div>
              <span className={a.masque ? "opacity-40" : ""}><Pastille app={a} taille={44} /></span>
              <div className="flex-1 min-w-0">
                {a.type === "lien" ? (
                  <Input aria-label="Nom du raccourci" variant="secondary" value={a.nom}
                         onChange={(e) => maj(i, { nom: e.target.value })} className="w-full max-w-xs" />
                ) : (
                  <span className="font-medium">{a.nom}</span>
                )}
                <div className="text-xs text-muted truncate mt-0.5">
                  {a.type === "lien" ? a.url : a.etat === "actif" ? "App intégrée" : "App intégrée · bientôt disponible"}
                </div>
              </div>
              <Switch isSelected={!a.masque} onChange={(v) => maj(i, { masque: !v })}>
                <Switch.Content>
                  <Switch.Control><Switch.Thumb /></Switch.Control>
                  <span className="sr-only">Afficher {a.nom}</span>
                </Switch.Content>
              </Switch>
              {a.type === "lien" ? (
                <Button size="sm" variant="ghost" isIconOnly aria-label={`Supprimer ${a.nom}`}
                        onPress={() => changer(apps.filter((_, k) => k !== i))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
                </Button>
              ) : <span className="w-8" />}
            </div>
          ))}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Ajouter un raccourci</Card.Title>
          <Card.Description>Une app qui ouvre un site externe dans un nouvel onglet. L'icône du site est récupérée automatiquement.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={ajouter} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField value={nom} onChange={setNom}>
                <Label>Nom</Label>
                <Input variant="secondary" placeholder="Ex. : Trello" />
              </TextField>
              <TextField value={url} onChange={setUrl}>
                <Label>Adresse</Label>
                <Input variant="secondary" placeholder="Ex. : trello.com" />
              </TextField>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Couleur (si le site n'a pas d'icône)</span>
              <div className="flex gap-2">
                {COULEURS_LIEN.map((c) => (
                  <button key={c} type="button" aria-label={`Couleur ${c}`} onClick={() => setCouleur(c)}
                          className={`pastille-couleur${couleur === c ? " pastille-couleur--active" : ""}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div><Button type="submit" variant="secondary">Ajouter à la liste</Button></div>
          </form>
        </Card.Content>
      </Card>

      <div className="barre-enregistrer flex items-center gap-4">
        <Button variant="primary" onPress={enregistrer} isDisabled={!modifie || etat.type === "encours"}>Enregistrer</Button>
        <span className={`text-sm ${etat.type === "erreur" ? "text-danger" : etat.type === "ok" ? "text-success" : "text-muted"}`}>
          {etat.texte || (modifie ? "Modifications non enregistrées" : "")}
        </span>
      </div>
    </div>
  );
}
