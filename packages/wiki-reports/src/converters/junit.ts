import { ReportConverter } from './base';
import type { ConversionResult } from '../types';

interface JUnitTestSuite {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  skipped: number;
  time: number;
  testcases: JUnitTestCase[];
}

interface JUnitTestCase {
  name: string;
  classname: string;
  time: number;
  failure?: { message: string; type: string; content: string };
  error?: { message: string; type: string; content: string };
  skipped?: { message?: string };
}

export class JUnitConverter extends ReportConverter {
  readonly format = 'junit' as const;

  async convert(data: unknown): Promise<ConversionResult> {
    const suites = this.parseJUnitData(data);
    const stats = this.calculateStats(suites);
    const html = this.generateHtml(suites, stats);

    return {
      format: this.format,
      html,
      stats,
    };
  }

  private parseJUnitData(data: unknown): JUnitTestSuite[] {
    // In a real implementation, this would parse XML
    // For now, we'll handle a simplified JSON structure
    if (typeof data === 'string') {
      // Would parse XML here
      return [];
    }

    const suites: JUnitTestSuite[] = [];
    if (data && typeof data === 'object' && 'testsuites' in data) {
      // Handle parsed structure
      const testsuites = data as any;
      if (Array.isArray(testsuites.testsuite)) {
        for (const suite of testsuites.testsuite) {
          suites.push(this.parseSuite(suite));
        }
      } else if (testsuites.testsuite) {
        suites.push(this.parseSuite(testsuites.testsuite));
      }
    }

    return suites;
  }

  private parseSuite(suite: any): JUnitTestSuite {
    const testcases: JUnitTestCase[] = [];

    if (Array.isArray(suite.testcase)) {
      testcases.push(...suite.testcase.map((tc: any) => this.parseTestCase(tc)));
    } else if (suite.testcase) {
      testcases.push(this.parseTestCase(suite.testcase));
    }

    return {
      name: suite.name || 'Unknown Suite',
      tests: parseInt(suite.tests || '0'),
      failures: parseInt(suite.failures || '0'),
      errors: parseInt(suite.errors || '0'),
      skipped: parseInt(suite.skipped || '0'),
      time: parseFloat(suite.time || '0'),
      testcases,
    };
  }

  private parseTestCase(testcase: any): JUnitTestCase {
    return {
      name: testcase.name || 'Unknown Test',
      classname: testcase.classname || '',
      time: parseFloat(testcase.time || '0'),
      failure: testcase.failure,
      error: testcase.error,
      skipped: testcase.skipped,
    };
  }

  private calculateStats(suites: JUnitTestSuite[]) {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;

    for (const suite of suites) {
      total += suite.tests;
      failed += suite.failures + suite.errors;
      skipped += suite.skipped;
      duration += suite.time;
    }

    passed = total - failed - skipped;

    return { total, passed, failed, skipped, duration };
  }

  private generateHtml(suites: JUnitTestSuite[], stats: any): string {
    const content = `
      <div class="header">
        <h1>JUnit Test Report</h1>
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
          <h3 class="skipped">Skipped</h3>
          <div style="font-size: 2em; font-weight: bold;" class="skipped">${stats.skipped}</div>
        </div>
      </div>

      <div class="content">
        <h2>Test Suites</h2>
        ${suites.map(suite => this.generateSuiteHtml(suite)).join('')}
      </div>
    `;

    return this.createHtmlTemplate('JUnit Test Report', content);
  }

  private generateSuiteHtml(suite: JUnitTestSuite): string {
    return `
      <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 class="collapsible">${this.escapeHtml(suite.name)}</h3>
        <div class="collapsible-content">
          <p>
            Tests: ${suite.tests} |
            Failed: <span class="failed">${suite.failures + suite.errors}</span> |
            Skipped: <span class="skipped">${suite.skipped}</span> |
            Duration: ${suite.time.toFixed(3)}s
          </p>

          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${suite.testcases.map(tc => this.generateTestCaseRow(tc)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private generateTestCaseRow(testcase: JUnitTestCase): string {
    let status = 'passed';
    let statusText = '✅ Passed';
    let details = '';

    if (testcase.failure) {
      status = 'failed';
      statusText = '❌ Failed';
      details = `<pre>${this.escapeHtml(testcase.failure.message || testcase.failure.content || '')}</pre>`;
    } else if (testcase.error) {
      status = 'failed';
      statusText = '❌ Error';
      details = `<pre>${this.escapeHtml(testcase.error.message || testcase.error.content || '')}</pre>`;
    } else if (testcase.skipped) {
      status = 'skipped';
      statusText = '⏭️ Skipped';
      details = testcase.skipped.message ? `<p>${this.escapeHtml(testcase.skipped.message)}</p>` : '';
    }

    return `
      <tr class="test-row ${status}">
        <td>
          <strong>${this.escapeHtml(testcase.name)}</strong>
          ${testcase.classname ? `<br><small>${this.escapeHtml(testcase.classname)}</small>` : ''}
          ${details}
        </td>
        <td class="${status}">${statusText}</td>
        <td>${testcase.time.toFixed(3)}s</td>
      </tr>
    `;
  }
}