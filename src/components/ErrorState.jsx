export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
      <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-red-400/10 text-red-300">!</div>
      <h3 className="font-bold text-white">Could not load anime</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-zinc-200">
          Try again
        </button>
      )}
    </div>
  );
}