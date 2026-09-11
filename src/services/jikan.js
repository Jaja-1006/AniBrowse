const BASE_URL = "https://api.jikan.moe/v4";

async function request(path, signal) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { signal });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("API rate-limited. Please wait a moment and try again.");
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {

    if (error.name === "AbortError") {
      return null; 
    }
    throw error;
  }
}

export function getTopAnime(signal) {
  return request("/top/anime?limit=12&sfw=true", signal);
}

export function getSeasonalAnime(signal) {
  return request("/seasons/now?limit=12&sfw=true", signal);
}

export function searchAnime({ query = "", page = 1, genre = "", sort = "popularity" } = {}, signal) {
  const params = new URLSearchParams();

  if (query.trim()) params.append("q", query.trim());
  if (genre) params.append("genres", genre);

  params.append("page", String(page));
  params.append("limit", "12");
  params.append("sfw", "true");
  params.append("order_by", sort);
  params.append("sort", "desc");

  return request(`/anime?${params.toString()}`, signal);
}

export function getAnime(id, signal) {
  if (!id) throw new Error("Anime ID is required");
  return request(`/anime/${id}/full`, signal);
}
