// Set the TypeScript project for ts-node
process.env.TS_NODE_PROJECT = '../../tsconfig.cucumber.json';

export default {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register/esm'],
    require: [
      'features/step_definitions/**/*.ts'                    // Package-specific steps in TypeScript
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