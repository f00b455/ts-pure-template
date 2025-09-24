export default {
  default: {
    require: [
      '../cucumber-shared/dist/steps/**/*.js', // Shared steps
      'features/step_definitions/**/*.js'       // Package-specific steps
    ],
    format: ['progress-bar', 'json:cucumber-report/cucumber_report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};