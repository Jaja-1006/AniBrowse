import AnimeCard from "./AnimeCard";

export default function AnimeGrid({ anime, favorites, onFavorite, onDetails }) {
  if (!anime.length) {
    return <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-zinc-500">No anime matched your search.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {anime.map((item) => (
        <AnimeCard
          key={item.mal_id}
          anime={item}
          favorite={favorites.some((fav) => fav.mal_id === item.mal_id)}
          onFavorite={onFavorite}
          onDetails={onDetails}
        />
      ))}
    </div>
  );
}