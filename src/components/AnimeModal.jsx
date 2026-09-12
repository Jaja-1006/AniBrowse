import { useEffect, useState } from "react";
import { getAnime } from "../services/jikan";
import Loading from "./Loading";
import ErrorState from "./ErrorState";

export default function AnimeModal({ id, onClose, favorite, onFavorite }) {
  const [anime, setAnime] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setAnime(null);
    setError("");

    getAnime(id, controller.signal)
      .then((res) => setAnime(res.data))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [id, onClose]);

  if (!id) return null;

  const image = anime?.images?.webp?.large_image_url || anime?.images?.jpg?.large_image_url;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#11131a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-[.2em] text-orange-300">Anime details</span>
          <button onClick={onClose} className="rounded-lg px-3 py-1 text-xl text-zinc-500 hover:bg-white/5 hover:text-white" aria-label="Close">×</button>
        </div>

        {error ? (
          <div className="p-6"><ErrorState message={error} /></div>
        ) : !anime ? (
          <Loading text="Loading details..." />
        ) : (
          <div className="grid md:grid-cols-[240px_1fr]">
            <div className="bg-zinc-950 p-5">
              <img src={image} alt={anime.title} className="w-full rounded-2xl object-cover shadow-xl" />
              <button onClick={() => onFavorite(anime)} className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm font-bold ${favorite ? "border-orange-400/30 bg-orange-400/10 text-orange-300" : "border-white/10 bg-white/5 text-zinc-200"}`}>
                {favorite ? "♥ In favorites" : "♡ Add to favorites"}
              </button>
            </div>
            <div className="p-5 sm:p-7">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{anime.title}</h2>
              {anime.title_japanese && <p className="mt-1 text-sm text-zinc-500">{anime.title_japanese}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  anime.type,
                  anime.status,
                  anime.year,
                  anime.score ? `★ ${anime.score}` : null,
                  anime.episodes ? `${anime.episodes} episodes` : null
                ].filter(Boolean).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">{tag}</span>
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-zinc-400">{anime.synopsis || "No synopsis available."}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Info label="Aired" value={anime.aired?.string} />
                <Info label="Duration" value={anime.duration} />
                <Info label="Rating" value={anime.rating} />
                <Info label="Source" value={anime.source} />
                <Info label="Studios" value={anime.studios?.map((x) => x.name).join(", ")} />
                <Info label="Genres" value={anime.genres?.map((x) => x.name).join(", ")} />
              </div>
              {anime.url && (
                <a href={anime.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-lg bg-white px-4 py-2.5 text-xs font-extrabold text-zinc-950 hover:bg-zinc-200">
                  View source on MyAnimeList ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{label}</div>
      <div className="mt-1 text-sm text-zinc-300">{value || "—"}</div>
    </div>
  );
}