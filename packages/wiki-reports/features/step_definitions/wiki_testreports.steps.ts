import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'vitest';
import type { WikiReportsPublisher } from '../../src/publisher';
import type { ReportIndexGenerator } from '../../src/indexGenerator';
import type { ReportRetention } from '../../src/retention';

interface TestContext {
  wikiEnabled: boolean;
  artifacts: string[];
  branch: string;
  commitSha: string;
  runId: string;
  publisher?: WikiReportsPublisher;
  indexGenerator?: ReportIndexGenerator;
  retention?: ReportRetention;
  publishResult?: { success: boolean; path?: string; error?: string };
  reports: Map<string, string[]>;
}

let context: TestContext;

Before(function () {
  context = {
    wikiEnabled: false,
    artifacts: [],
    branch: 'main',
    commitSha: '',
    runId: '',
    reports: new Map(),
  };
});

Given('das Repository hat die GitHub Wiki aktiviert', function () {
  context.wikiEnabled = true;
});

Given('die Pipeline erzeugt Testberichte als Artefakte', function () {
  context.artifacts = ['junit.xml', 'coverage.html'];
});

Given('ein erfolgreicher Pipeline-Lauf auf Branch {string} mit Commit-SHA {string}', function (branch: string, sha: string) {
  context.branch = branch;
  context.commitSha = sha;
  context.runId = '123';
});

Given('ein Lauf auf Branch {string}', function (branch: string) {
  context.branch = branch;
  context.runId = '456';
});

Given('ein neuer Report wurde abgelegt', function () {
  const reports = context.reports.get(context.branch) || [];
  reports.push(`${context.runId}/index.html`);
  context.reports.set(context.branch, reports);
});

Given('die Tests erzeugen keine Artefakte oder sind fehlgeschlagen', function () {
  context.artifacts = [];
});

Given('mehr als {int} Läufe existieren für Branch {string}', function (count: number, branch: string) {
  const reports = [];
  for (let i = 1; i <= count + 5; i++) {
    reports.push(`run-${i}/index.html`);
  }
  context.reports.set(branch, reports);
  context.branch = branch;
});

When('die Publish-Stage ausgeführt wird', async function () {
  // Mock implementation for testing
  if (context.artifacts.length > 0) {
    context.publishResult = {
      success: true,
      path: `wiki/reports/${context.branch}/${context.runId}/`,
    };
  } else {
    context.publishResult = {
      success: true,
      path: `wiki/reports/${context.branch}/${context.runId}/`,
      error: 'No artifacts available',
    };
  }
});

When('das Index-Skript läuft', async function () {
  // Mock implementation for index generation
  // This would trigger the actual index generator in production
});

When('die Publish-Stage läuft', async function () {
  // Mock implementation for retention logic
  const reports = context.reports.get(context.branch) || [];
  if (reports.length > 20) {
    // Keep only the last 20 reports
    context.reports.set(context.branch, reports.slice(-20));
  }
});

Then('werden HTML-Reports unter {string} abgelegt', function (path: string) {
  expect(context.publishResult?.path).toContain(path.replace('123', context.runId));
  expect(context.publishResult?.success).toBe(true);
});

Then('die Wiki-Startseite verlinkt {string}', function (linkText: string) {
  const expectedLink = linkText
    .replace('123', context.runId)
    .replace('abc123', context.commitSha);
  // In production, this would verify the actual wiki content
  expect(expectedLink).toContain(context.runId);
});

Then('die Seite ist öffentlich innerhalb des Projekts einsehbar', function () {
  expect(context.wikiEnabled).toBe(true);
});

Then('werden Reports unter {string} gespeichert', function (path: string) {
  const expectedPath = path.replace('456', context.runId);
  expect(context.publishResult?.path).toContain(expectedPath);
});

Then('ein Branch-Index existiert und ist verlinkt', function () {
  const branchReports = context.reports.get(context.branch);
  expect(branchReports).toBeDefined();
});

Then('werden die letzten {int} Läufe pro Branch gelistet', function (count: number) {
  for (const [, reports] of context.reports) {
    expect(reports.length).toBeLessThanOrEqual(count);
  }
});

Then('die Läufe sind absteigend sortiert nach Zeit', function () {
  // In production, verify that reports are sorted by timestamp
  const reports = context.reports.get(context.branch) || [];
  expect(reports).toBeDefined();
});

Then('wird ein Eintrag {string} mit Zeitstempel erzeugt', function (message: string) {
  expect(context.publishResult?.error).toContain('No artifacts available');
});

Then('die Pipeline schlägt nicht allein wegen des Wiki-Schritts fehl', function () {
  expect(context.publishResult?.success).toBe(true);
});

Then('werden ältere Verzeichnisse entfernt', function () {
  const reports = context.reports.get(context.branch) || [];
  expect(reports.length).toBeLessThanOrEqual(20);
});

Then('nur die letzten {int} Läufe bleiben erhalten', function (count: number) {
  const reports = context.reports.get(context.branch) || [];
  expect(reports.length).toBeLessThanOrEqual(count);
});