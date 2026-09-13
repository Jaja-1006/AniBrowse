import { useEffect, useState } from "react";
import { GENRES, SORT_OPTIONS } from "../data";
import { searchAnime } from "../services/jikan";
import AnimeGrid from "../components/AnimeGrid";
import SearchBar from "../components/SearchBar";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";

export default function Browse({ favorites, onFavorite, onDetails }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("popularity");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    searchAnime({ query: submitted, page, genre, sort }, controller.signal)
      .then((res) => {
        setItems(res.data || []);
        setPagination(res.pagination || {});
      })
      .catch((err) => err.name !== "AbortError" && setError(err.message))
      .finally(() => setLoading(false));
    return () => controller.abort();
  };

  useEffect(load, [submitted, page, genre, sort]);

  const submit = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmitted(query.trim());
  };

  const changeFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-orange-300">Anime library</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Browse anime</h1>
        <p className="mt-2 text-sm text-zinc-500">Search the catalog or narrow it down with genre and sorting.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:p-5">
        <SearchBar value={query} onChange={setQuery} onSubmit={submit} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <select value={genre} onChange={changeFilter(setGenre)} className="h-11 rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-300 outline-none focus:border-orange-400/50">
            {GENRES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={sort} onChange={changeFilter(setSort)} className="h-11 rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-300 outline-none focus:border-orange-400/50">
            {SORT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {error ? <ErrorState message={error} onRetry={load} /> : loading ? <Loading /> : (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">{submitted ? `Results for “${submitted}”` : "Anime catalog"}</p>
              {pagination.items?.total != null && <p className="text-xs text-zinc-600">{pagination.items.total.toLocaleString()} results</p>}
            </div>
            <AnimeGrid anime={items} favorites={favorites} onFavorite={onFavorite} onDetails={onDetails} />
            <Pagination page={page} lastPage={pagination.last_visible_page} onPage={setPage} />
          </>
        )}
      </div>
    </main>
  );
}