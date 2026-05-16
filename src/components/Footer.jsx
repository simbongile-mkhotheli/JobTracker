export function Footer() {
  return (
    <div className="mt-8 sm:mt-10 flex flex-col gap-3 rounded-lg sm:rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/10 border border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="text-sm font-semibold sm:text-base">Keep pushing forward 💪</p>
        <p className="mt-1 text-xs text-gray-400 sm:mt-0.5 sm:text-sm">
          Every application is a step closer.
        </p>
      </div>
      <button className="shrink-0 bg-white/10 px-4 py-2 rounded-lg text-sm transition hover:bg-white/15 active:scale-95">
        View Statistics
      </button>
    </div>
  );
}
