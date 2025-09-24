module.exports = {
  default: {
    require: ['features/step_definitions/**/*.ts'],
    requireModule: ['tsx'],
    paths: ['features/**/*.feature'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1,
    retry: 0
  }
};