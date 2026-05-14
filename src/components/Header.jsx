// components/Header.jsx
import { Moon } from "lucide-react";

export function Header() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, Job Seeker!
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Track, manage and land your dream job.
        </p>
      </div>

      <button
        type="button"
        className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <Moon size={18} />
      </button>
    </div>
  );
}