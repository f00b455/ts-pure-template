const { execSync } = require('child_process');

// Set the TypeScript project for ts-node
process.env.TS_NODE_PROJECT = '../../tsconfig.cucumber.json';

module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['features/**/*.steps.ts'],
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