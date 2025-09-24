module.exports = {
  default: {
    requireModule: ['tsx/cjs'],
    require: [
      '../../packages/cucumber-shared/dist/steps/**/*.cjs',  // Shared steps
      'features/step_definitions/**/*.ts'                     // Package-specific steps
    ],
    format: ['progress-bar', 'json:cucumber-report/cucumber_report.json'],
    formatOptions: {},
  },
};