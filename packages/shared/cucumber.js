export default {
  default: {
    require: [
      '../../packages/cucumber-shared/dist/steps/**/*.cjs',  // Shared steps (CommonJS)
      'features/step_definitions/**/*.js'                    // Package-specific steps
    ],
    format: ['progress-bar', 'json:cucumber-report/cucumber_report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};