import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

const browserLanguageOptions = {
  globals: globals.browser,
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
};

const typedBrowserLanguageOptions = {
  ...browserLanguageOptions,
  parserOptions: {
    ...browserLanguageOptions.parserOptions,
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
  },
};

export default defineConfig([
  globalIgnores(["dist", "node_modules", ".vite"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: browserLanguageOptions,
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: typedBrowserLanguageOptions,
  },
]);
