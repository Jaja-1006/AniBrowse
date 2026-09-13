import { useState } from "react";
import Logo from "./Logo";

const links = [
  ["home", "Home"],
  ["browse", "Browse"],
  ["favorites", "Favorites"],
  ["about", "About"]
];

export default function Navbar({ page, setPage, favoritesCount }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (id) => {
    setPage(id);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090a0f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-shrink-0">
          <Logo />
        </div>

        <nav className="hidden items-center gap-0.5 sm:flex md:gap-1">
          {links.map(([id, label]) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`relative whitespace-nowrap rounded-lg px-2 py-2 text-xs font-semibold transition sm:px-2.5 sm:text-sm md:px-3 ${
                page === id ? "bg-orange-500 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
              {id === "favorites" && favoritesCount > 0 && (
                <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 sm:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 sm:hidden">
          {links.map(([id, label]) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                page === id ? "bg-orange-500 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
              {id === "favorites" && favoritesCount > 0 && (
                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}