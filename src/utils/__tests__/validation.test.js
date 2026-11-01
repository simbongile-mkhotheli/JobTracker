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

  it.each([
    ["company", 2],
    ["company", 50],
    ["role", 2],
    ["role", 80],
    ["notes", 500],
  ])(
    "accepts %s at its %i-character boundary after trimming",
    (field, length) => {
      expect(
        validateApplicationForm({
          ...validForm,
          [field]: `  ${"a".repeat(length)}  `,
        }),
      ).toEqual({});
    },
  );

  it.each([
    ["company", "a", "Company name must be at least 2 characters."],
    [
      "company",
      "a".repeat(51),
      "Company name must be less than 50 characters.",
    ],
    ["role", "a", "Role must be at least 2 characters."],
    ["role", "a".repeat(81), "Role must be less than 80 characters."],
  ])("rejects an out-of-range %s", (field, value, message) => {
    expect(
      validateApplicationForm({ ...validForm, [field]: ` ${value} ` }),
    ).toEqual({ [field]: message });
  });

  it("allows optional website and notes to be empty", () => {
    expect(
      validateApplicationForm({
        ...validForm,
        website: "",
        normalizedDomain: "",
        notes: "  ",
      }),
    ).toEqual({});
  });

  it("reports all invalid fields together without changing the entered values", () => {
    const form = Object.freeze({
      ...validForm,
      company: "  ",
      role: "  ",
      website: "invalid",
      normalizedDomain: "",
      notes: "a".repeat(501),
      dateApplied: "",
    });

    expect(validateApplicationForm(form)).toEqual({
      company: "Company name is required.",
      role: "Role is required.",
      website: "Please enter a valid website domain.",
      notes: "Notes must be less than 500 characters.",
      dateApplied: "Application date is required.",
    });
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
