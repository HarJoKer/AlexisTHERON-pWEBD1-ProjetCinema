// Configuration (API OMDb)
const API_KEY = "d22b9e2f";
const API_URL = "https://www.omdbapi.com/";
const RESULTS_PER_PAGE = 10; // OMDb renvoie 10 résultats par page
const DEBOUNCE_MS = 300;
 
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const loadMoreBtn = document.getElementById("load-more");
 
let currentQuery = "";
let currentPage = 1;
let totalPages = 1;
let debounceTimer = null;
let controller = null; // permet d'annuler une requête obsolète
 
// Appel  de l'API
async function fetchMovies(query, page) {
  if (controller) controller.abort();
  controller = new AbortController();
 
  const params = new URLSearchParams({
    apikey: API_KEY,
    s: query,
    page: page,
    type: "movie",
  });
 
  const response = await fetch(`${API_URL}?${params}`, {
    signal: controller.signal,
  });
  if (!response.ok) throw new Error("Erreur API : " + response.status);
  return response.json();
}
 
function createCard(movie) {
  const card = document.createElement("article");
  card.className = "card";
 
  // Poster
  if (movie.Poster && movie.Poster !== "N/A") {
    const img = document.createElement("img");
    img.className = "card-poster";
    img.src = movie.Poster;
    img.alt = "Poster de " + movie.Title;
    img.loading = "lazy";
    card.appendChild(img);
  } else {
    const empty = document.createElement("div");
    empty.className = "card-poster card-poster--empty";
    empty.textContent = "Pas de poster";
    card.appendChild(empty);
  }
 
  const body = document.createElement("div");
  body.className = "card-body";
 
  // Titre
  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = movie.Title;
  body.appendChild(title);
 
  // Lien "En savoir plus" vers movie.html
  const link = document.createElement("a");
  link.className = "card-link";
  link.href = "../MoviePages/movie.html?id=" + encodeURIComponent(movie.imdbID);
  link.textContent = "En savoir plus";
  body.appendChild(link);
 
  card.appendChild(body);
  return card;
}
 
function renderMovies(movies) {
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => fragment.appendChild(createCard(movie)));
  resultsEl.appendChild(fragment);
}
 
function updateLoadMore() {
  loadMoreBtn.hidden = currentPage >= totalPages;
}
 
function resetResults() {
  resultsEl.innerHTML = "";
  loadMoreBtn.hidden = true;
  currentPage = 1;
  totalPages = 1;
}
 
// Recherche
async function search(query) {
  currentQuery = query;
  resetResults();
 
  if (!query) {
    statusEl.textContent = "";
    if (controller) controller.abort();
    return;
  }
 
  statusEl.textContent = "Recherche en cours…";
 
  try {
    const data = await fetchMovies(query, 1);
    // Ignore la réponse si l'utilisateur a déjà tapé autre chose
    if (query !== currentQuery) return;
 
    if (data.Response === "False") {
      if (data.Error === "Too many results.") {
        statusEl.textContent = "Continue à taper pour affiner la recherche…";
      } else if (data.Error === "Movie not found!") {
        statusEl.textContent = `Aucun résultat pour « ${query} ».`;
      } else {
        statusEl.textContent = "Erreur : " + data.Error;
      }
      return;
    }
 
    const total = parseInt(data.totalResults, 10);
    totalPages = Math.ceil(total / RESULTS_PER_PAGE);
 
    statusEl.textContent = `${total} résultat(s) pour « ${query} »`;
    renderMovies(data.Search);
    updateLoadMore();
  } catch (err) {
    if (err.name === "AbortError") return;
    statusEl.textContent = "Une erreur est survenue. Vérifie ta connexion.";
    console.error(err);
  }
}
 
async function loadMore() {
  if (currentPage >= totalPages) return;
 
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Chargement…";
  const query = currentQuery;
 
  try {
    const data = await fetchMovies(query, currentPage + 1);
    if (query !== currentQuery) return;
 
    if (data.Response === "True") {
      currentPage++;
      renderMovies(data.Search);
    } else {
      totalPages = currentPage;
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    statusEl.textContent = "Impossible de charger plus de résultats.";
    console.error(err);
  } finally {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "Charger plus de résultats";
    updateLoadMore();
  }
}
 
// Recherche en temps réel (avec debounce pour limiter les appels)
input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => search(input.value.trim()), DEBOUNCE_MS);
});
 
// Empêche tout rechargement de page
form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(debounceTimer);
  search(input.value.trim());
});
 
loadMoreBtn.addEventListener("click", loadMore);