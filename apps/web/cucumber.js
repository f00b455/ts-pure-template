module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      '../../packages/cucumber-shared/src/steps/**/*.ts',     // Shared steps (TypeScript ONLY!)
      'features/**/*.steps.ts'                                // Package-specific steps (TypeScript ONLY!)
    ],
    format: [
      'progress',
      'html:cucumber-report/cucumber-report.html',
      'json:cucumber-report/cucumber-report.json',
    ],
    formatOptions: {},
    parallel: 1,  // ESM safe
    retry: 0,
    strict: true,
  },
};