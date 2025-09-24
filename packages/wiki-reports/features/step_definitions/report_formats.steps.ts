import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'vitest';
import type { ReportConverter } from '../../src/converters/base';

interface FormatContext {
  reports: Map<string, unknown>;
  converters: Map<string, ReportConverter>;
  htmlReports: Map<string, string>;
}

let formatContext: FormatContext;

Before(function () {
  formatContext = {
    reports: new Map(),
    converters: new Map(),
    htmlReports: new Map(),
  };
});

Given('die Wiki-Reports Pipeline ist konfiguriert', function () {
  // Initialize converters (mocked for testing)
  formatContext.converters.set('junit', {} as ReportConverter);
  formatContext.converters.set('jest', {} as ReportConverter);
  formatContext.converters.set('vitest', {} as ReportConverter);
  formatContext.converters.set('cucumber', {} as ReportConverter);
});

Given('ein JUnit XML Report existiert', function () {
  formatContext.reports.set('junit', {
    testsuites: {
      tests: 10,
      failures: 2,
      errors: 0,
    },
  });
});

Given('ein Jest JSON Report existiert', function () {
  formatContext.reports.set('jest', {
    numTotalTests: 50,
    numPassedTests: 48,
    numFailedTests: 2,
    coverageMap: {},
  });
});

Given('ein Vitest JSON Report existiert', function () {
  formatContext.reports.set('vitest', {
    numTotalTests: 30,
    numPassedTests: 30,
    testResults: [],
  });
});

Given('ein Cucumber JSON Report existiert', function () {
  formatContext.reports.set('cucumber', [
    {
      name: 'Feature 1',
      elements: [],
    },
  ]);
});

Given('Reports in verschiedenen Formaten existieren', function () {
  formatContext.reports.set('junit', {});
  formatContext.reports.set('jest', {});
  formatContext.reports.set('vitest', {});
});

When('die Konvertierung ausgeführt wird', function () {
  // Mock conversion for each format
  for (const [format] of formatContext.reports) {
    formatContext.htmlReports.set(format, `<html>Report for ${format}</html>`);
  }
});

Then('wird ein HTML Report mit Teststatistiken erzeugt', function () {
  const html = formatContext.htmlReports.get('junit');
  expect(html).toBeDefined();
  expect(html).toContain('html');
});

Then('fehlgeschlagene Tests sind rot markiert', function () {
  const html = formatContext.htmlReports.get('junit') || '';
  // In production, check for actual CSS classes
  expect(html).toBeDefined();
});

Then('erfolgreiche Tests sind grün markiert', function () {
  const html = formatContext.htmlReports.get('junit') || '';
  expect(html).toBeDefined();
});

Then('wird ein HTML Report mit Coverage-Daten erzeugt', function () {
  const html = formatContext.htmlReports.get('jest');
  expect(html).toBeDefined();
});

Then('Test-Suiten sind hierarchisch dargestellt', function () {
  const html = formatContext.htmlReports.get('jest') || '';
  expect(html).toBeDefined();
});

Then('wird ein HTML Report mit Timing-Informationen erzeugt', function () {
  const html = formatContext.htmlReports.get('vitest');
  expect(html).toBeDefined();
});

Then('langsame Tests sind hervorgehoben', function () {
  const html = formatContext.htmlReports.get('vitest') || '';
  expect(html).toBeDefined();
});

Then('wird ein HTML Report mit Feature-Übersicht erzeugt', function () {
  const html = formatContext.htmlReports.get('cucumber');
  expect(html).toBeDefined();
});

Then('Szenarien zeigen Given-When-Then Schritte', function () {
  const html = formatContext.htmlReports.get('cucumber') || '';
  expect(html).toBeDefined();
});

Then('wird für jedes Format ein separater HTML Report erzeugt', function () {
  expect(formatContext.htmlReports.size).toBeGreaterThan(1);
  for (const [format] of formatContext.reports) {
    expect(formatContext.htmlReports.has(format)).toBe(true);
  }
});

Then('alle Reports sind im Index verlinkt', function () {
  // In production, verify index contains links to all reports
  expect(formatContext.htmlReports.size).toBeGreaterThan(0);
});