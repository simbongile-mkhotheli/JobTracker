/// <reference types="vitest" />

import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  test: {
    exclude: [...configDefaults.exclude, "tests/integration/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
