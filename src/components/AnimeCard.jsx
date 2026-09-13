function scoreLabel(score) {
  return score ? Number(score).toFixed(1) : "N/A";
}

export default function AnimeCard({ anime, favorite, onFavorite, onDetails }) {
  const image = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:bg-white/[.055]">
      <button onClick={() => onDetails(anime.mal_id)} className="block w-full text-left" aria-label={`View ${anime.title}`}>
        <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
          {image ? (
            <img src={image} alt={anime.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-zinc-600">No image</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 pt-12">
            <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold text-amber-300 backdrop-blur">
              ★ {scoreLabel(anime.score)}
            </span>
          </div>
          {anime.rank && (
            <span className="absolute left-3 top-3 rounded-md bg-black/65 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
              #{anime.rank}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 min-h-11 text-sm font-bold leading-5 text-white">{anime.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-zinc-500">
            <span>{anime.type || "Unknown"}</span>
            <span>•</span>
            <span>{anime.episodes || "?"} eps</span>
            <span>•</span>
            <span>{anime.year || anime.aired?.prop?.from?.year || "—"}</span>
          </div>
        </div>
      </button>
      <div className="px-4 pb-4">
        <button
          onClick={() => onFavorite(anime)}
          className={`w-full rounded-lg border px-3 py-2 text-xs font-bold transition ${
            favorite
              ? "border-orange-400/30 bg-orange-400/10 text-orange-300"
              : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
          }`}
        >
          {favorite ? "♥ In favorites" : "♡ Add to favorites"}
        </button>
      </div>
    </article>
  );
}