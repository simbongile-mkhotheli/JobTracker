import { defineConfig } from "vitest/config";
import { validatePrerequisites } from "./tests/integration/database.js";

// Validate target, credentials, readable SQL files and psql before collection.
// This performs local checks only; credentials and TLS trust need hosted proof.
validatePrerequisites();

export default defineConfig({
  envDir: false,
  test: {
    include: ["tests/integration/**/*.test.js"],
    environment: "node",
    fileParallelism: false,
    maxWorkers: 1,
    // These sequential tests share one schema lifecycle. Preserve the first failure.
    bail: 1,
    testTimeout: 15000,
    hookTimeout: 120000,
  },
});
