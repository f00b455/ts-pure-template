const { execSync } = require('child_process');

// Set the TypeScript project for ts-node
process.env.TS_NODE_PROJECT = '../../tsconfig.cucumber.json';

module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: [
      '../../packages/cucumber-shared/dist/steps/**/*.js', // Shared steps
      'features/**/*.steps.ts'                              // Package-specific steps
    ],
    format: [
      'progress',
      'html:cucumber-report/cucumber-report.html',
      'json:cucumber-report/cucumber-report.json',
    ],
    formatOptions: {},
    parallel: 2,
    retry: 0,
    strict: true,
  },
};