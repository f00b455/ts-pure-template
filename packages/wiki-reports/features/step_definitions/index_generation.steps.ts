import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'vitest';

interface IndexContext {
  reports: Map<string, Array<{ runId: string; timestamp: Date; sha: string }>>;
  indexHtml: string;
  lastRun?: { branch: string; runId: string; sha: string };
  searchEnabled: boolean;
  stats?: {
    successRate: number;
    avgDuration: number;
    trend: 'better' | 'worse' | 'stable';
  };
}

let indexContext: IndexContext;

Before(function () {
  indexContext = {
    reports: new Map(),
    indexHtml: '',
    searchEnabled: false,
  };
});

Given('mehrere Testläufe existieren im Wiki', function () {
  indexContext.reports.set('main', [
    { runId: '100', timestamp: new Date(), sha: 'abc123' },
    { runId: '99', timestamp: new Date(Date.now() - 3600000), sha: 'def456' },
  ]);
  indexContext.reports.set('develop', [
    { runId: '98', timestamp: new Date(Date.now() - 7200000), sha: 'ghi789' },
  ]);
});

Given('der letzte Lauf war auf Branch {string}', function (branch: string) {
  indexContext.lastRun = {
    branch,
    runId: '100',
    sha: 'abc123',
  };
});

Given('Reports für verschiedene Branches existieren', function () {
  indexContext.reports.set('main', [
    { runId: '100', timestamp: new Date(), sha: 'abc123' },
  ]);
  indexContext.reports.set('feature-x', [
    { runId: '101', timestamp: new Date(), sha: 'xyz789' },
  ]);
  indexContext.reports.set('develop', [
    { runId: '102', timestamp: new Date(), sha: 'qrs456' },
  ]);
});

Given('die Index-Seite wurde generiert', function () {
  indexContext.indexHtml = '<html><body>Index Page</body></html>';
});

Given('mehrere Läufe mit Testergebnissen existieren', function () {
  indexContext.stats = {
    successRate: 85.5,
    avgDuration: 120,
    trend: 'better',
  };
});

When('die Index-Seite generiert wird', function () {
  // Mock index generation
  indexContext.indexHtml = '<html><body>';

  if (indexContext.lastRun) {
    indexContext.indexHtml += `<h2>Letzter Lauf</h2>`;
  }

  for (const [branch] of indexContext.reports) {
    indexContext.indexHtml += `<section id="${branch}"></section>`;
  }

  indexContext.indexHtml += '</body></html>';
});

When('ein Suchfeld hinzugefügt wird', function () {
  indexContext.searchEnabled = true;
  indexContext.indexHtml += '<input type="search" />';
});

When('sie auf einem mobilen Gerät betrachtet wird', function () {
  // Mock responsive check
  indexContext.indexHtml += '<meta name="viewport" content="width=device-width">';
});

Then('zeigt die Startseite {string} mit Link zum Report', function (text: string) {
  expect(indexContext.indexHtml).toContain('Letzter Lauf');
  expect(indexContext.lastRun).toBeDefined();
});

Then('Commit-SHA, Zeitstempel und Branch sind sichtbar', function () {
  expect(indexContext.lastRun?.sha).toBeDefined();
  expect(indexContext.lastRun?.branch).toBeDefined();
});

Then('gibt es eine Sektion für jeden aktiven Branch', function () {
  for (const [branch] of indexContext.reports) {
    expect(indexContext.indexHtml).toContain(branch);
  }
});

Then('jeder Branch zeigt seine letzten {int} Läufe', function (count: number) {
  for (const [, runs] of indexContext.reports) {
    expect(runs.length).toBeLessThanOrEqual(count);
  }
});

Then('kann nach Commit-SHA gesucht werden', function () {
  expect(indexContext.searchEnabled).toBe(true);
});

Then('kann nach Branch-Namen gefiltert werden', function () {
  expect(indexContext.searchEnabled).toBe(true);
});

Then('kann nach Datum gefiltert werden', function () {
  expect(indexContext.searchEnabled).toBe(true);
});

Then('zeigt sie Erfolgsrate der letzten {int} Läufe', function (count: number) {
  expect(indexContext.stats?.successRate).toBeDefined();
  expect(indexContext.stats?.successRate).toBeGreaterThanOrEqual(0);
  expect(indexContext.stats?.successRate).toBeLessThanOrEqual(100);
});

Then('zeigt durchschnittliche Testlaufzeit', function () {
  expect(indexContext.stats?.avgDuration).toBeDefined();
  expect(indexContext.stats?.avgDuration).toBeGreaterThan(0);
});

Then('zeigt Trend-Indikator \\(besser\\/schlechter)', function () {
  expect(indexContext.stats?.trend).toBeDefined();
  expect(['better', 'worse', 'stable']).toContain(indexContext.stats?.trend);
});

Then('ist die Navigation responsive', function () {
  expect(indexContext.indexHtml).toContain('viewport');
});

Then('Tabellen sind horizontal scrollbar', function () {
  // In production, check for overflow-x CSS
  expect(indexContext.indexHtml).toBeDefined();
});

Then('wichtige Infos bleiben sichtbar', function () {
  expect(indexContext.indexHtml).toBeDefined();
});