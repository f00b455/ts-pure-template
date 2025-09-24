module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/step_definitions/**/*.ts'],
    requireModule: ['tsx'],
    format: ['progress', 'json:cucumber-report.json'],
    publishQuiet: true,
  },
};