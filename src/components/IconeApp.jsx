// COMPOSANT : une icône d'app façon iPhone (carré aux coins arrondis + nom dessous).
// - outil intégré : dessin blanc sur un dégradé de couleur
// - raccourci externe : favicon du site sur fond blanc (ou initiale si introuvable)
import { useState } from "react";
import { domaine } from "../lib/apps.js";

export function Pastille({ app, taille = 64 }) {
  const [sansFavicon, setSansFavicon] = useState(false);
  const style = { width: taille, height: taille, borderRadius: taille * 0.23 };

  if (app.type === "lien") {
    const d = domaine(app.url);
    if (!sansFavicon && d) {
      return (
        <span className="app-pastille app-pastille--lien" style={style}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`}
            alt="" width={taille * 0.56} height={taille * 0.56}
            onError={() => setSansFavicon(true)}
            onLoad={(e) => { if (e.currentTarget.naturalWidth <= 16) setSansFavicon(true); }}
          />
        </span>
      );
    }
    return (
      <span className="app-pastille" style={{ ...style, background: app.couleur || "#90a4ae" }}>
        <span className="app-initiale" style={{ fontSize: taille * 0.42 }}>{(app.nom || "?").trim().charAt(0).toUpperCase()}</span>
      </span>
    );
  }
  const [c1, c2] = app.couleur || ["#9fd36a", "#5f9f2f"];
  return (
    <span className="app-pastille" style={{ ...style, background: `linear-gradient(160deg, ${c1}, ${c2})` }}>
      <svg width={taille * 0.5} height={taille * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9"
           strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: app.icone }} />
    </span>
  );
}

export default function IconeApp({ app }) {
  const bientot = app.type === "outil" && app.etat !== "actif";
  const contenu = (
    <>
      <Pastille app={app} />
      <span className="app-nom">{app.nom}</span>
    </>
  );
  if (bientot) {
    return <div className="app app--bientot" title={`${app.nom} : bientôt intégré`}>{contenu}</div>;
  }
  const externe = app.type === "lien";
  return (
    <a className="app" href={externe ? app.url : app.adresse} {...(externe ? { target: "_blank", rel: "noreferrer" } : {})}>
      {contenu}
    </a>
  );
}
