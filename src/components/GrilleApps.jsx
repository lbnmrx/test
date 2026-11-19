// COMPOSANT INTERACTIF : la grille d'apps de l'accueil, façon écran d'iPhone.
// Elle lit l'ordre, la visibilité et les raccourcis enregistrés (page Réglages).
import { useEffect, useState } from "react";
import IconeApp from "./IconeApp.jsx";
import { chargerConfig, fusionner } from "../lib/apps.js";

export default function GrilleApps() {
  const [apps, setApps] = useState(null);
  useEffect(() => { chargerConfig().then((c) => setApps(fusionner(c))); }, []);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-lg font-semibold">Apps</h2>
        <a href="/reglages/" className="text-sm text-accent-soft-foreground">Organiser</a>
      </div>
      <div className="grille-apps">
        {(apps || []).filter((a) => !a.masque).map((a) => <IconeApp key={a.id} app={a} />)}
      </div>
    </section>
  );
}
