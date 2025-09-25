import { ReportConverter } from '../index';

export class JestConverter implements ReportConverter {
  getFormat(): string {
    return 'jest';
  }

  convert(input: string | Buffer): string {
    let results;
    try {
      results = JSON.parse(input.toString());
    } catch (error) {
      return this.createErrorReport('Invalid Jest JSON format');
    }

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jest Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #99424f;
            padding-bottom: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card.success {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .summary-card.failure {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        .summary-card.pending {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
        }
        .summary-value {
            font-size: 2.5em;
            font-weight: bold;
        }
        .summary-label {
            margin-top: 10px;
            font-size: 1.1em;
        }
        .test-results {
            margin-top: 30px;
        }
        .test-file {
            margin: 20px 0;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            overflow: hidden;
        }
        .file-header {
            background: #f6f8fa;
            padding: 15px;
            font-weight: bold;
            border-bottom: 2px solid #e1e4e8;
        }
        .test-suite {
            padding: 15px;
        }
        .suite-title {
            font-weight: 600;
            color: #586069;
            margin: 10px 0;
        }
        .test-case {
            padding: 8px 15px;
            margin: 5px 0;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .test-case:hover {
            background: #f6f8fa;
        }
        .test-case.passed {
            border-left: 4px solid #28a745;
        }
        .test-case.failed {
            border-left: 4px solid #dc3545;
            background: #fff5f5;
        }
        .test-case.pending {
            border-left: 4px solid #ffc107;
        }
        .test-name {
            display: flex;
            align-items: center;
        }
        .test-status {
            margin-right: 10px;
            font-weight: bold;
        }
        .test-status.passed {
            color: #28a745;
        }
        .test-status.failed {
            color: #dc3545;
        }
        .test-status.pending {
            color: #ffc107;
        }
        .test-duration {
            margin-left: auto;
            color: #666;
            font-size: 0.9em;
        }
        .error-message {
            margin-top: 10px;
            padding: 10px;
            background: #f8d7da;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
        }
        .coverage-section {
            margin-top: 30px;
            padding: 20px;
            background: #f6f8fa;
            border-radius: 8px;
        }
        .coverage-bar {
            width: 100%;
            height: 20px;
            background: #e1e4e8;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.5s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Jest Test Report</h1>
        ${this.renderSummary(results)}
        ${this.renderTestResults(results)}
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
    const summary = results.summary || results;
    const total = summary.numTotalTests || 0;
    const passed = summary.numPassedTests || 0;
    const failed = summary.numFailedTests || 0;
    const pending = summary.numPendingTests || 0;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

    return `
        <div class="summary">
            <div class="summary-card">
                <div class="summary-value">${total}</div>
                <div class="summary-label">Total Tests</div>
            </div>
            <div class="summary-card success">
                <div class="summary-value">${passed}</div>
                <div class="summary-label">Passed (${passRate}%)</div>
            </div>
            <div class="summary-card failure">
                <div class="summary-value">${failed}</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-card pending">
                <div class="summary-value">${pending}</div>
                <div class="summary-label">Pending</div>
            </div>
        </div>`;
  }

  private renderTestResults(results: any): string {
    if (!results.testResults || results.testResults.length === 0) {
      return '<div class="test-results"><p>No test results available</p></div>';
    }

    let html = '<div class="test-results">';

    for (const file of results.testResults) {
      const fileName = file.name || 'Unknown file';
      html += `
        <div class="test-file">
            <div class="file-header">${fileName}</div>
            <div class="test-suite">`;

      if (file.assertionResults) {
        for (const test of file.assertionResults) {
          const status = test.status;
          const statusIcon = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '○';
          const duration = test.duration ? `${test.duration}ms` : '';

          html += `
                <div class="test-case ${status}">
                    <div class="test-name">
                        <span class="test-status ${status}">${statusIcon}</span>
                        <span>${test.title || test.fullName || 'Test'}</span>
                        ${duration ? `<span class="test-duration">${duration}</span>` : ''}
                    </div>`;

          if (status === 'failed' && test.failureMessages) {
            for (const message of test.failureMessages) {
              html += `<div class="error-message">${this.escapeHtml(message)}</div>`;
            }
          }

          html += '</div>';
        }
      }

      html += `
            </div>
        </div>`;
    }

    html += '</div>';
    return html;
  }

  private renderCoverage(results: any): string {
    if (!results.coverageMap && !results.coverage) {
      return '';
    }

    const coverage = results.coverage || results.coverageMap;
    const metrics = coverage.total || coverage.summary || {};

    return `
        <div class="coverage-section">
            <h2>Coverage Report</h2>
            ${this.renderCoverageMetric('Lines', metrics.lines)}
            ${this.renderCoverageMetric('Statements', metrics.statements)}
            ${this.renderCoverageMetric('Functions', metrics.functions)}
            ${this.renderCoverageMetric('Branches', metrics.branches)}
        </div>`;
  }

  private renderCoverageMetric(name: string, metric: any): string {
    if (!metric) return '';

    const percentage = metric.pct || metric.percentage || 0;
    const covered = metric.covered || 0;
    const total = metric.total || 0;

    return `
        <div style="margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${name}</span>
                <span>${percentage.toFixed(1)}% (${covered}/${total})</span>
            </div>
            <div class="coverage-bar">
                <div class="coverage-fill" style="width: ${percentage}%"></div>
            </div>
        </div>`;
  }

  private escapeHtml(text: string): string {
    const div = document?.createElement?.('div');
    if (div) {
      div.textContent = text;
      return div.innerHTML;
    }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}