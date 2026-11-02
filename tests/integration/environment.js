import { Buffer } from "node:buffer";
import { accessSync, constants, statSync } from "node:fs";
import { isAbsolute } from "node:path";
import process from "node:process";

// These are existing production/unrelated projects, never test substitutes.
const protectedProjects = new Set([
  "urzvwixshavciyktjlhw",
  "wcxyfvuoalazgaxxmzbu",
  "mocwprkxrjxivlffhamo",
  "cetifxwtzwngldudtojq",
]);

function blocked(message) {
  throw new Error("BLOCKED: " + message);
}

function required(environment, name) {
  const value = environment[name];
  if (typeof value !== "string" || !value.trim()) {
    blocked(
      "Missing " + name + ". An approved disposable project is required.",
    );
  }
  return value;
}

function requiredFile(environment, name) {
  const path = required(environment, name);
  try {
    if (!isAbsolute(path) || !statSync(path).isFile()) throw new Error();
    accessSync(path, constants.R_OK);
  } catch {
    blocked(name + " must identify a readable file at an absolute path.");
  }
  return path;
}

export function readTestEnvironment(environment = process.env) {
  const projectRef = required(environment, "JOBTRACKER_TEST_PROJECT_REF");
  if (!/^[a-z0-9]{20}$/.test(projectRef) || protectedProjects.has(projectRef)) {
    blocked(
      "Production, unrelated, or invalid project references are forbidden.",
    );
  }
  if (environment.JOBTRACKER_TEST_DISPOSABLE !== "yes") {
    blocked("Explicit disposable-environment acknowledgement is required.");
  }

  let url;
  try {
    url = new URL(required(environment, "JOBTRACKER_TEST_SUPABASE_URL"));
  } catch {
    blocked("A dedicated HTTPS Supabase test URL is required.");
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== projectRef + ".supabase.co" ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    blocked("The test URL must exactly match the approved disposable project.");
  }

  const key = required(environment, "JOBTRACKER_TEST_PUBLIC_KEY");
  if (!key.startsWith("sb_publishable_")) {
    let payload;
    try {
      const parts = key.split(".");
      if (parts.length !== 3)
        blocked("A publishable or legacy anon key is required.");
      payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    } catch {
      blocked("A publishable or legacy anon key is required.");
    }
    // This is an accidental-target/key guard, not JWT signature verification.
    // The Supabase gateway still verifies credentials and user sessions.
    if (payload?.role !== "anon" || payload?.ref !== projectRef) {
      blocked("Privileged keys and keys for other projects are forbidden.");
    }
  }

  const emailA = required(environment, "JOBTRACKER_TEST_USER_A_EMAIL");
  const emailB = required(environment, "JOBTRACKER_TEST_USER_B_EMAIL");
  if (
    !/^[^@\s]+@example\.invalid$/.test(emailA) ||
    !/^[^@\s]+@example\.invalid$/.test(emailB) ||
    emailA.toLowerCase() === emailB.toLowerCase()
  ) {
    blocked("Two distinct synthetic example.invalid accounts are required.");
  }

  return {
    projectRef,
    url: url.origin,
    key,
    emailA,
    emailB,
    passwordA: required(environment, "JOBTRACKER_TEST_USER_A_PASSWORD"),
    passwordB: required(environment, "JOBTRACKER_TEST_USER_B_PASSWORD"),
    passfile: requiredFile(environment, "JOBTRACKER_TEST_PGPASSFILE"),
    rootCertificate: requiredFile(environment, "JOBTRACKER_TEST_SSLROOTCERT"),
  };
}
