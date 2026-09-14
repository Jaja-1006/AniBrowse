import { useEffect, useState } from "react";
import { getSeasonalAnime, getTopAnime } from "../services/jikan";
import AnimeGrid from "../components/AnimeGrid";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";

export default function Home({ favorites, onFavorite, onDetails, goBrowse }) {
  const [top, setTop] = useState([]);
  const [seasonal, setSeasonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([getTopAnime(controller.signal), getSeasonalAnime(controller.signal)])
      .then(([topRes, seasonRes]) => {
        setTop(topRes.data || []);
        setSeasonal(seasonRes.data || []);
      })
      .catch((err) => err.name !== "AbortError" && setError(err.message))
      .finally(() => setLoading(false));
    return () => controller.abort();
  };

  useEffect(load, []);

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[.25em] text-orange-300">Your anime discovery hub</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
            Discover your next <span className="bg-gradient-to-r from-orange-300 to-yellow-200 bg-clip-text text-transparent">favorite anime.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Search, filter, explore details, and save anime to your personal favorites.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={goBrowse} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-950/30 hover:bg-orange-400">
              Browse anime
            </button>
            <button onClick={() => document.getElementById("top-anime")?.scrollIntoView()} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-zinc-200 hover:bg-white/10">
              Explore top anime
            </button>
          </div>
        </div>
      </section>

      <section id="top-anime" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {error ? <ErrorState message={error} onRetry={load} /> : loading ? <Loading /> : (
          <>
            <SectionTitle eyebrow="Popular right now" title="Top anime" />
            <AnimeGrid anime={top} favorites={favorites} onFavorite={onFavorite} onDetails={onDetails} />
            <div className="mt-16">
              <SectionTitle eyebrow="Current season" title="Seasonal picks" />
              <AnimeGrid anime={seasonal} favorites={favorites} onFavorite={onFavorite} onDetails={onDetails} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-orange-300">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h2>
    </div>
  );
}
