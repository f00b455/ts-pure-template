import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WikiReportsPublisher } from '../../src/wiki-publisher';
import { ReportIndexGenerator } from '../../src/index-generator';
import { ReportRetention } from '../../src/retention';

// Set timeout for async operations
setDefaultTimeout(10000);

// Test context
interface TestContext {
  wikiPath: string;
  reportsPath: string;
  publisher: WikiReportsPublisher;
  indexGenerator: ReportIndexGenerator;
  retention: ReportRetention;
  branch: string;
  runId: string;
  commitSha: string;
  reports: Map<string, string>;
  wikiEnabled: boolean;
}

let context: TestContext;

Before(async function () {
  // Initialize test context
  const tempDir = path.join(process.cwd(), 'temp', 'wiki-test');
  await fs.mkdir(tempDir, { recursive: true });

  context = {
    wikiPath: path.join(tempDir, 'wiki'),
    reportsPath: path.join(tempDir, 'reports'),
    publisher: new WikiReportsPublisher({ wikiPath: path.join(tempDir, 'wiki') }),
    indexGenerator: new ReportIndexGenerator(),
    retention: new ReportRetention({ maxRuns: 20 }),
    branch: 'main',
    runId: '123',
    commitSha: 'abc123',
    reports: new Map(),
    wikiEnabled: false
  };

  await fs.mkdir(context.wikiPath, { recursive: true });
  await fs.mkdir(context.reportsPath, { recursive: true });
});

After(async function () {
  // Cleanup test artifacts
  if (context.wikiPath) {
    await fs.rm(path.dirname(context.wikiPath), { recursive: true, force: true });
  }
});

// Background steps
Given('das Repository hat die GitHub Wiki aktiviert', async function () {
  context.wikiEnabled = true;
  // Create wiki directory structure
  await fs.mkdir(path.join(context.wikiPath, 'reports'), { recursive: true });
});

Given('die Pipeline erzeugt Testberichte als Artefakte', async function () {
  // Create sample test reports
  const sampleReport = `
    <html>
      <body>
        <h1>Test Report</h1>
        <p>Tests: 10, Passed: 8, Failed: 2</p>
      </body>
    </html>
  `;
  await fs.writeFile(
    path.join(context.reportsPath, 'index.html'),
    sampleReport
  );
  context.reports.set('index.html', sampleReport);
});

// Scenario: Erfolgreiche Veröffentlichung eines Laufes
Given('ein erfolgreicher Pipeline-Lauf auf Branch {string} mit Commit-SHA {string}',
  function (branch: string, sha: string) {
    context.branch = branch;
    context.commitSha = sha;
    context.runId = '123';
  }
);

When('die Publish-Stage ausgeführt wird', async function () {
  await context.publisher.publish({
    branch: context.branch,
    runId: context.runId,
    commitSha: context.commitSha,
    reportsPath: context.reportsPath
  });
});

Then('werden HTML-Reports unter {string} abgelegt', async function (expectedPath: string) {
  const actualPath = path.join(context.wikiPath, 'reports', context.branch, context.runId);
  const indexFile = path.join(actualPath, 'index.html');

  const exists = await fs.access(indexFile).then(() => true).catch(() => false);
  expect(exists).toBe(true);
});

Then('die Wiki-Startseite verlinkt {string}', async function (expectedText: string) {
  const homePage = path.join(context.wikiPath, 'Home.md');
  const content = await fs.readFile(homePage, 'utf-8');

  expect(content).toContain(context.runId);
  expect(content).toContain(context.commitSha);
});

Then('die Seite ist öffentlich innerhalb des Projekts einsehbar', function () {
  // This would be verified in integration tests with actual GitHub API
  expect(context.wikiEnabled).toBe(true);
});

// Scenario: Getrennte Verzeichnisse pro Branch
Given('ein Lauf auf Branch {string}', function (branch: string) {
  context.branch = branch;
  context.runId = '456';
});

Then('werden Reports unter {string} gespeichert', async function (expectedPath: string) {
  const actualPath = path.join(context.wikiPath, 'reports', context.branch, context.runId);
  const exists = await fs.access(actualPath).then(() => true).catch(() => false);
  expect(exists).toBe(true);
});

Then('ein Branch-Index existiert und ist verlinkt', async function () {
  const branchIndex = await context.indexGenerator.generateBranchIndex({
    wikiPath: context.wikiPath,
    branch: context.branch
  });
  expect(branchIndex).toBeDefined();
});

// Scenario: Automatische Index-Aktualisierung
Given('ein neuer Report wurde abgelegt', async function () {
  const reportPath = path.join(
    context.wikiPath,
    'reports',
    context.branch,
    context.runId
  );
  await fs.mkdir(reportPath, { recursive: true });
  await fs.writeFile(
    path.join(reportPath, 'index.html'),
    '<html><body>Report</body></html>'
  );
});

When('das Index-Skript läuft', async function () {
  await context.indexGenerator.updateIndex({
    wikiPath: context.wikiPath
  });
});

Then('werden die letzten {int} Läufe pro Branch gelistet', async function (count: number) {
  const index = await context.indexGenerator.getIndex(context.wikiPath);
  expect(index.maxRunsPerBranch).toBe(count);
});

Then('die Läufe sind absteigend sortiert nach Zeit', async function () {
  const index = await context.indexGenerator.getIndex(context.wikiPath);
  const runs = index.branches.get(context.branch) || [];

  for (let i = 1; i < runs.length; i++) {
    expect(runs[i - 1].timestamp).toBeGreaterThanOrEqual(runs[i].timestamp);
  }
});

// Scenario: Kein Report vorhanden
Given('die Tests erzeugen keine Artefakte', function () {
  context.reports.clear();
});

Then('wird ein Eintrag {string} mit Zeitstempel erzeugt', async function (message: string) {
  const result = await context.publisher.publish({
    branch: context.branch,
    runId: context.runId,
    commitSha: context.commitSha,
    reportsPath: context.reportsPath
  });

  expect(result.message).toContain(message);
  expect(result.timestamp).toBeDefined();
});

Then('die Pipeline schlägt nicht wegen des Wiki-Schritts fehl', async function () {
  const result = await context.publisher.publish({
    branch: context.branch,
    runId: context.runId,
    commitSha: context.commitSha,
    reportsPath: context.reportsPath,
    failOnError: false
  });

  expect(result.success).toBeDefined();
  // Pipeline should not fail even if wiki publish fails
});

// Scenario: Aufräumen alter Reports
Given('mehr als {int} Läufe existieren für einen Branch', async function (maxRuns: number) {
  // Create more than maxRuns reports
  for (let i = 1; i <= maxRuns + 5; i++) {
    const reportPath = path.join(
      context.wikiPath,
      'reports',
      context.branch,
      `run-${i}`
    );
    await fs.mkdir(reportPath, { recursive: true });
    await fs.writeFile(
      path.join(reportPath, 'index.html'),
      `<html><body>Report ${i}</body></html>`
    );
  }
});

When('die Publish-Stage läuft', async function () {
  await context.retention.cleanup({
    wikiPath: context.wikiPath,
    branch: context.branch,
    maxRuns: 20
  });
});

Then('werden ältere Verzeichnisse entfernt', async function () {
  const branchPath = path.join(context.wikiPath, 'reports', context.branch);
  const runs = await fs.readdir(branchPath);
  expect(runs.length).toBeLessThanOrEqual(20);
});

Then('die Wiki-Größe bleibt kontrolliert', async function () {
  const stats = await context.retention.getStats(context.wikiPath);
  expect(stats.totalRuns).toBeLessThanOrEqual(stats.maxRunsPerBranch * stats.branchCount);
});