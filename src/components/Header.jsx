import { Moon, Plus } from "lucide-react";

export function Header() {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back 👋</h1>
        <p className="text-sm text-gray-400">
          Track, manage and land your dream job.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg bg-white/5">
          <Moon size={18} />
        </button>
        <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg">
          <Plus size={16} /> Add Application
        </button>
      </div>
    </div>
  );
}
