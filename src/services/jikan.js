const BASE_URL = "https://api.jikan.moe/v4";

async function request(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("The anime API is temporarily rate-limited. Please wait a moment and try again.");
    }
    throw new Error(`Anime API request failed (${response.status}).`);
  }

  const json = await response.json();
  return json;
}

export function getTopAnime(signal) {
  return request("/top/anime?limit=12&sfw=true", signal);
}

export function getSeasonalAnime(signal) {
  return request("/seasons/now?limit=12&sfw=true", signal);
}

export function searchAnime({ query = "", page = 1, genre = "", sort = "popularity" }, signal) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: "12",
    sfw: "true",
    order_by: sort,
    sort: "desc"
  });

  if (genre) params.set("genres", genre);

  return request(`/anime?${params.toString()}`, signal);
}

export function getAnime(id, signal) {
  return request(`/anime/${id}/full`, signal);
}