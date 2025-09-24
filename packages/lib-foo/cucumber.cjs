module.exports = {
  default: {
    requireModule: ['tsx/cjs'],
    require: ['features/step_definitions/**/*.ts'],
    format: ['progress-bar', 'json:cucumber-report/cucumber_report.json'],
    formatOptions: {},
  },
};