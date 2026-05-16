import { STATUS_OPTIONS, INPUT_STYLE } from "../constants";

export function SearchBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="mb-5 grid gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 sm:mb-6 sm:gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-xs text-slate-300 sm:text-sm">Search</label>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search company or role..."
          className={INPUT_STYLE}
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-slate-300 sm:text-sm">Status</label>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className={INPUT_STYLE}
        >
          <option>All</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
