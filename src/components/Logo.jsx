export default function Logo() {
  return (
    <button
      className="flex items-center gap-3 text-left"
      onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }))}
      aria-label="Go to home"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-600 to-yellow-500 text-lg font-black shadow-lg shadow-orange-950/30">
        A
      </span>
      <span className="hidden text-lg font-extrabold tracking-tight sm:block">
        Ani<span className="text-orange-400">Vault</span>
      </span>
    </button>
  );
}