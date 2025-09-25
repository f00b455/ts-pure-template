module.exports = {
  paths: ['features/**/*.feature'],
  import: [
    'node_modules/@ts-template/cucumber-shared/dist/**/*.steps.js',
    'features/step_definitions/**/*.ts'
  ],
  format: ['progress', 'html:reports/cucumber.html', 'json:reports/cucumber.json'],
  publishQuiet: true
};