import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".agents/**",
      ".eslintcache",
      ".eslintrc.cjs",
      "eslint.config.js",
      "serviceAccountKey.json",
    ],
    files: ["client/src/**/*.{js,jsx}", "shared/**/*.{js,jsx}"],
    plugins: { js, react: pluginReact },
    extends: ["js/recommended", pluginReact.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["server/src/**/*.js", "scripts/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    },
  },
]);
