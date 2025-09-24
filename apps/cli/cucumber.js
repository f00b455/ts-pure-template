// apps/cli/cucumber.js
export default {
  default: {
    requireModule: ['tsx'],
    require: [
      'features/step_definitions/**/*.ts',
      '../../packages/cucumber-shared/dist/**/*.js'
    ],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' }
  }
};