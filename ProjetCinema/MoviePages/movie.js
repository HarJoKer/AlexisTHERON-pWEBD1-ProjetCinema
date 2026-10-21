import { getMovieById } from "../api.js";
 
const PLACEHOLDER_POSTER = "https://via.placeholder.com/300x445?text=Pas+d%27affiche";
 
//Je transforme les mois en numéro pour les afficher en format JJ/MM/AAAA
const MONTHS = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};
 
const message = document.querySelector("#message");
const article = document.querySelector("#movie");
 
//Je transforme "21 Oct 2010" (format OMDb) en "21/10/2010"
function formatDvdDate(dvd) {
    if (!dvd || dvd === "N/A") return "Non disponible";
 
    const [day, month, year] = dvd.split(" ");
    if (!MONTHS[month]) return dvd;
 
    return `${day.padStart(2, "0")}/${MONTHS[month]}/${year}`;
}
 
// Affiche une valeur OMDb, ou un texte par défaut si elle est absente
function valueOrDefault(value, fallback = "Non disponible") {
    return value && value !== "N/A" ? value : fallback;
}
 
function displayMovie(movie) {
    document.title = `${movie.Title} - Cinéma`;
 
    // Titre + poster
    document.querySelector("#movie-title").textContent = `${movie.Title} (${movie.Year})`;
    const poster = document.querySelector("#movie-poster");
    poster.src = movie.Poster !== "N/A" ? movie.Poster : PLACEHOLDER_POSTER;
    poster.alt = `Affiche de ${movie.Title}`;
 
    // Genres : une pastille par genre
    const genres = document.querySelector("#movie-genres");
    valueOrDefault(movie.Genre, "")
        .split(", ")
        .filter(Boolean)
        .forEach((genre) => {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = genre;
            genres.appendChild(tag);
        });
 
    // Résumé long + acteurs
    document.querySelector("#movie-plot").textContent = valueOrDefault(movie.Plot, "Résumé non disponible.");
    document.querySelector("#movie-actors").textContent = valueOrDefault(movie.Actors);
 
    // Je récupère les notes (IMDb, Rotten Tomatoes, Metacritic...)
    const ratings = document.querySelector("#movie-ratings");
    if (movie.Ratings && movie.Ratings.length > 0) {
        movie.Ratings.forEach((rating) => {
            const item = document.createElement("li");
            item.textContent = `${rating.Source} : ${rating.Value}`;
            ratings.appendChild(item);
        });
    } else {
        ratings.textContent = "Aucune note disponible.";
    }
 
    // Date de sortie DVD en français
    document.querySelector("#movie-dvd").textContent = formatDvdDate(movie.DVD);
 
    message.hidden = true;
    article.hidden = false;
}
 
async function init() {
    const id = new URLSearchParams(window.location.search).get("id");
 
    if (!id) {
        message.textContent = "Aucun film sélectionné.";
        return;
    }
 
    try {
        const movie = await getMovieById(id, "full");
 
        if (!movie) {
            message.textContent = "Film introuvable.";
            return;
        }
 
        displayMovie(movie);
    } catch (error) {
        message.textContent = "Impossible de charger le film. Réessayer plus tard.";
        console.error(error);
    }
}
 
init();