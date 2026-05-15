// components/ApplicationForm.jsx
import { useMemo, useState } from "react";

import { INITIAL_APPLICATION, STATUS_OPTIONS, INPUT_STYLE } from "../constants";

import {
  normalizeWebsite,
  domainToCompanyName,
  getFaviconUrl,
} from "../utils/applicationHelpers";

export function ApplicationForm({
  onSubmit,
  initialValues = INITIAL_APPLICATION,
  submitLabel = "Add Application",
}) {
  const [formData, setFormData] = useState({
    ...INITIAL_APPLICATION,
    ...initialValues,
  });

  const normalizedDomain = useMemo(
    () => normalizeWebsite(formData.website),
    [formData.website],
  );

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "website") {
      const domain = normalizeWebsite(value);

      setFormData((current) => ({
        ...current,
        website: value,

        company: current.company
          ? current.company
          : domainToCompanyName(domain),

        logoUrl: getFaviconUrl(domain),
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      ...formData,
      website: normalizeWebsite(formData.website),
    });

    setFormData(INITIAL_APPLICATION);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">
            Company Website
          </label>

          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="chatgpt.com"
            className={INPUT_STYLE}
          />

          {normalizedDomain ? (
            <p className="mt-2 text-xs text-slate-500">
              Detected domain: {normalizedDomain}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Company
          </label>

          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="OpenAI"
            required
            className={INPUT_STYLE}
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
            className={INPUT_STYLE}
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
            className={INPUT_STYLE}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status}>{status}</option>
            ))}
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
            className={INPUT_STYLE}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">
            Notes
          </label>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Optional notes..."
            className={`${INPUT_STYLE} resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        {submitLabel}
      </button>
    </form>
  );
}