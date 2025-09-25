module.exports = {
  paths: ['features/**/*.feature'],
  require: [
    'node_modules/@ts-template/cucumber-shared/dist/**/*.steps.js',
    'features/step_definitions/**/*.ts'
  ],
  requireModule: ['ts-node/register'],
  format: ['progress', 'html:reports/cucumber.html', 'json:reports/cucumber.json'],
  publishQuiet: true
};