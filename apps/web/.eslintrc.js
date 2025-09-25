const baseConfig = require('../../eslint.base.js');

module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    ...baseConfig.rules,
    "no-unused-vars": ["error", { "args": "none" }],
    "no-var": "error",
    "no-console": "warn",
    "eqeqeq": "error",
    "curly": "error"
  },
  overrides: baseConfig.overrides
};