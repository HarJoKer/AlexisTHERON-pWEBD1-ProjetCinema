import { getMovieByTitle, getMovieById } from "../api.js";

// Je choisis les films que je veux afficher en tendance sur la page d'accueil
const TRENDING_MOVIES = [
    "Obsession",
    "The Batman",
    "One Piece Film: Red",
    "Avengers: Endgame",
    "JoKer",
    "The greatest Showman",
    "Captain America: Civil War",
    "The Dark Knight",
];

//Créer un placeholder pour le poster si celui -ci n'est pas disponible
const PLACEHOLDER_POSTER = "https://via.placeholder.com/300x450?text=No+Image";

const list = document.querySelector("#movie-list");

// Je crée un emplacement pour un film dans la page d'accueil
function createMovieElement(movie) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `movie.html?id=${movie.imdbID}`;

    const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : PLACEHOLDER_POSTER;
    const plot = movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "Résumé indisponible.";

    card.innerHTML = `
    <img src="${poster}" alt="Affiche de ${movie.Title}">
    <h3>${movie.Title}</h3>
    <p class="year">${movie.Year}</p>
    <p class="plot">${plot}</p>
  `;
    return card;
}

async function init() {
    list.textContent = "Chargement...";

    try {
        const movies = await Promise.all(TRENDING_MOVIES.map(getMovieByTitle));

        list.textContent = "";
        movies
            .filter((movie) => movie !== null)
            .forEach((movie) => list.appendChild(createMovieElement(movie)));
    } catch (error) {
        list.textContent = "Impossible de charger les films. Réessaie plus tard.";
        console.error(error);
    }
}

init();
