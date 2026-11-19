// COMPOSANT INTERACTIF (React + HeroUI) : le tableau de bord du jour.
// Quatre cartes :
//  1. Bonjour : date, heure, semaine et météo à 5 jours (lue en direct sur Open-Meteo)
//  2. À faire aujourd'hui : les cartes Trello du jour et en retard
//  3. Activité : CA HT du mois et missions à facturer (Sheet « Suivi articles »)
//  4. Trésorerie : solde Crédit Agricole et opérations à valider (Dougs)
// Les cartes 2 à 4 lisent le relevé src/data/tableau.json, mis à jour par une
// tâche Claude planifiée ; elles le reçoivent ici dans la propriété « donnees ».
import { useEffect, useState } from "react";
import { Card, Chip } from "@heroui/react";

// Ville de la météo : Vichy.
const METEO = { latitude: 46.13, longitude: 3.43 };

const euros = (n, decimales = 0) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: decimales, maximumFractionDigits: decimales });

function salutation(heure) {
  if (heure < 5) return "Bonne nuit";
  if (heure < 18) return "Bonjour";
  return "Bonsoir";
}

// ---------- Météo ----------

// Les codes météo WMO regroupés en sept familles d'icônes.
function familleMeteo(code) {
  if (code === 0) return "soleil";
  if (code <= 2) return "eclaircies";
  if (code === 3) return "nuages";
  if (code === 45 || code === 48) return "brouillard";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "neige";
  if (code >= 95) return "orage";
  return "pluie";
}

function IconeMeteo({ code }) {
  const famille = familleMeteo(code);
  const soleil = <><circle cx="11" cy="11" r="4.2" fill="#f5b82e" /><g stroke="#f5b82e" strokeWidth="1.6" strokeLinecap="round"><path d="M11 2.5v2M11 17.5v2M2.5 11h2M17.5 11h2M5 5l1.4 1.4M15.6 15.6 17 17M5 17l1.4-1.4M15.6 6.4 17 5" /></g></>;
  const nuage = (x = 0, y = 0, teinte = "var(--nuage)") => (
    <path transform={`translate(${x} ${y})`} fill={teinte} d="M9 26h15a5 5 0 0 0 .6-9.96A7 7 0 0 0 11.2 14.5 5.75 5.75 0 0 0 9 26z" />
  );
  return (
    <svg width="38" height="34" viewBox="0 0 32 30" aria-hidden="true" className="meteo-icone">
      {famille === "soleil" && <g transform="translate(5 4)">{soleil}</g>}
      {famille === "eclaircies" && <><g transform="translate(9 0) scale(.85)">{soleil}</g>{nuage(-2, 0)}</>}
      {famille === "nuages" && <>{nuage(3, -4, "var(--nuage-fonce)")}{nuage(-2, 0)}</>}
      {famille === "brouillard" && <>{nuage(-2, -3)}<path d="M6 26h20M9 29h14" stroke="var(--nuage-fonce)" strokeWidth="1.8" strokeLinecap="round" /></>}
      {famille === "pluie" && <>{nuage(-2, -4)}<path d="M11 25l-1.5 3.5M16 25l-1.5 3.5M21 25l-1.5 3.5" stroke="#4a9be0" strokeWidth="1.8" strokeLinecap="round" /></>}
      {famille === "neige" && <>{nuage(-2, -4)}<g fill="#9cc7f0"><circle cx="11" cy="26.5" r="1.4" /><circle cx="16" cy="28" r="1.4" /><circle cx="21" cy="26.5" r="1.4" /></g></>}
      {famille === "orage" && <>{nuage(-2, -4, "var(--nuage-fonce)")}<path d="M17 22l-3.5 4.5h3l-2 4" stroke="#f5b82e" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>}
    </svg>
  );
}

function Meteo() {
  const [jours, setJours] = useState(null);
  const [erreur, setErreur] = useState(false);
  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${METEO.latitude}&longitude=${METEO.longitude}` +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FParis&forecast_days=5";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setJours(d.daily.time.map((t, i) => ({
        date: t, code: d.daily.weather_code[i], max: d.daily.temperature_2m_max[i], min: d.daily.temperature_2m_min[i],
      }))))
      .catch(() => setErreur(true));
  }, []);
  const degres = (n) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°`;

  if (erreur) return <p className="text-sm text-muted">Météo indisponible pour le moment.</p>;
  if (!jours) return <div className="h-[118px]" />;
  return (
    <div className="grid grid-cols-5 gap-1 text-center">
      {jours.map((j) => (
        <div key={j.date} className="flex flex-col items-center gap-1">
          <span className="text-sm text-muted">
            {new Date(j.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short" })}
          </span>
          <IconeMeteo code={j.code} />
          <span className="font-semibold tabular-nums">{degres(j.max)}</span>
          <span className="text-sm text-muted tabular-nums">{degres(j.min)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Cartes ----------

function CarteDuJour() {
  const [maintenant, setMaintenant] = useState(new Date());
  useEffect(() => {
    const minuteur = setInterval(() => setMaintenant(new Date()), 15000);
    return () => clearInterval(minuteur);
  }, []);
  const date = maintenant.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const heure = maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  // Numéro de semaine ISO (celui des calendriers français).
  const j = new Date(Date.UTC(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()));
  j.setUTCDate(j.getUTCDate() + 4 - (j.getUTCDay() || 7));
  const semaine = Math.ceil(((j - Date.UTC(j.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);

  return (
    <Card>
      <Card.Header>
        <Card.Description>{salutation(maintenant.getHours())} Alban</Card.Description>
        <Card.Title className="text-2xl first-letter:uppercase">{date}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-5">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">{heure}</span>
          <span className="text-sm text-muted">Semaine {semaine}</span>
        </div>
        <Meteo />
      </Card.Content>
    </Card>
  );
}

function CarteTrello({ cartes }) {
  const enRetard = cartes.filter((c) => c.enRetard).length;
  return (
    <Card>
      <Card.Header>
        <Card.Title>À faire aujourd'hui</Card.Title>
        <Card.Description>
          {cartes.length === 0
            ? "Aucune carte Trello pour aujourd'hui"
            : `${cartes.length} carte${cartes.length > 1 ? "s" : ""} Trello${enRetard ? `, dont ${enRetard} en retard` : ""}`}
        </Card.Description>
      </Card.Header>
      <Card.Content className="gap-1">
        {cartes.map((c) => (
          <a key={c.url} href={c.url} target="_blank" rel="noreferrer"
             className="ligne-trello flex items-center justify-between gap-3 rounded-xl px-3 py-2 no-underline text-foreground">
            <span className="flex flex-col min-w-0">
              <span className="truncate font-medium">{c.titre}</span>
              <span className="text-xs text-muted">{c.tableau}</span>
            </span>
            {c.enRetard && (
              <Chip size="sm" color="danger" variant="soft">
                En retard ({new Date(c.echeance).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })})
              </Chip>
            )}
          </a>
        ))}
      </Card.Content>
    </Card>
  );
}

function Chiffre({ valeur, legende }) {
  return (
    <div className="flex flex-col">
      <span className="text-3xl font-semibold tabular-nums tracking-tight">{valeur}</span>
      <span className="text-sm text-muted">{legende}</span>
    </div>
  );
}

function CarteActivite({ missions }) {
  const nomMois = new Date(missions.mois + "-15").toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const part = missions.objectifHT ? Math.round((missions.caHT / missions.objectifHT) * 100) : null;
  return (
    <Card>
      <Card.Header>
        <Card.Title>Activité de {nomMois}</Card.Title>
        <Card.Description>Sheet « Suivi articles »</Card.Description>
      </Card.Header>
      <Card.Content className="gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Chiffre valeur={euros(missions.caHT)} legende="CA HT du mois" />
          <Chiffre valeur={missions.aFacturer} legende={`mission${missions.aFacturer > 1 ? "s" : ""} à facturer`} />
        </div>
        {part !== null && (
          <div className="flex flex-col gap-1.5">
            <div className="h-2 rounded-full bg-[var(--surface-secondary)] overflow-hidden">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(part, 100)}%` }} />
            </div>
            <span className="text-xs text-muted">{part} % de l'objectif mensuel ({euros(missions.objectifHT)})</span>
          </div>
        )}
      </Card.Content>
      <Card.Footer>
        <a href={missions.lien} target="_blank" rel="noreferrer" className="text-sm text-accent-soft-foreground">Ouvrir le Sheet →</a>
      </Card.Footer>
    </Card>
  );
}

function CarteTresorerie({ tresorerie }) {
  const n = tresorerie.operationsAValider;
  return (
    <Card>
      <Card.Header>
        <Card.Title>Trésorerie</Card.Title>
        <Card.Description>{tresorerie.compte} · Dougs</Card.Description>
      </Card.Header>
      <Card.Content className="gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Chiffre valeur={euros(tresorerie.solde, 2)} legende="Solde du compte" />
          <Chiffre valeur={n} legende={`opération${n > 1 ? "s" : ""} à valider`} />
        </div>
        <div>
          {n === 0
            ? <Chip size="sm" color="success" variant="soft">Tout est validé</Chip>
            : <Chip size="sm" color="warning" variant="soft">À traiter dans Dougs</Chip>}
        </div>
      </Card.Content>
      <Card.Footer>
        <a href={tresorerie.lien} target="_blank" rel="noreferrer" className="text-sm text-accent-soft-foreground">Ouvrir Dougs →</a>
      </Card.Footer>
    </Card>
  );
}

export default function TableauDeBord({ donnees }) {
  const majLe = new Date(donnees.majLe).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold">Aujourd'hui</h2>
        <span className="text-xs text-muted">Relevé Trello, Sheet et Dougs : {majLe}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CarteDuJour />
        <CarteTrello cartes={donnees.trello} />
        <CarteActivite missions={donnees.missions} />
        <CarteTresorerie tresorerie={donnees.tresorerie} />
      </div>
    </section>
  );
}
