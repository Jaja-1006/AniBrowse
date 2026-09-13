export default function Loading({ text = "Loading anime..." }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-4 text-zinc-400">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-orange-400" />
      <p className="text-sm">{text}</p>
    </div>
  );
}