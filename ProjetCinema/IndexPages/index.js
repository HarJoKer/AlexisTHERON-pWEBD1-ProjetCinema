import { getMovieByTitle, getMovieById, searchMovies } from "../api.js";

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
    card.href = `../MoviePages/movie.html?id=${movie.imdbID}`;

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

// Je fake le random pour les films qui pourraient plaire à l'utilisateur en choisissant des mots-clés aléatoires
const RANDOM_KEYWORDS = [
    "love", "war", "night", "star", "dark", "life", "man", "world", "city",
    "dream", "king", "last", "house", "road", "fire", "dead", "blue", "black",
    "girl", "game", "space", "secret", "summer", "ghost", "hero", "wild",
];

const randomBtn = document.querySelector("#load-more");
const randomList = document.querySelector("#random-movie");

//Je crée une fonction pour choisir aléatoirement des mots-clés dans le tableau RANDOM_KEYWORDS
function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

async function loadRandomMovies() {
    randomBtn.disabled = true;
    randomList.textContent = "Chargement...";

    try {
        // Je choisi 6 mots-clés au hasard, chacun avec une page au hasard (1 ou 2)
        const keywords = shuffle(RANDOM_KEYWORDS).slice(0, 6);
        const results = await Promise.all(
            keywords.map((word) => searchMovies(word, Math.ceil(Math.random() * 2)))
        );

        //Je garde uniquement les films avec affiche, sans doublons
        const seen = new Set();
        const movies = results
            .flat()
            .filter((movie) => {
                const valid = movie.Type === "movie" && movie.Poster !== "N/A";
                if (!valid || seen.has(movie.imdbID)) return false;
                seen.add(movie.imdbID);
                return true;
            });

        const picked = shuffle(movies).slice(0, 4);

        //Je récupère le résumé de chaque film choisi
        const detailed = await Promise.all(
            picked.map((movie) => getMovieById(movie.imdbID, "short"))
        );
        const selection = detailed.filter((movie) => movie !== null);

        randomList.textContent = "";
        if (selection.length === 0) {
            randomList.textContent = "Aucun film trouvé, réessaie.";
        } else {
            selection.forEach((movie) => randomList.appendChild(createMovieElement(movie)));
        }
    } catch (error) {
        randomList.textContent = "Impossible de charger les films. Réessaie plus tard.";
        console.error(error);
    } finally {
        randomBtn.disabled = false;
    }
}

randomBtn.addEventListener("click", loadRandomMovies);

init();
