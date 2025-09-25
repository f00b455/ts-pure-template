const baseConfig = require('../../eslint.base.js');

module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: ["./tsconfig.json"]
  },
  env: {
    node: true,
    es2022: true
  },
  rules: {
    ...baseConfig.rules,
    "no-unused-vars": "error",
    "no-var": "error",
    "eqeqeq": "error",
    "curly": "error"
  },
  overrides: baseConfig.overrides,
  ignorePatterns: ["dist/", "node_modules/", "*.js", "features/**", "vitest.config.ts", "cucumber.js"]
};