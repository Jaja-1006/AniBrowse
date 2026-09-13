const JIKAN_BASE = "https://api.jikan.moe/v4";
const ANILIST_BASE = "https://graphql.anilist.co";
const KITSU_BASE = "https://kitsu.io/api/edge";

import { GENRES } from "../data";

// Jikan genre IDs -> display name, so AniList/Kitsu fallbacks can
// filter by genre too (they don't understand MAL genre IDs).
const GENRE_NAME_BY_ID = Object.fromEntries(GENRES.filter((g) => g.id).map((g) => [g.id, g.name]));

// Our SORT_OPTIONS values -> each backend's own sort vocabulary.
const ANILIST_SORT_MAP = {
  popularity: "POPULARITY_DESC",
  score: "SCORE_DESC",
  title: "TITLE_ROMAJI",
  rank: "SCORE_DESC",
  start_date: "START_DATE_DESC"
};

const KITSU_SORT_MAP = {
  popularity: "-userCount",
  score: "-averageRating",
  title: "canonicalTitle",
  rank: "-averageRating",
  start_date: "-startDate"
};

function normalizeAnime(item, source) {
  if (source === "jikan") return item;

  if (source === "anilist") {
    return {
      mal_id: item.id,
      title: item.title?.english || item.title?.userPreferred || item.title?.romaji,
      title_english: item.title?.english,
      title_japanese: item.title?.native,
      images: {
        jpg: {
          image_url: item.coverImage?.large || item.coverImage?.medium,
          large_image_url: item.coverImage?.extraLarge || item.coverImage?.large
        }
      },
      score: item.averageScore ? item.averageScore / 10 : null,
      type: item.format,
      episodes: item.episodes,
      status: item.status,
      synopsis: item.description ? item.description.replace(/<[^>]*>?/gm, '') : "",
      genres: item.genres ? item.genres.map((g) => ({ name: g })) : []
    };
  }

  if (source === "kitsu") {
    const attr = item.attributes || {};
    return {
      mal_id: item.id,
      title: attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp,
      title_english: attr.titles?.en,
      title_japanese: attr.titles?.ja_jp,
      images: {
        jpg: {
          image_url: attr.posterImage?.small || attr.posterImage?.original,
          large_image_url: attr.posterImage?.large || attr.posterImage?.original
        }
      },
      score: attr.averageRating ? parseFloat((attr.averageRating / 10).toFixed(1)) : null,
      type: attr.subtype?.toUpperCase(),
      episodes: attr.episodeCount,
      status: attr.status,
      synopsis: attr.synopsis || "",
      genres: []
    };
  }

  return item;
}

async function queryAniList(query, variables, signal) {
  const response = await fetch(ANILIST_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal
  });
  if (!response.ok) throw new Error(`AniList error status ${response.status}`);
  const json = await response.json();
  return json.data;
}

async function fetchJikan(path, signal) {
  const response = await fetch(`${JIKAN_BASE}${path}`, { signal });
  if (!response.ok) throw new Error(`Jikan failed: ${response.status}`);
  return await response.json();
}

async function fetchWithFallback(jikanFn, aniListFn, kitsuFn, signal) {
  try {
    return await jikanFn();
  } catch (jikanError) {
    if (jikanError.name === "AbortError") throw jikanError;
    console.warn("Jikan API failed. Retrying with AniList...", jikanError.message);

    try {
      return await aniListFn();
    } catch (aniListError) {
      if (aniListError.name === "AbortError") throw aniListError;
      console.warn("AniList API failed. Retrying with Kitsu...", aniListError.message);

      try {
        return await kitsuFn();
      } catch (kitsuError) {
        if (kitsuError.name === "AbortError") throw kitsuError;
        throw new Error("All anime API endpoints are currently unavailable. Please try again later.");
      }
    }
  }
}


export function getTopAnime(signal) {
  return fetchWithFallback(
    async () => fetchJikan("/top/anime?limit=12&sfw=true", signal),
    async () => {
      const gql = `
        query {
          Page(page: 1, perPage: 12) {
            media(type: ANIME, sort: POPULARITY_DESC) {
              id title { english romaji native } coverImage { large extraLarge }
              averageScore format episodes status description genres
            }
          }
        }`;
      const res = await queryAniList(gql, {}, signal);
      return { data: res.Page.media.map((item) => normalizeAnime(item, "anilist")) };
    },
    async () => {
      const res = await fetch(`${KITSU_BASE}/anime?page[limit]=12&sort=-userCount`, { signal });
      if (!res.ok) throw new Error("Kitsu failed");
      const json = await res.json();
      return { data: json.data.map((item) => normalizeAnime(item, "kitsu")) };
    },
    signal
  );
}

export function getSeasonalAnime(signal) {
  return fetchWithFallback(
    async () => fetchJikan("/seasons/now?limit=12&sfw=true", signal),
    async () => {
      const gql = `
        query {
          Page(page: 1, perPage: 12) {
            media(type: ANIME, season: SUMMER, seasonYear: 2026, sort: POPULARITY_DESC) {
              id title { english romaji native } coverImage { large extraLarge }
              averageScore format episodes status description genres
            }
          }
        }`;
      const res = await queryAniList(gql, {}, signal);
      return { data: res.Page.media.map((item) => normalizeAnime(item, "anilist")) };
    },
    async () => {
      const res = await fetch(`${KITSU_BASE}/anime?page[limit]=12&sort=-startDate`, { signal });
      if (!res.ok) throw new Error("Kitsu failed");
      const json = await res.json();
      return { data: json.data.map((item) => normalizeAnime(item, "kitsu")) };
    },
    signal
  );
}

export function searchAnime({ query = "", page = 1, genre = "", sort = "popularity" } = {}, signal) {
  const genreName = GENRE_NAME_BY_ID[genre] || null;

  return fetchWithFallback(
    async () => {
      const params = new URLSearchParams({ page: String(page), limit: "12", sfw: "true", sort: "desc" });
      if (query.trim()) params.append("q", query.trim());
      if (genre) params.append("genres", genre);
      params.append("order_by", sort);
      return fetchJikan(`/anime?${params.toString()}`, signal);
    },
    async () => {
      const gql = `
        query ($search: String, $page: Int, $genre: String, $sort: [MediaSort]) {
          Page(page: $page, perPage: 12) {
            media(type: ANIME, search: $search, genre: $genre, sort: $sort) {
              id title { english romaji native } coverImage { large extraLarge }
              averageScore format episodes status description genres
            }
          }
        }`;
      const res = await queryAniList(gql, {
        search: query || undefined,
        page,
        genre: genreName || undefined,
        sort: [ANILIST_SORT_MAP[sort] || "POPULARITY_DESC"]
      }, signal);
      return { data: res.Page.media.map((item) => normalizeAnime(item, "anilist")) };
    },
    async () => {
      const offset = (page - 1) * 12;
      const qParam = query ? `&filter[text]=${encodeURIComponent(query)}` : "";
      const genreParam = genreName ? `&filter[categories]=${encodeURIComponent(genreName.toLowerCase().replace(/\s+/g, "-"))}` : "";
      const sortParam = `&sort=${encodeURIComponent(KITSU_SORT_MAP[sort] || "-userCount")}`;
      const res = await fetch(`${KITSU_BASE}/anime?page[limit]=12&page[offset]=${offset}${qParam}${genreParam}${sortParam}`, { signal });
      if (!res.ok) throw new Error("Kitsu failed");
      const json = await res.json();
      return { data: json.data.map((item) => normalizeAnime(item, "kitsu")) };
    },
    signal
  );
}

export function getAnime(id, signal) {
  return fetchWithFallback(
    async () => fetchJikan(`/anime/${id}/full`, signal),
    async () => {
      const gql = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id title { english romaji native } coverImage { large extraLarge }
            averageScore format episodes status description genres
          }
        }`;
      const res = await queryAniList(gql, { id: parseInt(id, 10) }, signal);
      return { data: normalizeAnime(res.Media, "anilist") };
    },
    async () => {
      const res = await fetch(`${KITSU_BASE}/anime/${id}`, { signal });
      if (!res.ok) throw new Error("Kitsu failed");
      const json = await res.json();
      return { data: normalizeAnime(json.data, "kitsu") };
    },
    signal
  );
}
