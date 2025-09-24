import { ReportConverter } from './base';
import type { ConversionResult } from '../types';

interface VitestReport {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  startTime: number;
  success: boolean;
  testResults: VitestFile[];
  coverageSummary?: CoverageSummary;
}

interface VitestFile {
  name: string;
  startTime: number;
  endTime: number;
  status: 'passed' | 'failed' | 'skipped';
  assertionResults: VitestTest[];
}

interface VitestTest {
  fullName: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  failureMessages?: string[];
}

interface CoverageSummary {
  lines: { total: number; covered: number; skipped: number; pct: number };
  statements: { total: number; covered: number; skipped: number; pct: number };
  functions: { total: number; covered: number; skipped: number; pct: number };
  branches: { total: number; covered: number; skipped: number; pct: number };
}

export class VitestConverter extends ReportConverter {
  readonly format = 'vitest' as const;

  async convert(data: unknown): Promise<ConversionResult> {
    const report = this.parseVitestData(data);
    const stats = this.calculateStats(report);
    const html = this.generateHtml(report, stats);

    return {
      format: this.format,
      html,
      stats,
    };
  }

  private parseVitestData(data: unknown): VitestReport {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return this.getEmptyReport();
      }
    }

    if (data && typeof data === 'object' && 'testResults' in data) {
      return data as VitestReport;
    }

    return this.getEmptyReport();
  }

  private getEmptyReport(): VitestReport {
    return {
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      startTime: Date.now(),
      success: true,
      testResults: [],
    };
  }

  private calculateStats(report: VitestReport) {
    const total = report.numTotalTests;
    const passed = report.numPassedTests;
    const failed = report.numFailedTests;
    const skipped = report.numPendingTests + report.numTodoTests;

    let duration = 0;
    for (const file of report.testResults) {
      duration += (file.endTime - file.startTime) / 1000;
    }

    const coverage = report.coverageSummary ? {
      lines: report.coverageSummary.lines.pct,
      branches: report.coverageSummary.branches.pct,
      functions: report.coverageSummary.functions.pct,
      statements: report.coverageSummary.statements.pct,
    } : undefined;

    return { total, passed, failed, skipped, duration, coverage };
  }

  private generateHtml(report: VitestReport, stats: any): string {
    const slowTests = this.findSlowTests(report);

    const content = `
      <div class="header">
        <h1>Vitest Test Report</h1>
        <p>Generated at ${new Date().toISOString()}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Tests</h3>
          <div style="font-size: 2em; font-weight: bold;">${stats.total}</div>
        </div>
        <div class="summary-card">
          <h3 class="passed">Passed</h3>
          <div style="font-size: 2em; font-weight: bold;" class="passed">${stats.passed}</div>
        </div>
        <div class="summary-card">
          <h3 class="failed">Failed</h3>
          <div style="font-size: 2em; font-weight: bold;" class="failed">${stats.failed}</div>
        </div>
        <div class="summary-card">
          <h3>Duration</h3>
          <div style="font-size: 2em; font-weight: bold;">${stats.duration.toFixed(2)}s</div>
        </div>
      </div>

      ${stats.coverage ? `
      <div class="summary">
        <div class="summary-card">
          <h3>Line Coverage</h3>
          <div style="font-size: 2em; font-weight: bold;">${stats.coverage.lines.toFixed(1)}%</div>
        </div>
        <div class="summary-card">
          <h3>Branch Coverage</h3>
          <div style="font-size: 2em; font-weight: bold;">${stats.coverage.branches.toFixed(1)}%</div>
        </div>
        <div class="summary-card">
          <h3>Function Coverage</h3>
          <div style="font-size: 2em; font-weight: bold;">${stats.coverage.functions.toFixed(1)}%</div>
        </div>
        <div class="summary-card">
          <h3>Statement Coverage</h3>
          <div style="font-size: 2em; font-weight: bold;">${stats.coverage.statements.toFixed(1)}%</div>
        </div>
      </div>
      ` : ''}

      ${slowTests.length > 0 ? `
      <div class="content" style="margin-bottom: 20px;">
        <h2>⚠️ Slow Tests (>1s)</h2>
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${slowTests.map(test => `
              <tr style="background: rgba(255, 193, 7, 0.1);">
                <td>${this.escapeHtml(test.title)}</td>
                <td style="color: #dc3545; font-weight: bold;">${(test.duration / 1000).toFixed(3)}s</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="content">
        <h2>Test Files</h2>
        ${report.testResults.map(file => this.generateFileHtml(file)).join('')}
      </div>
    `;

    return this.createHtmlTemplate('Vitest Test Report', content);
  }

  private findSlowTests(report: VitestReport): VitestTest[] {
    const slowTests: VitestTest[] = [];

    for (const file of report.testResults) {
      for (const test of file.assertionResults) {
        if (test.duration > 1000) {
          slowTests.push(test);
        }
      }
    }

    return slowTests.sort((a, b) => b.duration - a.duration).slice(0, 10);
  }

  private generateFileHtml(file: VitestFile): string {
    const duration = ((file.endTime - file.startTime) / 1000).toFixed(3);

    return `
      <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 class="collapsible">${this.escapeHtml(file.name)}</h3>
        <div class="collapsible-content">
          <p>Status: <span class="${file.status}">${file.status.toUpperCase()}</span> | Duration: ${duration}s</p>

          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${file.assertionResults.map(test => this.generateTestRow(test)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private generateTestRow(test: VitestTest): string {
    let statusIcon = '✅';
    let statusClass = 'passed';
    const isSlow = test.duration > 1000;

    switch (test.status) {
      case 'failed':
        statusIcon = '❌';
        statusClass = 'failed';
        break;
      case 'skipped':
        statusIcon = '⏭️';
        statusClass = 'skipped';
        break;
    }

    const failureMessage = test.failureMessages && test.failureMessages.length > 0
      ? `<pre style="margin-top: 10px;">${this.escapeHtml(test.failureMessages.join('\\n'))}</pre>`
      : '';

    return `
      <tr class="test-row ${statusClass}" ${isSlow ? 'style="background: rgba(255, 193, 7, 0.1);"' : ''}>
        <td>
          <strong>${this.escapeHtml(test.title)}</strong>
          ${isSlow ? '<span style="color: #ffc107; margin-left: 10px;">⚠️ SLOW</span>' : ''}
          ${failureMessage}
        </td>
        <td class="${statusClass}">${statusIcon} ${test.status.toUpperCase()}</td>
        <td ${isSlow ? 'style="color: #dc3545; font-weight: bold;"' : ''}>${(test.duration / 1000).toFixed(3)}s</td>
      </tr>
    `;
  }
}