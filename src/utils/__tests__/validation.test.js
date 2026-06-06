import { describe, expect, it } from "vitest";

import { validateApplicationForm } from "../validation";

const validForm = {
  company: "Google",
  role: "Software Developer",
  website: "google.com",
  normalizedDomain: "google.com",
  notes: "Application submitted online.",
  dateApplied: "2026-04-10",
};

describe("validateApplicationForm", () => {
  it("returns no errors for a valid application", () => {
    expect(validateApplicationForm(validForm)).toEqual({});
  });

  it("returns a company error when company is missing", () => {
    expect(
      validateApplicationForm({
        ...validForm,
        company: "   ",
      }),
    ).toMatchObject({
      company: "Company name is required.",
    });
  });

  it("returns a role error when role is missing", () => {
    expect(
      validateApplicationForm({
        ...validForm,
        role: "",
      }),
    ).toMatchObject({
      role: "Role is required.",
    });
  });

  it("returns a website error for an invalid website", () => {
    expect(
      validateApplicationForm({
        ...validForm,
        website: "hello",
        normalizedDomain: "",
      }),
    ).toMatchObject({
      website: "Please enter a valid website domain.",
    });
  });

  it("returns a notes error when notes exceed the allowed length", () => {
    expect(
      validateApplicationForm({
        ...validForm,
        notes: "a".repeat(501),
      }),
    ).toMatchObject({
      notes: "Notes must be less than 500 characters.",
    });
  });

  it("returns a date error when dateApplied is missing", () => {
    expect(
      validateApplicationForm({
        ...validForm,
        dateApplied: "",
      }),
    ).toMatchObject({
      dateApplied: "Application date is required.",
    });
  });
});
