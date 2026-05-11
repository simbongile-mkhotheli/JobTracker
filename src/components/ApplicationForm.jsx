import { useState } from "react";

const INITIAL_FORM = {
  company: "",
  role: "",
  status: "Applied",
  dateApplied: "",
};

export function ApplicationForm({ onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_FORM);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit(formData);

    setFormData(INITIAL_FORM);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Add New Application
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Track your latest job opportunity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Company
          </label>

          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Google"
            required
            className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Role
          </label>

          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Frontend Developer"
            required
            className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Date Applied
          </label>

          <input
            type="date"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Add Application
      </button>
    </form>
  );
}