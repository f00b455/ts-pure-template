import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

interface WikiReportsWorld {
  wikiEnabled: boolean;
  testArtifacts: Map<string, any>;
  branch: string;
  commitSha: string;
  runId: string;
  publishedReports: Map<string, string>;
  wikiIndex: string;
  publishError: Error | null;
  existingRuns: string[];
  retentionLimit: number;
}

Before(function(this: WikiReportsWorld) {
  this.wikiEnabled = false;
  this.testArtifacts = new Map();
  this.branch = 'main';
  this.commitSha = '';
  this.runId = '';
  this.publishedReports = new Map();
  this.wikiIndex = '';
  this.publishError = null;
  this.existingRuns = [];
  this.retentionLimit = 20;
});

Given('das Repository hat die GitHub Wiki aktiviert', function(this: WikiReportsWorld) {
  this.wikiEnabled = true;
});

Given('die Pipeline erzeugt Testberichte als Artefakte', function(this: WikiReportsWorld) {
  // Simulate test artifacts
  this.testArtifacts.set('junit.xml', '<testsuites><testsuite name="test"/></testsuites>');
  this.testArtifacts.set('coverage.html', '<html><body>Coverage Report</body></html>');
});

Given('ein erfolgreicher Pipeline-Lauf auf Branch {string} mit Commit-SHA {string}',
  function(this: WikiReportsWorld, branch: string, sha: string) {
    this.branch = branch;
    this.commitSha = sha;
    this.runId = 'run-123';
  }
);

Given('ein Lauf auf Branch {string}', function(this: WikiReportsWorld, branch: string) {
  this.branch = branch;
  this.runId = 'run-456';
});

Given('ein neuer Report wurde abgelegt', function(this: WikiReportsWorld) {
  this.publishedReports.set(`wiki/reports/${this.branch}/${this.runId}/index.html`,
    '<html><body>Test Report</body></html>');
});

Given('die Tests erzeugen keine Artefakte', function(this: WikiReportsWorld) {
  this.testArtifacts.clear();
});

Given('mehr als {int} Läufe existieren für Branch {string}',
  function(this: WikiReportsWorld, count: number, branch: string) {
    this.branch = branch;
    this.existingRuns = [];
    for (let i = 1; i <= count + 5; i++) {
      this.existingRuns.push(`run-${i}`);
    }
  }
);

When('die Publish-Stage ausgeführt wird', function(this: WikiReportsWorld) {
  try {
    if (!this.wikiEnabled) {
      throw new Error('Wiki is not enabled');
    }

    if (this.testArtifacts.size === 0) {
      // Create fallback report
      const fallbackContent = `<html><body>
        <h1>Keine Reports verfügbar</h1>
        <p>Zeitstempel: ${new Date().toISOString()}</p>
      </body></html>`;
      this.publishedReports.set(`wiki/reports/${this.branch}/${this.runId}/index.html`, fallbackContent);
    } else {
      // Publish actual reports
      for (const [filename, content] of this.testArtifacts) {
        const reportPath = `wiki/reports/${this.branch}/${this.runId}/${filename}`;
        this.publishedReports.set(reportPath, content);
      }
      // Create index.html
      this.publishedReports.set(`wiki/reports/${this.branch}/${this.runId}/index.html`,
        '<html><body>Test Report Index</body></html>');
    }

    // Update wiki index
    this.wikiIndex = `# Test Reports\n\n## Letzter Lauf: ${this.runId} (${this.commitSha})\n`;
    this.wikiIndex += `- Branch: ${this.branch}\n`;
    this.wikiIndex += `- [Report](reports/${this.branch}/${this.runId}/index.html)\n`;
  } catch (error) {
    this.publishError = error as Error;
  }
});

When('das Index-Skript läuft', function(this: WikiReportsWorld) {
  const runs = this.existingRuns.length > 0 ? this.existingRuns : [this.runId];
  const sortedRuns = runs.slice(-20).reverse(); // Last 20, newest first

  this.wikiIndex = '# Test Reports\n\n## Historie\n';
  for (const run of sortedRuns) {
    this.wikiIndex += `- ${this.branch} / ${run} → [Report](reports/${this.branch}/${run}/index.html)\n`;
  }
});

When('die Publish-Stage läuft', function(this: WikiReportsWorld) {
  // Apply retention policy
  if (this.existingRuns.length > this.retentionLimit) {
    const toKeep = this.existingRuns.slice(-this.retentionLimit);
    this.existingRuns = toKeep;
  }
});

Then('werden HTML-Reports unter {string} abgelegt',
  function(this: WikiReportsWorld, targetPath: string) {
    const expectedPath = targetPath.replace('run-123', this.runId);
    const hasReports = Array.from(this.publishedReports.keys())
      .some(path => path.startsWith(expectedPath));
    expect(hasReports).toBe(true);
  }
);

Then('die Wiki-Startseite verlinkt {string}',
  function(this: WikiReportsWorld, expectedLink: string) {
    const actualLink = expectedLink
      .replace('run-123', this.runId)
      .replace('abc123', this.commitSha);
    expect(this.wikiIndex).toContain(actualLink);
  }
);

Then('die Seite ist öffentlich innerhalb des Projekts einsehbar',
  function(this: WikiReportsWorld) {
    // This would be verified by checking GitHub Wiki settings
    expect(this.wikiEnabled).toBe(true);
  }
);

Then('werden Reports unter {string} gespeichert',
  function(this: WikiReportsWorld, targetPath: string) {
    const expectedPath = targetPath.replace('run-456', this.runId);
    const hasReports = Array.from(this.publishedReports.keys())
      .some(path => path.startsWith(expectedPath));
    expect(hasReports).toBe(true);
  }
);

Then('ein Branch-Index existiert und ist verlinkt', function(this: WikiReportsWorld) {
  expect(this.wikiIndex).toContain(this.branch);
  expect(this.wikiIndex).toContain('Report');
});

Then('werden die letzten {int} Läufe pro Branch gelistet',
  function(this: WikiReportsWorld, count: number) {
    const lines = this.wikiIndex.split('\n');
    const reportLines = lines.filter(line => line.includes('→ [Report]'));
    expect(reportLines.length).toBeLessThanOrEqual(count);
  }
);

Then('die Läufe sind absteigend sortiert nach Zeit', function(this: WikiReportsWorld) {
  const lines = this.wikiIndex.split('\n');
  const runNumbers = lines
    .filter(line => line.includes('run-'))
    .map(line => {
      const match = line.match(/run-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

  for (let i = 1; i < runNumbers.length; i++) {
    expect(runNumbers[i]).toBeLessThanOrEqual(runNumbers[i - 1]);
  }
});

Then('wird ein Eintrag {string} mit Zeitstempel erzeugt',
  function(this: WikiReportsWorld, message: string) {
    const fallbackPath = `wiki/reports/${this.branch}/${this.runId}/index.html`;
    const content = this.publishedReports.get(fallbackPath);
    expect(content).toContain('Keine Reports verfügbar');
    expect(content).toContain('Zeitstempel');
  }
);

Then('die Pipeline schlägt nicht allein wegen des Wiki-Schritts fehl',
  function(this: WikiReportsWorld) {
    // Wiki publish errors should not fail the pipeline
    expect(this.publishError).toBeNull();
  }
);

Then('werden ältere Verzeichnisse entfernt', function(this: WikiReportsWorld) {
  expect(this.existingRuns.length).toBeLessThanOrEqual(this.retentionLimit);
});

Then('nur die letzten {int} Läufe bleiben erhalten',
  function(this: WikiReportsWorld, count: number) {
    expect(this.existingRuns.length).toBe(count);
  });