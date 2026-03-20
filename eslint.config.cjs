const { defineConfig, globalIgnores } = require("eslint/config");
const nextPlugin = require("@next/eslint-plugin-next");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const tsParser = require("@typescript-eslint/parser");

module.exports = defineConfig([
  globalIgnores([
    ".next/**",
    "build/**",
    "coverage/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.flat.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
]);
