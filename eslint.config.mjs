import js from "@eslint/js";
import globals from "globals";
import {defineConfig} from "eslint/config";
import pluginJest from 'eslint-plugin-jest';


export default defineConfig([
  {
    files: ["**/*.js"],
    plugins: {js},
    extends: ["js/recommended"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser
    },
  },
  {
    files: ["**/*.test.js"],
    plugins: {jest: pluginJest},
    languageOptions: {
      globals: {
        ...globals.node,
        ...pluginJest.environments.globals.globals
      }
    }
  }
]);
