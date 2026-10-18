const API_Key ="d22b9e2f";
const BASE_URL = "https://www.omdbapi.com/";

// Je récupère un films précis par son titre exact pour les films en tendance
export async function getMovieByTitle(title) {
    const url= `${BASE_URL}?apikey=${API_Key}&t=${encodeURIComponent(title)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.Response === "True" ? data : null;
}

// Je récupère la fiche d'un film par son IMDB ID
export async function getMovieById(id, plot = "full") {
const url= `${BASE_URL}?apikey=${API_Key}&i=${encodeURIComponent(id)}&plot=${plot}`;
const response = await fetch(url);
const data = await response.json();
return data.Response === "True" ? data : null;
}