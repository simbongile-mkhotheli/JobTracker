import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

import { INITIAL_APPLICATION, STATUS_OPTIONS } from "../constants";
import { validateApplicationForm } from "../utils/validation";

import {
  normalizeWebsite,
  domainToCompanyName,
  getFaviconUrl,
} from "../utils/applicationHelpers";

import { InputField } from "./ui/InputField";
import { SelectField } from "./ui/SelectField";
import { TextareaField } from "./ui/TextareaField";
import type {
  Application,
  ApplicationFormValues,
} from "../types/application";

type ApplicationFormErrors = Partial<
  Record<keyof ApplicationFormValues, string>
>;

interface ApplicationFormProps {
  onSubmit: (application: ApplicationFormValues) => void | Promise<void>;
  initialValues?: ApplicationFormValues | Application;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ApplicationForm({
  onSubmit,
  initialValues = INITIAL_APPLICATION,
  submitLabel = "Add Application",
  isLoading = false,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormValues>({
    ...INITIAL_APPLICATION,
    ...initialValues,
  });

  const [isCompanyEdited, setIsCompanyEdited] = useState(
    Boolean(initialValues.company),
  );

  const [errors, setErrors] = useState<ApplicationFormErrors>({});

  const normalizedDomain = useMemo(
    () => normalizeWebsite(formData.website),
    [formData.website],
  );

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
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
      [name as keyof ApplicationFormValues]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateApplicationForm({
      ...formData,
      normalizedDomain,
    }) as ApplicationFormErrors;

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
          <InputField
            id="website"
            name="website"
            label="Company Website"
            type="text"
            value={formData.website}
            onChange={handleChange}
            placeholder="google.com"
            error={errors.website}
          />

          {normalizedDomain ? (
            <p className="mt-2 text-xs text-slate-500">
              Detected domain: {normalizedDomain}
            </p>
          ) : null}
        </div>

        <InputField
          id="company"
          name="company"
          label="Company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          placeholder="Google"
          error={errors.company}
        />

        <InputField
          id="role"
          name="role"
          label="Role"
          type="text"
          value={formData.role}
          onChange={handleChange}
          placeholder="Frontend Developer"
          error={errors.role}
        />

        <SelectField
          id="status"
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          options={[...STATUS_OPTIONS]}
          error={errors.status}
        />

        <InputField
          id="dateApplied"
          name="dateApplied"
          label="Date Applied"
          type="date"
          value={formData.dateApplied}
          onChange={handleChange}
          placeholder=""
          error={errors.dateApplied}
        />

        <div className="md:col-span-2">
          <TextareaField
            id="notes"
            name="notes"
            label="Notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes..."
            rows={4}
            error={errors.notes}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
