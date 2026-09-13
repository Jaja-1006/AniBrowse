export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search anime titles..."
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-28 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-400/50 focus:bg-white/[.07]"
        aria-label="Search anime"
      />
      <button className="absolute right-1.5 top-1.5 h-9 rounded-lg bg-orange-500 px-4 text-xs font-extrabold text-white transition hover:bg-orange-400">
        Search
      </button>
    </form>
  );
}