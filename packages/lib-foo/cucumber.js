export default {
  default: {
    requireModule: ['tsx/esm'],
    require: ['features/step_definitions/**/*.ts'],
    format: ['progress-bar', 'json:cucumber-report/cucumber_report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};