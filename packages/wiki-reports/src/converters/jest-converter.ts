import * as fs from 'fs/promises';
import * as path from 'path';
import { ReportConverter, ConvertOptions, ConvertResult, TestSummary } from './report-converter';

export class JestConverter extends ReportConverter {
  async canConvert(filePath: string): Promise<boolean> {
    if (!filePath.endsWith('.json')) return false;

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return data.testResults !== undefined || data.numTotalTests !== undefined;
    } catch {
      return false;
    }
  }

  async convert(options: ConvertOptions): Promise<ConvertResult> {
    const jsonContent = await fs.readFile(options.inputPath, 'utf-8');
    const jestResults = JSON.parse(jsonContent);
    const summary = this.extractSummary(jestResults);

    const htmlContent = this.generateHtml(jestResults, summary, options.metadata);
    await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
    await fs.writeFile(options.outputPath, htmlContent);

    return {
      success: true,
      outputPath: options.outputPath,
      format: 'jest',
      summary
    };
  }

  async getSummary(filePath: string): Promise<TestSummary> {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return this.extractSummary(data);
  }

  private extractSummary(data: any): TestSummary {
    return {
      total: data.numTotalTests || 0,
      passed: data.numPassedTests || 0,
      failed: data.numFailedTests || 0,
      skipped: data.numPendingTests || 0,
      duration: data.testResults?.reduce((acc: number, r: any) => acc + (r.perfStats?.runtime || 0), 0) || 0
    };
  }

  private generateHtml(results: any, summary: TestSummary, metadata?: Record<string, any>): string {
    const content = `
      <div class="header">
        <h1>Jest Test Report</h1>
        <div class="summary">
          <div class="summary-card">
            <div class="summary-value">${summary.total}</div>
            <div class="summary-label">Total</div>
          </div>
          <div class="summary-card pass">
            <div class="summary-value">${summary.passed}</div>
            <div class="summary-label">Passed</div>
          </div>
          <div class="summary-card fail">
            <div class="summary-value">${summary.failed}</div>
            <div class="summary-label">Failed</div>
          </div>
        </div>
      </div>
      <div class="content">
        ${this.generateTestResults(results.testResults || [])}
      </div>
    `;

    return this.createHtmlTemplate('Jest Test Report', content);
  }

  private generateTestResults(testResults: any[]): string {
    return testResults
      .map((suite: any) => `
        <div class="test-suite">
          <div class="suite-header">
            <div>${suite.testFilePath || suite.name}</div>
            <div>${suite.numPassingTests} passed, ${suite.numFailingTests} failed</div>
          </div>
        </div>
      `)
      .join('');
  }
}