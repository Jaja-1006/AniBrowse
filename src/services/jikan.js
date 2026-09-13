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

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDatePart(d) {
  if (!d?.year) return null;
  if (d.month && d.day) return `${MONTHS[d.month]} ${d.day}, ${d.year}`;
  if (d.month) return `${MONTHS[d.month]} ${d.year}`;
  return `${d.year}`;
}

// AniList gives separate start/end date objects; Jikan's modal expects a
// single "Apr 7, 2013 to Sep 29, 2013"-style string.
function formatAniListAired(start, end) {
  const s = fmtDatePart(start);
  if (!s) return null;
  const e = fmtDatePart(end);
  return e ? `${s} to ${e}` : `${s} to ?`;
}

// AniList enums come back as MANGA / LIGHT_NOVEL / etc.
function titleCaseFromEnum(value) {
  if (!value) return null;
  return value.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function formatKitsuAired(start, end) {
  if (!start) return null;
  return end && end !== start ? `${start} to ${end}` : `${start} to ?`;
}

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
      genres: item.genres ? item.genres.map((g) => ({ name: g })) : [],
      year: item.seasonYear || item.startDate?.year || null,
      aired: { string: formatAniListAired(item.startDate, item.endDate) },
      duration: item.duration ? `${item.duration} min per ep` : null,
      // AniList doesn't publish MAL-style content ratings (R-17+, PG-13, etc.)
      rating: null,
      source: titleCaseFromEnum(item.source),
      studios: item.studios?.nodes?.map((s) => ({ name: s.name })) || [],
      url: item.siteUrl || null
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
      genres: [],
      year: attr.startDate ? Number(attr.startDate.slice(0, 4)) : null,
      aired: { string: formatKitsuAired(attr.startDate, attr.endDate) },
      duration: attr.episodeLength ? `${attr.episodeLength} min per ep` : null,
      rating: attr.ageRating ? `${attr.ageRating}${attr.ageRatingGuide ? " - " + attr.ageRatingGuide : ""}` : null,
      // Kitsu needs a separate relationship call for studio credits, so this
      // stays empty on the fallback path rather than firing an extra request.
      source: null,
      studios: [],
      url: attr.slug ? `https://kitsu.io/anime/${attr.slug}` : null
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
            pageInfo { total lastPage currentPage }
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
      return {
        data: res.Page.media.map((item) => normalizeAnime(item, "anilist")),
        pagination: {
          last_visible_page: res.Page.pageInfo?.lastPage || 1,
          items: { total: res.Page.pageInfo?.total }
        }
      };
    },
    async () => {
      const offset = (page - 1) * 12;
      const qParam = query ? `&filter[text]=${encodeURIComponent(query)}` : "";
      const genreParam = genreName ? `&filter[categories]=${encodeURIComponent(genreName.toLowerCase().replace(/\s+/g, "-"))}` : "";
      const sortParam = `&sort=${encodeURIComponent(KITSU_SORT_MAP[sort] || "-userCount")}`;
      const res = await fetch(`${KITSU_BASE}/anime?page[limit]=12&page[offset]=${offset}${qParam}${genreParam}${sortParam}`, { signal });
      if (!res.ok) throw new Error("Kitsu failed");
      const json = await res.json();
      // Kitsu doesn't always return a total count. When it does, use it for
      // an exact page count; otherwise assume another page exists as long
      // as this one came back full, so "Next" keeps working either way.
      const total = json.meta?.count;
      const lastPage = total
        ? Math.max(1, Math.ceil(total / 12))
        : (json.data.length === 12 ? page + 1 : page);
      return {
        data: json.data.map((item) => normalizeAnime(item, "kitsu")),
        pagination: { last_visible_page: lastPage, items: { total } }
      };
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
            seasonYear startDate { year month day } endDate { year month day }
            duration source siteUrl
            studios(isMain: true) { nodes { name } }
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
