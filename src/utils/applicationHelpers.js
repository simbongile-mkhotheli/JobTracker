// utils/applicationHelpers.js

/**
 * Extract clean domain from any input
 */
export function normalizeWebsite(input = "") {
  const raw = input.trim();
  if (!raw) return "";

  try {
    const url = raw.startsWith("http")
      ? new URL(raw)
      : new URL(`https://${raw}`);

    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Always return a valid clickable URL
 * FIX: this solves your chatgpt.com issue
 */
export function normalizeWebsiteUrl(input = "") {
  const raw = input.trim();
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return `https://${raw}`;
}

/**
 * Convert domain → company name
 */
export function domainToCompanyName(domain = "") {
  if (!domain) return "";

  const base = domain
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/[-_]+/g, " ")
    .trim();

  return base
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * favicon helper
 */
export function getFaviconUrl(domain = "") {
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/**
 * initials fallback
 */
export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * logo resolver
 */
export function getLogoSrc(application = {}) {
  return (
    application.logoUrl ||
    application.logo ||
    application.image ||
    null
  );
}

/**
 * safe date formatter
 */
export function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}