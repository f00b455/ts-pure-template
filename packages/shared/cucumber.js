// Set the TypeScript project for ts-node
process.env.TS_NODE_PROJECT = '../../tsconfig.cucumber.json';

export default {
  default: {
    requireModule: ['ts-node/register/esm'],
    require: [
      '../../packages/cucumber-shared/dist/steps/**/*.js',   // Shared steps (ESM)
      'features/step_definitions/**/*.ts'                    // Package-specific steps in TypeScript
    ],
    format: ['progress-bar', 'json:cucumber-report/cucumber_report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};