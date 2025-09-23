module.exports = {
  default: {
    require: ['features/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    format: ['progress', 'json:reports/cucumber-report.json'],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    publishQuiet: true
  }
};