import { STATUS_OPTIONS, INPUT_STYLE } from "../constants";

export function SearchBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Search</label>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search company or role..."
          className={INPUT_STYLE}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Status</label>

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
