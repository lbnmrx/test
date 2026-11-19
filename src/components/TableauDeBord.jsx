// COMPOSANT INTERACTIF (React + HeroUI) : le tableau de bord du jour.
// Trois cartes : la date et l'heure, les tâches du jour, un bloc-notes.
// Les tâches et les notes sont mémorisées dans ce navigateur (localStorage).
// Dans une carte, les champs prennent la variante « secondary » (contraste sur fond de carte).
// Plus tard, d'autres cartes pourront lire de vraies données (missions, agenda…).
import { useEffect, useState } from "react";
import { Button, Card, Checkbox, Input, Label, TextArea } from "@heroui/react";

// Lecture / écriture prudentes dans la mémoire du navigateur.
function lire(cle, defaut) {
  try { const v = localStorage.getItem(cle); return v === null ? defaut : JSON.parse(v); } catch { return defaut; }
}
function ecrire(cle, valeur) {
  try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch {}
}

function salutation(heure) {
  if (heure < 5) return "Bonne nuit";
  if (heure < 18) return "Bonjour";
  return "Bonsoir";
}

function CarteDuJour() {
  const [maintenant, setMaintenant] = useState(new Date());
  useEffect(() => {
    const minuteur = setInterval(() => setMaintenant(new Date()), 15000);
    return () => clearInterval(minuteur);
  }, []);
  const date = maintenant.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const heure = maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
  const semaine = Math.ceil(((maintenant - debutAnnee) / 86400000 + debutAnnee.getDay() + 1) / 7);
  return (
    <Card className="justify-between">
      <Card.Header>
        <Card.Description>{salutation(maintenant.getHours())} Alban</Card.Description>
        <Card.Title className="text-2xl first-letter:uppercase">{date}</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="text-5xl font-semibold tabular-nums tracking-tight">{heure}</div>
        <div className="text-sm text-muted mt-1">Semaine {semaine}</div>
      </Card.Content>
    </Card>
  );
}

function CarteTaches() {
  const [taches, setTaches] = useState(() => lire("os.taches", []));
  const [nouvelle, setNouvelle] = useState("");
  useEffect(() => ecrire("os.taches", taches), [taches]);

  function ajouter(e) {
    e?.preventDefault();
    const texte = nouvelle.trim();
    if (!texte) return;
    setTaches([...taches, { id: Date.now(), texte, faite: false }]);
    setNouvelle("");
  }
  const restantes = taches.filter((t) => !t.faite).length;

  return (
    <Card>
      <Card.Header>
        <Card.Title>À faire aujourd'hui</Card.Title>
        <Card.Description>
          {taches.length === 0 ? "Aucune tâche pour l'instant" : `${restantes} restante${restantes > 1 ? "s" : ""} sur ${taches.length}`}
        </Card.Description>
      </Card.Header>
      <Card.Content className="gap-2">
        {taches.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2">
            <Checkbox
              variant="secondary"
              isSelected={t.faite}
              onChange={(v) => setTaches(taches.map((x) => (x.id === t.id ? { ...x, faite: v } : x)))}
            >
              <Checkbox.Content>
                <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                <Label className={t.faite ? "line-through text-muted" : ""}>{t.texte}</Label>
              </Checkbox.Content>
            </Checkbox>
            <Button size="sm" variant="ghost" isIconOnly aria-label="Supprimer" onPress={() => setTaches(taches.filter((x) => x.id !== t.id))}>
              ×
            </Button>
          </div>
        ))}
        <form onSubmit={ajouter} className="flex gap-2 mt-2">
          <Input
            aria-label="Nouvelle tâche"
            variant="secondary"
            placeholder="Nouvelle tâche…"
            value={nouvelle}
            onChange={(e) => setNouvelle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="primary">Ajouter</Button>
        </form>
      </Card.Content>
    </Card>
  );
}

function CarteNotes() {
  const [notes, setNotes] = useState(() => lire("os.notes", ""));
  useEffect(() => ecrire("os.notes", notes), [notes]);
  return (
    <Card>
      <Card.Header>
        <Card.Title>Bloc-notes</Card.Title>
        <Card.Description>Enregistré automatiquement</Card.Description>
      </Card.Header>
      <Card.Content>
        <TextArea
          aria-label="Notes"
          variant="secondary"
          placeholder="Idées, numéros de téléphone, rappels…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={7}
          className="w-full resize-y"
        />
      </Card.Content>
    </Card>
  );
}

export default function TableauDeBord() {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-4">Aujourd'hui</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <CarteDuJour />
        <CarteTaches />
        <CarteNotes />
      </div>
    </section>
  );
}
