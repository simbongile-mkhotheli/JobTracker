import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { after, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { createClient } from "@supabase/supabase-js";
import { validatePrerequisites } from "./database.js";
import { readTestEnvironment } from "./environment.js";
import { boundedFetch } from "./http.js";

// Only local placeholders; no certificate or password contents are trusted here.
const directory = mkdtempSync(join(tmpdir(), "jobtracker-security-offline-"));
const passfile = join(directory, "test-password-file");
const certificate = join(directory, "test-root-certificate");
for (const path of [passfile, certificate])
  writeFileSync(path, "offline placeholder");
after(() => {
  for (const path of [passfile, certificate]) unlinkSync(path);
  rmdirSync(directory);
});

const projectRef = "abcdefghijklmnopqrst";
function configuration() {
  return {
    JOBTRACKER_TEST_PROJECT_REF: projectRef,
    JOBTRACKER_TEST_DISPOSABLE: "yes",
    JOBTRACKER_TEST_SUPABASE_URL: "https://" + projectRef + ".supabase.co",
    JOBTRACKER_TEST_PUBLIC_KEY: "sb_publishable_synthetic_offline_value",
    JOBTRACKER_TEST_USER_A_EMAIL: "security-a@example.invalid",
    JOBTRACKER_TEST_USER_B_EMAIL: "security-b@example.invalid",
    JOBTRACKER_TEST_USER_A_PASSWORD: "synthetic-a-password",
    JOBTRACKER_TEST_USER_B_PASSWORD: "synthetic-b-password",
    JOBTRACKER_TEST_PGPASSFILE: passfile,
    JOBTRACKER_TEST_SSLROOTCERT: certificate,
  };
}
function legacyKey(payload) {
  return (
    "header." +
    Buffer.from(JSON.stringify(payload)).toString("base64url") +
    ".signature"
  );
}

test("missing test configuration fails closed without using VITE variables", () => {
  assert.throws(
    () =>
      readTestEnvironment({
        VITE_SUPABASE_URL: "https://urzvwixshavciyktjlhw.supabase.co",
      }),
    /BLOCKED: Missing JOBTRACKER_TEST_PROJECT_REF/,
  );
});

test("production and every known unrelated project are rejected", () => {
  for (const ref of [
    "urzvwixshavciyktjlhw",
    "wcxyfvuoalazgaxxmzbu",
    "mocwprkxrjxivlffhamo",
    "cetifxwtzwngldudtojq",
  ]) {
    assert.throws(
      () =>
        readTestEnvironment({
          ...configuration(),
          JOBTRACKER_TEST_PROJECT_REF: ref,
        }),
      /forbidden/,
    );
  }
});

test("a disposable acknowledgement is mandatory", () => {
  assert.throws(
    () =>
      readTestEnvironment({
        ...configuration(),
        JOBTRACKER_TEST_DISPOSABLE: "no",
      }),
    /acknowledgement/,
  );
});

test("URL substitution, insecure transport, and hidden connection components are rejected", () => {
  for (const url of [
    "http://" + projectRef + ".supabase.co",
    "https://urzvwixshavciyktjlhw.supabase.co",
    "https://" + projectRef + ".supabase.co.evil.example",
    "https://user:password@" + projectRef + ".supabase.co",
    "https://" + projectRef + ".supabase.co:9999",
    "https://" + projectRef + ".supabase.co/rest/v1/",
    "https://" + projectRef + ".supabase.co/?target=production",
    "https://" + projectRef + ".supabase.co/#fragment",
  ]) {
    assert.throws(
      () =>
        readTestEnvironment({
          ...configuration(),
          JOBTRACKER_TEST_SUPABASE_URL: url,
        }),
      /BLOCKED/,
    );
  }
});

test("privileged and wrong-project keys are rejected without exposing their values", () => {
  for (const key of [
    "sb_secret_do_not_display",
    legacyKey({ role: "service_role", ref: projectRef }),
    legacyKey({ role: "anon", ref: "urzvwixshavciyktjlhw" }),
  ]) {
    assert.throws(
      () =>
        readTestEnvironment({
          ...configuration(),
          JOBTRACKER_TEST_PUBLIC_KEY: key,
        }),
      (error) =>
        error.message.startsWith("BLOCKED:") && !error.message.includes(key),
    );
  }
});

test("test accounts must be distinct synthetic identities", () => {
  for (const email of [
    "real@example.com",
    "security-a@example.invalid",
    "SECURITY-A@example.invalid",
  ]) {
    assert.throws(
      () =>
        readTestEnvironment({
          ...configuration(),
          JOBTRACKER_TEST_USER_B_EMAIL: email,
        }),
      /synthetic/,
    );
  }
});

test("an explicit disposable target accepts a public key or matching legacy anon key", () => {
  assert.equal(readTestEnvironment(configuration()).projectRef, projectRef);
  assert.equal(
    readTestEnvironment({
      ...configuration(),
      JOBTRACKER_TEST_PUBLIC_KEY: legacyKey({ role: "anon", ref: projectRef }),
    }).projectRef,
    projectRef,
  );
});

test("invalid targets, incomplete credentials and missing SQL files fail before the client probe", () => {
  const invalid = [
    { JOBTRACKER_TEST_PROJECT_REF: "urzvwixshavciyktjlhw" },
    { JOBTRACKER_TEST_SUPABASE_URL: "https://wrong.example.invalid" },
    { JOBTRACKER_TEST_USER_A_PASSWORD: "" },
    ...["JOBTRACKER_TEST_PGPASSFILE", "JOBTRACKER_TEST_SSLROOTCERT"].flatMap(
      (key) =>
        [
          undefined,
          "",
          "relative-file",
          join(directory, "missing"),
          directory,
        ].map((value) => ({ [key]: value })),
    ),
  ];
  let probes = 0;
  for (const values of invalid) {
    assert.throws(
      () =>
        validatePrerequisites({ ...configuration(), ...values }, () => {
          probes += 1;
          throw new Error("No process should be started");
        }),
      /BLOCKED/,
    );
  }
  assert.equal(probes, 0);
});

test("preflight only probes psql version and rejects missing or incompatible clients", () => {
  for (const result of [
    { error: new Error("unavailable"), status: null },
    { stdout: "psql (PostgreSQL) 16.9", status: 0 },
    { stdout: "unexpected output", status: 0 },
    { stdout: "psql (PostgreSQL) 17.6", status: 1 },
  ]) {
    assert.throws(
      () => validatePrerequisites(configuration(), () => result),
      /BLOCKED: psql/,
    );
  }
  const config = validatePrerequisites(configuration(), (command, args) => {
    assert.equal(command, "psql");
    assert.deepEqual(args, ["--version"]);
    return { stdout: "psql (PostgreSQL) 17.6", status: 0 };
  });
  assert.equal(config.passfile, passfile);
  assert.equal(config.rootCertificate, certificate);
});

test("the integration config rejects missing SQL files before test collection", async () => {
  const original = process.env;
  try {
    for (const name of [
      "JOBTRACKER_TEST_PGPASSFILE",
      "JOBTRACKER_TEST_SSLROOTCERT",
    ]) {
      process.env = { ...original, ...configuration(), [name]: "" };
      await assert.rejects(
        import("../../vitest.integration.config.js?missing=" + name),
        new RegExp("BLOCKED: Missing " + name),
      );
    }
  } finally {
    process.env = original;
  }
});

test("HTTP cancellation blocks new requests and cleanup can use a fresh stage signal", async () => {
  const stage = new AbortController();
  let signal = stage.signal;
  let calls = 0;
  const request = boundedFetch(
    () => signal,
    async () => {
      calls += 1;
      return new Response("synthetic");
    },
  );
  stage.abort();
  await assert.rejects(request("https://offline.example.invalid"), {
    name: "AbortError",
  });
  assert.equal(calls, 0);
  signal = new AbortController().signal;
  assert.equal(
    await (await request("https://offline.example.invalid")).text(),
    "synthetic",
  );
  assert.equal(calls, 1);
});

test("HTTP requests have a deadline even if the hosted endpoint never responds", async () => {
  let receivedSignal;
  const request = boundedFetch(
    () => new AbortController().signal,
    async (_, { signal }) => {
      receivedSignal = signal;
      await delay(1000, undefined, { signal });
    },
    10,
  );
  await assert.rejects(request("https://offline.example.invalid"), {
    name: "AbortError",
  });
  assert.equal(receivedSignal.aborted, true);
  assert.equal(receivedSignal.reason.name, "TimeoutError");
});

test("cancelling a running stage or individual request aborts its in-flight fetch", async () => {
  for (const cancelStage of [true, false]) {
    const stage = new AbortController();
    const individual = new AbortController();
    const request = boundedFetch(
      () => stage.signal,
      async (_, { signal }) => {
        await delay(1000, undefined, { signal });
      },
    );
    const pending = request("https://offline.example.invalid", {
      signal: individual.signal,
    });
    (cancelStage ? stage : individual).abort(
      new Error("synthetic cancellation"),
    );
    await assert.rejects(pending, { name: "AbortError" });
  }
});

test("SDK retry cancellation cannot resume a prior request when cleanup starts", async () => {
  const testStage = new AbortController();
  let currentSignal = testStage.signal;
  let calls = 0;
  const client = createClient(
    "https://offline.example.invalid",
    "sb_publishable_synthetic",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: boundedFetch(
          () => currentSignal,
          async () => {
            calls += 1;
            testStage.abort();
            currentSignal = new AbortController().signal;
            // Simulate transport status only, not PostgreSQL policy evaluation.
            return new Response("temporary transport failure", {
              status: 520,
              headers: { "Retry-After": "0" },
            });
          },
        ),
      },
    },
  );
  const result = await client
    .from("applications")
    .select("id")
    .abortSignal(testStage.signal);
  assert.notEqual(result.error, null);
  assert.equal(calls, 1);
});
