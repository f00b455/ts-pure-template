module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report/cucumber-report.html',
      'json:cucumber-report/cucumber-report.json',
    ],
    formatOptions: {
      snippetSyntax: 'async-await',
    },
    parallel: 2,
    retry: 0,
    strict: true,
  },
};