// FONCTIONNEMENT de la page : ce qui se passe quand on clique sur « Ajouter ».

const formulaire = document.getElementById("formulaire");
const champTache = document.getElementById("tache");
const choixJour = document.getElementById("jour");
const liste = document.getElementById("liste");

formulaire.addEventListener("submit", function (evenement) {
  evenement.preventDefault(); // empêche la page de se recharger

  // On fabrique une ligne de liste avec la tâche et le jour choisis.
  const ligne = document.createElement("li");
  ligne.innerHTML = "<span></span><span class='jour'></span>";
  ligne.children[0].textContent = champTache.value;
  ligne.children[1].textContent = choixJour.value;
  liste.appendChild(ligne);

  champTache.value = ""; // on vide le champ pour la tâche suivante
});
