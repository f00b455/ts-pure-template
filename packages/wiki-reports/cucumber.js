export default {
  default: {
    requireModule: ['tsx'],
    require: ['features/step_definitions/**/*.ts'],
    publishQuiet: true,
    format: ['progress', 'json:cucumber-report.json'],
    paths: ['features/**/*.feature']
  }
};