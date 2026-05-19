// components/ApplicationForm.jsx
import { useMemo, useState } from "react";

import { INITIAL_APPLICATION, STATUS_OPTIONS, INPUT_STYLE } from "../constants";
import { validateApplicationForm } from "../utils/validation";

import {
  normalizeWebsite,
  domainToCompanyName,
  getFaviconUrl,
} from "../utils/applicationHelpers";

export function ApplicationForm({
  onSubmit,
  initialValues = INITIAL_APPLICATION,
  submitLabel = "Add Application",
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    ...INITIAL_APPLICATION,
    ...initialValues,
  });

  const [isCompanyEdited, setIsCompanyEdited] = useState(
    Boolean(initialValues.company),
  );

  const [errors, setErrors] = useState({});

  const normalizedDomain = useMemo(
    () => normalizeWebsite(formData.website),
    [formData.website],
  );

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "company") {
      setIsCompanyEdited(true);

      setFormData((current) => ({
        ...current,
        company: value,
      }));

      return;
    }

    if (name === "website") {
      const domain = normalizeWebsite(value);

      setFormData((current) => ({
        ...current,
        website: value,

        company:
          !isCompanyEdited && domain
            ? domainToCompanyName(domain)
            : current.company,

        logoUrl: domain ? getFaviconUrl(domain) : "",
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

    const validationErrors = validateApplicationForm({
      ...formData,
      normalizedDomain,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      ...formData,
      company: formData.company.trim(),
      role: formData.role.trim(),
      notes: formData.notes.trim(),
      website: normalizeWebsite(formData.website),
    });

    setFormData(INITIAL_APPLICATION);
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="website"
            className="mb-2 block text-sm text-slate-300"
          >
            Company Website
          </label>

          <input
            id="website"
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="google.com"
            autoComplete="url"
            className={INPUT_STYLE}
          />

          {normalizedDomain ? (
            <p className="mt-2 text-xs text-slate-500">
              Detected domain: {normalizedDomain}
            </p>
          ) : null}

          {errors.website ? (
            <p className="mt-2 text-xs text-rose-400">{errors.website}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="company"
            className="mb-2 block text-sm text-slate-300"
          >
            Company
          </label>

          <input
            id="company"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Google"
            autoComplete="organization"
            className={INPUT_STYLE}
          />

          {errors.company ? (
            <p className="mt-2 text-xs text-rose-400">{errors.company}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="role" className="mb-2 block text-sm text-slate-300">
            Role
          </label>

          <input
            id="role"
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Frontend Developer"
            autoComplete="organization-title"
            className={INPUT_STYLE}
          />

          {errors.role ? (
            <p className="mt-2 text-xs text-rose-400">{errors.role}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="status" className="mb-2 block text-sm text-slate-300">
            Status
          </label>

          <select
            id="status"
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
          <label
            htmlFor="dateApplied"
            className="mb-2 block text-sm text-slate-300"
          >
            Date Applied
          </label>

          <input
            id="dateApplied"
            type="date"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleChange}
            className={INPUT_STYLE}
          />

          {errors.dateApplied ? (
            <p className="mt-2 text-xs text-rose-400">{errors.dateApplied}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="mb-2 block text-sm text-slate-300">
            Notes
          </label>

          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Optional notes..."
            className={`${INPUT_STYLE} resize-none`}
          />

          {errors.notes ? (
            <p className="mt-2 text-xs text-rose-400">{errors.notes}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="
            h-11 rounded-lg bg-indigo-600 px-6 py-2.5
            text-sm font-medium text-white transition
            hover:bg-indigo-500 active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
          "
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
