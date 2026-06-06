import { describe, expect, it } from "vitest";

import { normalizeWebsite, normalizeWebsiteUrl } from "../applicationHelpers";

describe("normalizeWebsite", () => {
  it.each(["google.com", "google.co.uk", "google.org.za"])(
    "accepts valid multi-part domain %s",
    (domain) => {
      expect(normalizeWebsite(domain)).toBe(domain);
    },
  );

  it("strips protocol and www from a website url", () => {
    expect(normalizeWebsite("https://www.google.com")).toBe("google.com");
  });

  it("returns an empty string for invalid website text", () => {
    expect(normalizeWebsite("hello")).toBe("");
  });
});

describe("normalizeWebsiteUrl", () => {
  it("adds https when a url has no protocol", () => {
    expect(normalizeWebsiteUrl("google.com")).toBe("https://google.com");
  });

  it("keeps an existing protocol intact", () => {
    expect(normalizeWebsiteUrl("https://google.com")).toBe(
      "https://google.com",
    );
  });
});
