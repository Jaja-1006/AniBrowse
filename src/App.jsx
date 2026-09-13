import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import AnimeModal from "./components/AnimeModal";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Favorites from "./pages/Favorites";
import About from "./pages/About";

const STORAGE_KEY = "anivault:favorites";

function readFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [page, setPage] = useState("home");
  const [favorites, setFavorites] = useState(readFavorites);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handler = (event) => setPage(event.detail);
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, []);

  const toggleFavorite = (anime) => {
    setFavorites((current) =>
      current.some((item) => item.mal_id === anime.mal_id)
        ? current.filter((item) => item.mal_id !== anime.mal_id)
        : [anime, ...current]
    );
  };

  const isFavorite = (id) => favorites.some((item) => item.mal_id === id);

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <Navbar page={page} setPage={setPage} favoritesCount={favorites.length} />

      {page === "home" && (
        <Home favorites={favorites} onFavorite={toggleFavorite} onDetails={setSelectedId} goBrowse={() => setPage("browse")} />
      )}
      {page === "browse" && (
        <Browse favorites={favorites} onFavorite={toggleFavorite} onDetails={setSelectedId} />
      )}
      {page === "favorites" && (
        <Favorites favorites={favorites} onFavorite={toggleFavorite} onDetails={setSelectedId} />
      )}
      {page === "about" && <About />}

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>AniBrowse • INTECH 3112 Project</span>
          <span>Anime data via Jikan / MyAnimeList</span>
        </div>
      </footer>

      <AnimeModal
        id={selectedId}
        onClose={() => setSelectedId(null)}
        favorite={selectedId ? isFavorite(selectedId) : false}
        onFavorite={toggleFavorite}
      />
    </div>
  );
}
