import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { readTestEnvironment } from "./environment.js";

export const repairPath = fileURLToPath(
  new URL(
    "../../supabase/security-patches/repair_applications_ownership.sql",
    import.meta.url,
  ),
);
export const containmentPath = fileURLToPath(
  new URL(
    "../../supabase/security-patches/contain_applications_access.sql",
    import.meta.url,
  ),
);
export const fixturePath = fileURLToPath(
  new URL("./fixtures/applications_legacy.sql", import.meta.url),
);
const inspectionPath = fileURLToPath(
  new URL(
    "../../supabase/security-patches/inspect_applications_security.sql",
    import.meta.url,
  ),
);

function requirePostgresClient(probe) {
  const result = probe("psql", ["--version"], {
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  const major = Number(result.stdout?.match(/psql \(PostgreSQL\) (\d+)/)?.[1]);
  if (result.error || result.status !== 0 || major < 17 || !major) {
    throw new Error(
      "BLOCKED: psql 17 or newer is required; no database operation was attempted.",
    );
  }
}

// Local checks only: --version never opens a database connection.
export function validatePrerequisites(
  environment = process.env,
  probe = spawnSync,
) {
  const config = readTestEnvironment(environment);
  requirePostgresClient(probe);
  return config;
}

function connectionEnvironment() {
  const config = readTestEnvironment();
  const environment = { ...process.env };
  // Never inherit an alternate connection target, password, or session options.
  for (const key of [
    "PGSERVICE",
    "PGSERVICEFILE",
    "PGHOSTADDR",
    "PGPASSWORD",
    "PGOPTIONS",
    "PGREQUIRESSL",
    "PGSSLCERT",
    "PGSSLKEY",
    "PGSSLCRL",
    "PGSSLCRLDIR",
  ]) {
    delete environment[key];
  }
  return {
    ...environment,
    PGHOST: "db." + config.projectRef + ".supabase.co",
    PGPORT: "5432",
    PGDATABASE: "postgres",
    PGUSER: "postgres",
    PGPASSFILE: config.passfile,
    PGSSLMODE: "verify-full",
    PGSSLROOTCERT: config.rootCertificate,
    PGAPPNAME: "jobtracker-disposable-security-verification",
    PGCONNECT_TIMEOUT: "10",
  };
}

export function runSql(files, commands = []) {
  const args = ["-X", "-w", "--single-transaction", "--set=ON_ERROR_STOP=1"];
  for (const file of files) args.push("--file", file);
  for (const command of commands) args.push("--command", command);
  return spawnSync("psql", args, {
    env: connectionEnvironment(),
    encoding: "utf8",
    timeout: 70000,
    windowsHide: true,
  });
}

export function applySql(file) {
  const result = runSql([file]);
  if (result.error || result.status !== 0) {
    // Do not print libpq errors, environment values, or credentials.
    throw new Error(
      "Disposable SQL operation failed; inspect it securely before retrying.",
    );
  }
}

export function inspectSecurity() {
  const result = spawnSync(
    "psql",
    [
      "-X",
      "-w",
      "--set=ON_ERROR_STOP=1",
      "--tuples-only",
      "--no-align",
      "--file",
      inspectionPath,
    ],
    {
      env: connectionEnvironment(),
      encoding: "utf8",
      timeout: 15000,
      windowsHide: true,
    },
  );
  if (result.error || result.status !== 0) {
    throw new Error("Disposable metadata inspection failed.");
  }
  return JSON.parse(result.stdout.trim());
}
