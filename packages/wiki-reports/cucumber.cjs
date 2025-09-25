module.exports = {
  default: {
    require: [
      'features/**/*.steps.ts',
      '../../packages/cucumber-shared/dist/**/*.steps.js'
    ],
    requireModule: ['tsx'],
    format: ['progress', 'json:reports/cucumber-report.json'],
    publishQuiet: true,
    paths: ['features/**/*.feature']
  }
};