import * as fs from 'fs/promises';
import * as path from 'path';
import { ReportConverter, ConvertOptions, ConvertResult, TestSummary } from './report-converter';

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
  status: 'pass' | 'fail' | 'skip' | 'error';
  failure?: {
    message: string;
    type: string;
    text: string;
  };
}

export class JUnitConverter extends ReportConverter {
  async canConvert(filePath: string): Promise<boolean> {
    if (!filePath.endsWith('.xml')) return false;

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.includes('<testsuite') || content.includes('<testsuites');
    } catch {
      return false;
    }
  }

  async convert(options: ConvertOptions): Promise<ConvertResult> {
    const xmlContent = await fs.readFile(options.inputPath, 'utf-8');
    const testSuites = this.parseJUnit(xmlContent);
    const summary = this.calculateSummary(testSuites);

    const htmlContent = this.generateHtml(testSuites, summary, options.metadata);
    await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
    await fs.writeFile(options.outputPath, htmlContent);

    return {
      success: true,
      outputPath: options.outputPath,
      format: 'junit',
      summary
    };
  }

  async getSummary(filePath: string): Promise<TestSummary> {
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    const testSuites = this.parseJUnit(xmlContent);
    return this.calculateSummary(testSuites);
  }

  private parseJUnit(xmlContent: string): JUnitTestSuite[] {
    const suites: JUnitTestSuite[] = [];

    // Simple regex-based XML parsing (for demo - in production use proper XML parser)
    const suitesMatch = xmlContent.match(/<testsuite[^>]*>[\s\S]*?<\/testsuite>/g) || [];

    for (const suiteXml of suitesMatch) {
      const suite: JUnitTestSuite = {
        name: this.extractAttr(suiteXml, 'name') || 'Unknown Suite',
        tests: parseInt(this.extractAttr(suiteXml, 'tests') || '0'),
        failures: parseInt(this.extractAttr(suiteXml, 'failures') || '0'),
        errors: parseInt(this.extractAttr(suiteXml, 'errors') || '0'),
        skipped: parseInt(this.extractAttr(suiteXml, 'skipped') || '0'),
        time: parseFloat(this.extractAttr(suiteXml, 'time') || '0'),
        testcases: []
      };

      const testcasesMatch = suiteXml.match(/<testcase[^>]*>[\s\S]*?<\/testcase>/g) || [];

      for (const testcaseXml of testcasesMatch) {
        const testcase: JUnitTestCase = {
          name: this.extractAttr(testcaseXml, 'name') || 'Unknown Test',
          classname: this.extractAttr(testcaseXml, 'classname') || '',
          time: parseFloat(this.extractAttr(testcaseXml, 'time') || '0'),
          status: 'pass'
        };

        if (testcaseXml.includes('<failure')) {
          testcase.status = 'fail';
          const failureMatch = testcaseXml.match(/<failure[^>]*>([\s\S]*?)<\/failure>/);
          if (failureMatch) {
            testcase.failure = {
              message: this.extractAttr(failureMatch[0], 'message') || '',
              type: this.extractAttr(failureMatch[0], 'type') || '',
              text: failureMatch[1].trim()
            };
          }
        } else if (testcaseXml.includes('<error')) {
          testcase.status = 'error';
        } else if (testcaseXml.includes('<skipped')) {
          testcase.status = 'skip';
        }

        suite.testcases.push(testcase);
      }

      suites.push(suite);
    }

    return suites;
  }

  private extractAttr(xml: string, attr: string): string | null {
    const match = xml.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
    return match ? match[1] : null;
  }

  private calculateSummary(suites: JUnitTestSuite[]): TestSummary {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;

    for (const suite of suites) {
      total += suite.tests;
      failed += suite.failures + suite.errors;
      skipped += suite.skipped;
      passed += suite.tests - suite.failures - suite.errors - suite.skipped;
      duration += suite.time * 1000; // Convert to ms
    }

    return {
      total,
      passed,
      failed,
      skipped,
      duration
    };
  }

  private generateHtml(suites: JUnitTestSuite[], summary: TestSummary, metadata?: Record<string, any>): string {
    const headerContent = `
      <div class="header">
        <h1>JUnit Test Report</h1>
        ${metadata ? `<div class="metadata">
          ${metadata.branch ? `<span>Branch: ${metadata.branch}</span> | ` : ''}
          ${metadata.commit ? `<span>Commit: ${metadata.commit}</span> | ` : ''}
          ${metadata.timestamp ? `<span>Time: ${new Date(metadata.timestamp).toLocaleString()}</span>` : ''}
        </div>` : ''}
        <div class="summary">
          <div class="summary-card">
            <div class="summary-value">${summary.total}</div>
            <div class="summary-label">Total Tests</div>
          </div>
          <div class="summary-card pass">
            <div class="summary-value">${summary.passed}</div>
            <div class="summary-label">Passed</div>
          </div>
          <div class="summary-card fail">
            <div class="summary-value">${summary.failed}</div>
            <div class="summary-label">Failed</div>
          </div>
          <div class="summary-card skip">
            <div class="summary-value">${summary.skipped}</div>
            <div class="summary-label">Skipped</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${this.formatDuration(summary.duration)}</div>
            <div class="summary-label">Duration</div>
          </div>
        </div>
      </div>
    `;

    const suitesContent = suites
      .map(suite => this.generateSuiteHtml(suite))
      .join('');

    const content = `
      ${headerContent}
      <div class="content">
        ${suitesContent}
      </div>
    `;

    return this.createHtmlTemplate('JUnit Test Report', content);
  }

  private generateSuiteHtml(suite: JUnitTestSuite): string {
    const testCases = suite.testcases
      .map(test => `
        <div class="test-case ${test.status}">
          <div class="test-name">${test.name}</div>
          <div class="test-duration">${this.formatDuration(test.time * 1000)}</div>
          <div class="test-status ${test.status}">${test.status}</div>
          ${test.failure ? `
            <div class="error-details">${this.escapeHtml(test.failure.text)}</div>
          ` : ''}
        </div>
      `)
      .join('');

    return `
      <div class="test-suite">
        <div class="suite-header">
          <div class="suite-name">${suite.name}</div>
          <div class="suite-summary">
            ${suite.tests} tests |
            ${suite.tests - suite.failures - suite.errors - suite.skipped} passed |
            ${suite.failures + suite.errors} failed |
            ${suite.skipped} skipped
          </div>
        </div>
        <div class="suite-tests">
          ${testCases}
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}