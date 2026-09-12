import AnimeGrid from "../components/AnimeGrid";

export default function Favorites({ favorites, onFavorite, onDetails }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-orange-300">Saved locally</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Favorites</h1>
        <p className="mt-2 text-sm text-zinc-500">Your saved titles stay in this browser using localStorage.</p>
      </div>
      <AnimeGrid anime={favorites} favorites={favorites} onFavorite={onFavorite} onDetails={onDetails} />
    </main>
  );
}