export default function Pagination({ page, lastPage, onPage }) {
  if (!lastPage || lastPage <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(lastPage, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button disabled={page === 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-400 disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/5">
        Previous
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onPage(p)} className={`h-9 min-w-9 rounded-lg px-3 text-xs font-bold ${p === page ? "bg-violet-500 text-white" : "border border-white/10 text-zinc-400 hover:bg-white/5"}`}>
          {p}
        </button>
      ))}
      <button disabled={page === lastPage} onClick={() => onPage(page + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-400 disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/5">
        Next
      </button>
    </div>
  );
}