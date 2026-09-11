import Logo from "./Logo";

const links = [
  ["home", "Home"],
  ["browse", "Browse"],
  ["favorites", "Favorites"],
  ["about", "About"]
];

export default function Navbar({ page, setPage, favoritesCount }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090a0f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {links.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                page === id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
              {id === "favorites" && favoritesCount > 0 && (
                <span className="ml-1.5 rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}