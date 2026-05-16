// components/Header.jsx
import { Moon } from "lucide-react";

export function Header() {
  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">
          Welcome back, Job Seeker!
        </h1>

        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Track, manage and land your dream job.
        </p>
      </div>

      <button
        type="button"
        className="shrink-0 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <Moon size={18} />
      </button>
    </div>
  );
}