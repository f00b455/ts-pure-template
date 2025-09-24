export default {
  default: {
    require: [
      '../../packages/cucumber-shared/src/steps/**/*.ts',    // Shared steps (TypeScript ONLY!)
      'features/step_definitions/**/*.ts'                    // Package-specific steps (TypeScript ONLY!)
    ],
    format: ['progress-bar', 'json:cucumber-report/cucumber_report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};