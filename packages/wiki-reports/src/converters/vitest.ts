import { ReportConverter } from '../index';

export class VitestConverter implements ReportConverter {
  getFormat(): string {
    return 'vitest';
  }

  convert(input: string | Buffer): string {
    let results;
    try {
      results = JSON.parse(input.toString());
    } catch (error) {
      return this.createErrorReport('Invalid Vitest JSON format');
    }

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vitest Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            display: flex;
            align-items: center;
        }
        h1::before {
            content: "⚡";
            margin-right: 10px;
            font-size: 1.5em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .summary-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }
        .summary-card.total::before {
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        .summary-card.passed {
            background: #f0f9ff;
        }
        .summary-card.passed::before {
            background: #10b981;
        }
        .summary-card.failed {
            background: #fef2f2;
        }
        .summary-card.failed::before {
            background: #ef4444;
        }
        .summary-card.skipped {
            background: #fffbeb;
        }
        .summary-card.skipped::before {
            background: #f59e0b;
        }
        .summary-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
        }
        .summary-label {
            margin-top: 10px;
            color: #666;
        }
        .test-files {
            margin-top: 30px;
        }
        .file-card {
            margin: 20px 0;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .file-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .file-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .file-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
        }
        .stat {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .tests-container {
            padding: 20px;
        }
        .test-item {
            padding: 12px;
            margin: 8px 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            transition: background 0.2s;
        }
        .test-item:hover {
            background: #f9fafb;
        }
        .test-item.pass {
            border-left: 4px solid #10b981;
        }
        .test-item.fail {
            border-left: 4px solid #ef4444;
            background: #fef2f2;
        }
        .test-item.skip {
            border-left: 4px solid #f59e0b;
        }
        .test-icon {
            margin-right: 12px;
            font-size: 1.2em;
        }
        .test-icon.pass {
            color: #10b981;
        }
        .test-icon.fail {
            color: #ef4444;
        }
        .test-icon.skip {
            color: #f59e0b;
        }
        .test-name {
            flex: 1;
            color: #333;
        }
        .test-duration {
            color: #9ca3af;
            font-size: 0.9em;
        }
        .error-details {
            margin-top: 10px;
            padding: 10px;
            background: #fee;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
            color: #991b1b;
        }
        .performance-section {
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            border-radius: 12px;
        }
        .perf-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .perf-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .perf-label {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        .perf-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
        }
        .coverage-section {
            margin-top: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
        }
        .coverage-item {
            margin: 15px 0;
        }
        .coverage-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .coverage-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        .coverage-fill {
            height: 100%;
            transition: width 0.5s ease;
        }
        .coverage-fill.high {
            background: linear-gradient(90deg, #10b981, #059669);
        }
        .coverage-fill.medium {
            background: linear-gradient(90deg, #f59e0b, #d97706);
        }
        .coverage-fill.low {
            background: linear-gradient(90deg, #ef4444, #dc2626);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Vitest Test Report</h1>
        ${this.renderSummary(results)}
        ${this.renderTestFiles(results)}
        ${this.renderPerformance(results)}
        ${this.renderCoverage(results)}
    </div>
</body>
</html>`;
  }

  private createErrorReport(message: string): string {
    return `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body><h1>Error</h1><p>${message}</p></body>
</html>`;
  }

  private renderSummary(results: any): string {
    const total = results.numTotalTests || 0;
    const passed = results.numPassedTests || 0;
    const failed = results.numFailedTests || 0;
    const skipped = results.numSkippedTests || results.numTodoTests || 0;

    return `
        <div class="summary">
            <div class="summary-card total">
                <div class="summary-value">${total}</div>
                <div class="summary-label">Total Tests</div>
            </div>
            <div class="summary-card passed">
                <div class="summary-value">${passed}</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-card failed">
                <div class="summary-value">${failed}</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-card skipped">
                <div class="summary-value">${skipped}</div>
                <div class="summary-label">Skipped</div>
            </div>
        </div>`;
  }

  private renderTestFiles(results: any): string {
    const testResults = results.testResults || [];
    if (testResults.length === 0) {
      return '<div class="test-files"><p>No test results available</p></div>';
    }

    let html = '<div class="test-files">';

    for (const file of testResults) {
      const fileName = file.name || 'Unknown file';
      const tests = file.assertionResults || [];
      const passed = tests.filter((t: any) => t.status === 'passed').length;
      const failed = tests.filter((t: any) => t.status === 'failed').length;
      const skipped = tests.filter((t: any) => t.status === 'skipped' || t.status === 'pending').length;

      html += `
        <div class="file-card">
            <div class="file-header">
                <span>${fileName}</span>
                <div class="file-stats">
                    <div class="stat">✓ ${passed}</div>
                    <div class="stat">✗ ${failed}</div>
                    <div class="stat">○ ${skipped}</div>
                </div>
            </div>
            <div class="tests-container">`;

      for (const test of tests) {
        const status = test.status;
        const icon = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '○';
        const duration = test.duration ? `${test.duration}ms` : '';

        html += `
                <div class="test-item ${status === 'passed' ? 'pass' : status === 'failed' ? 'fail' : 'skip'}">
                    <span class="test-icon ${status === 'passed' ? 'pass' : status === 'failed' ? 'fail' : 'skip'}">${icon}</span>
                    <span class="test-name">${test.title || test.fullName || 'Test'}</span>
                    ${duration ? `<span class="test-duration">${duration}</span>` : ''}
                </div>`;

        if (status === 'failed' && test.failureMessages) {
          for (const message of test.failureMessages) {
            html += `<div class="error-details">${this.escapeHtml(message)}</div>`;
          }
        }
      }

      html += `
            </div>
        </div>`;
    }

    html += '</div>';
    return html;
  }

  private renderPerformance(results: any): string {
    if (!results.startTime || !results.success === undefined) {
      return '';
    }

    const duration = results.duration || (results.endTime - results.startTime) || 0;
    const testsPerSecond = duration > 0 ? ((results.numTotalTests || 0) / (duration / 1000)).toFixed(2) : 'N/A';

    return `
        <div class="performance-section">
            <h2>Performance Metrics</h2>
            <div class="perf-grid">
                <div class="perf-item">
                    <div class="perf-label">Total Duration</div>
                    <div class="perf-value">${duration}ms</div>
                </div>
                <div class="perf-item">
                    <div class="perf-label">Tests/Second</div>
                    <div class="perf-value">${testsPerSecond}</div>
                </div>
                <div class="perf-item">
                    <div class="perf-label">Test Suites</div>
                    <div class="perf-value">${results.numTotalTestSuites || 0}</div>
                </div>
                <div class="perf-item">
                    <div class="perf-label">Success Rate</div>
                    <div class="perf-value">${results.success ? '✓' : '✗'}</div>
                </div>
            </div>
        </div>`;
  }

  private renderCoverage(results: any): string {
    if (!results.coverage) {
      return '';
    }

    const coverage = results.coverage;

    return `
        <div class="coverage-section">
            <h2>Code Coverage</h2>
            ${this.renderCoverageMetric('Lines', coverage.lines)}
            ${this.renderCoverageMetric('Statements', coverage.statements)}
            ${this.renderCoverageMetric('Functions', coverage.functions)}
            ${this.renderCoverageMetric('Branches', coverage.branches)}
        </div>`;
  }

  private renderCoverageMetric(name: string, metric: any): string {
    if (!metric) return '';

    const percentage = metric.percentage || metric.pct || 0;
    const covered = metric.covered || 0;
    const total = metric.total || 0;
    const coverageClass = percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low';

    return `
        <div class="coverage-item">
            <div class="coverage-header">
                <span>${name}</span>
                <span>${percentage.toFixed(1)}% (${covered}/${total})</span>
            </div>
            <div class="coverage-bar">
                <div class="coverage-fill ${coverageClass}" style="width: ${percentage}%"></div>
            </div>
        </div>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}