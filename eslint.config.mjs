import domenicConfig from "@domenic/eslint-config";
import domenicStylisticConfig from "@domenic/eslint-config/stylistic";
import globals from "globals";

export default [
  {
    ignores: ["coverage/"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
  ...domenicConfig,
  ...domenicStylisticConfig,
  {
    files: ["scripts/**.js"],
    rules: {
      "no-console": "off",
    },
  },
];
