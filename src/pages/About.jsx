export default function About() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6 sm:p-10">
        <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-violet-300">Project information</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">About AniVault</h1>
        <p className="mt-5 text-sm leading-7 text-zinc-400">
          AniVault is a responsive React anime browser built for the INTECH 3112 project requirements.
          It demonstrates reusable React components, state, effects, event handling, Tailwind CSS,
          responsive layouts, and asynchronous API retrieval.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Tech title="Frontend" text="React + Vite" />
          <Tech title="Styling" text="Tailwind CSS" />
          <Tech title="API" text="Jikan REST API v4" />
          <Tech title="Deployment" text="Vercel" />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="font-bold">Data & attribution</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Jikan is an unofficial, open-source REST API for MyAnimeList data. This app does not host anime video files
            or provide streaming functionality.
          </p>
          <a href="https://jikan.moe/" target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-bold text-violet-300 hover:text-violet-200">
            Jikan API ↗
          </a>
        </div>
      </div>
    </main>
  );
}

function Tech({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-600">{title}</div>
      <div className="mt-2 font-semibold text-zinc-200">{text}</div>
    </div>
  );
}