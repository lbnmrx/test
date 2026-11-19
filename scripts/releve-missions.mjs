// RELEVÉ DES MISSIONS — calcule les chiffres de la carte « Activité » du tableau de bord.
//
// Usage : node scripts/releve-missions.mjs <fichier .xlsx du Sheet « Suivi articles »> [AAAA-MM]
// Affiche en JSON : { mois, caHT, objectifHT, aFacturer }
//
// Les règles sont celles de l'outil « Suivi articles » (artifact), recopiées à l'identique :
// - une ligne sans type est classée d'après son titre et son client, et prend le tarif de la grille ;
// - les lignes « Hors mission » et à 0 € ne sont pas des missions ;
// - le mois comptable est la colonne « Mois », ou à défaut le mois de publication
//   (Qobuz : du 21 au 20, une mission publiée à partir du 21 compte pour le mois suivant).
// CA du mois = somme des montants des missions du mois.
// Missions à facturer = missions 2026 et suivantes sans n° de facture, dont le mois
// comptable n'est pas postérieur au mois en cours (décembre, janvier… à venir sont exclus).
import XLSX from "xlsx";

const TABS = ["onmag", "qobuz", "hf", "autres"];

// ---------- Copie des règles de l'outil « Suivi articles » ----------
const GRID = {
  "Onmag": {"Test long":210, "Test court":140, "News":70, "Article sponso":140, "Article de fond":140},
  "Onmultiroom": {"News":0, "Test":0, "Test long":0, "Test court":0, "Article de fond":0, "Article sponso":0},
  "Qobuz": {"Test":480, "Test long":480, "News":230, "Article de fond":230},
  "HCFR": {"Test":150, "Test long":150, "Article sponso":150, "Article de fond":150, "News":150},
  "Multiroom.fr": {"Test":0, "News":0, "Article de fond":0}
};
const FOND_QOBUZ = /^(top |le top|article|sélection|selection|best of|cr |comment |casque ouvert|mode serveur|enceintes design|\d+ systèmes)/i;
const FOND_HF = /dossier|guide|^hs |hs n°|sur la route|installation|historique|histoire|réécriture|sélection|^cr | x |virtuoso/i;

function billingClient(tab, client, title) {
  const c = (client || "").trim().toLowerCase(), t = (title || "").trim();
  if (tab === "onmag") return c.includes("onmultiroom") ? "Onmultiroom" : "Onmag";
  if (tab === "qobuz") return "Qobuz";
  if (tab === "hf") return "Haute Fidélité";
  if (tab === "multiroom") return "Multiroom.fr";
  if (/^qobuz\b/i.test(t)) return "Qobuz";
  if (c === "ead" || /^ead\b/i.test(t)) return "EAD";
  if (/^hcfr\b/i.test(t)) return "HCFR";
  if (/^sv\d|sonovision|^genum/i.test(t) || c === "sonovision" || c === "genum") return "Genum";
  if (/^systemed/i.test(t)) return "SystemeD";
  if (/diapason/i.test(t)) return "Diapason";
  return client && !/^(autres|onmag)$/i.test(client.trim()) ? client.trim() : "Autres";
}
function autoType(tab, client, title) {
  const c = (client || "").trim().toLowerCase(), t = (title || "").trim();
  if (tab === "onmag") {
    if (c.includes("onmultiroom")) return "News";
    if (c === "onmag" || c === "onmag tests") {
      if (/guide/i.test(t)) return "Article de fond";
      return /\(court\)/i.test(t) ? "Test court" : "Test long";
    }
    if (/mise en ligne|mettre en ligne/i.test(t)) return "Hors mission";
    return /sponso/i.test(t) ? "Article sponso" : "News";
  }
  if (tab === "qobuz") {
    if (/actualit|salon/i.test(t)) return "News";
    return FOND_QOBUZ.test(t.replace(/^\W+/, "")) ? "Article de fond" : "Test";
  }
  if (tab === "hf") {
    if (/relance/i.test(t)) return "Hors mission";
    return FOND_HF.test(t) ? "Article de fond" : "Test";
  }
  if (tab === "multiroom") return "Test";
  const bc = billingClient(tab, client, title);
  if (bc === "HCFR") return /sponso/i.test(t) ? "Article sponso" : "Test";
  if (bc === "EAD") return "News";
  if (["SystemeD","Diapason","Genum"].includes(bc)) return "Article de fond";
  return "Hors mission";
}
function parseAmount(v) {
  if (v == null) return null;
  const s = String(v).replace(/\s|€| | /g, "").replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
const MONTH_WORDS = ["jan","fév","mar","avr","mai","juin","juil","aoû","sep","oct","nov","déc"];
function ym(y, m) { return (y > 1999 && m >= 0 && m < 12) ? {y, m} : null; }
function parseMonth(v) {
  if (v == null) return null;
  const s = String(v).trim().toLowerCase().replace(/^'/, "");
  if (!s) return null;
  let m;
  if ((m = s.match(/^(\d{4})[-\/.](\d{1,2})$/))) return ym(+m[1], +m[2] - 1);
  if ((m = s.match(/^(\d{1,2})[-\/.](\d{4})$/))) return ym(+m[2], +m[1] - 1);
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return ym(+m[3], +m[2] - 1);
  if ((m = s.match(/^(\d{4})-(\d{2})-\d{2}/))) return ym(+m[1], +m[2] - 1);
  const norm = s.replace("fevr", "févr").replace("aout", "août").replace("dec", "déc");
  if ((m = norm.match(/^([a-zéû]+)\.?\s+(\d{4})$/))) {
    const k = MONTH_WORDS.findIndex(w => m[1].startsWith(w.slice(0, 3)) && (w !== "juin" || m[1].startsWith("juin")) && (w !== "juil" || m[1].startsWith("juil")));
    if (k >= 0) return ym(+m[2], k);
  }
  return null;
}
function defaultMonth(tab, date) {
  if (!date) return null;
  const shift = tab === "qobuz" && date.getDate() >= 21 ? 1 : 0;
  const d = new Date(date.getFullYear(), date.getMonth() + shift, 1);
  return {y: d.getFullYear(), m: d.getMonth()};
}
function parseDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  const fr = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const d = fr ? new Date(+fr[3], +fr[2] - 1, +fr[1]) : new Date(s);
  return isNaN(d) ? null : d;
}
function missionsOf(tab, rows) {
  const out = [];
  rows.slice(1).forEach(r => {
    const [dRaw, title, client, , typeRaw, amtRaw, moisRaw, factRaw] = r;
    if (!title && !dRaw) return;
    const date = parseDate(dRaw);
    const acct = parseMonth(moisRaw) || defaultMonth(tab, date);
    const bc = billingClient(tab, client, title);
    const type = (typeRaw || "").trim() || autoType(tab, client, title);
    const amtSet = parseAmount(amtRaw);
    const gridAmt = GRID[bc] ? GRID[bc][type] : undefined;
    const amount = amtSet != null ? amtSet : (gridAmt != null ? gridAmt : null);
    if (type === "Hors mission" || amount === 0) return;
    out.push({facture: String(factRaw || "").trim(), ay: acct ? acct.y : null, am: acct ? acct.m : null, amount});
  });
  return out;
}
// ---------- Fin de la copie ----------

const [fichier, moisArg] = process.argv.slice(2);
if (!fichier) { console.error("Usage : node scripts/releve-missions.mjs <fichier.xlsx> [AAAA-MM]"); process.exit(1); }
const now = new Date();
const [Y, M] = (moisArg || `${now.getFullYear()}-${now.getMonth() + 1}`).split("-").map(Number);
const y = Y, m = M - 1;

const classeur = XLSX.readFile(fichier);
// Texte des cellules tel qu'affiché dans le Sheet, comme le lit l'outil « Suivi articles »
const lignes = nom => {
  const feuille = classeur.Sheets[nom];
  if (!feuille) throw new Error(`Onglet introuvable : ${nom}`);
  return XLSX.utils.sheet_to_json(feuille, {header: 1, raw: false, defval: ""});
};

const missions = TABS.flatMap(tab => missionsOf(tab, lignes(tab)));
const duMois = missions.filter(x => x.ay === y && x.am === m);
const caHT = Math.round(duMois.reduce((s, x) => s + (x.amount || 0), 0));
const aFacturer = missions.filter(x => !x.facture && x.ay != null && x.ay >= 2026 && (x.ay < y || (x.ay === y && x.am <= m))).length;

// Objectif mensuel : onglet « objectifs », colonne « Mensuel <année> » si elle existe, sinon la colonne B
const obj = lignes("objectifs");
let col = obj[0].findIndex(h => String(h).trim().toLowerCase() === `mensuel ${y}`);
if (col < 0) col = 1;
const objectifHT = Math.round(obj.slice(1)
  .filter(r => String(r[0]).trim() && !/total/i.test(String(r[0])) && !/total/i.test(String(r[col])))
  .reduce((s, r) => s + (parseAmount(r[col]) || 0), 0) * 100) / 100;

console.log(JSON.stringify({mois: `${y}-${String(m + 1).padStart(2, "0")}`, caHT, objectifHT, aFacturer}));
