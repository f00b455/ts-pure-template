import { ReportConverter } from '../index';

export class JUnitConverter implements ReportConverter {
  getFormat(): string {
    return 'junit';
  }

  convert(input: string | Buffer): string {
    const xml = input.toString();

    // Basic XML parsing (simplified - in production use xml2js or fast-xml-parser)
    const testSuites = this.parseTestSuites(xml);

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JUnit Test Report</title>
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
            border-bottom: 3px solid #007acc;
            padding-bottom: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .summary-card {
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .summary-card.passed {
            background: #d4edda;
            border: 1px solid #c3e6cb;
        }
        .summary-card.failed {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        .summary-card.skipped {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
        }
        .summary-value {
            font-size: 2em;
            font-weight: bold;
        }
        .test-suite {
            margin: 20px 0;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            overflow: hidden;
        }
        .suite-header {
            background: #f6f8fa;
            padding: 15px;
            font-weight: bold;
            border-bottom: 1px solid #e1e4e8;
        }
        .test-case {
            padding: 10px 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        .test-case:last-child {
            border-bottom: none;
        }
        .test-case.passed::before {
            content: "✓ ";
            color: #28a745;
            font-weight: bold;
        }
        .test-case.failed::before {
            content: "✗ ";
            color: #dc3545;
            font-weight: bold;
        }
        .test-case.skipped::before {
            content: "○ ";
            color: #ffc107;
            font-weight: bold;
        }
        .error-message {
            margin-top: 10px;
            padding: 10px;
            background: #f8d7da;
            border-left: 3px solid #dc3545;
            font-family: monospace;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JUnit Test Report</h1>
        ${this.renderSummary(testSuites)}
        ${this.renderTestSuites(testSuites)}
    </div>
</body>
</html>`;
  }

  private parseTestSuites(xml: string): any {
    // Simplified parsing - in production use proper XML parser
    const suites: any[] = [];

    // Extract basic test suite information
    const suiteMatches = xml.match(/<testsuite[^>]*>/g) || [];

    for (const suiteMatch of suiteMatches) {
      const name = this.extractAttribute(suiteMatch, 'name') || 'Test Suite';
      const tests = parseInt(this.extractAttribute(suiteMatch, 'tests') || '0');
      const failures = parseInt(this.extractAttribute(suiteMatch, 'failures') || '0');
      const errors = parseInt(this.extractAttribute(suiteMatch, 'errors') || '0');
      const skipped = parseInt(this.extractAttribute(suiteMatch, 'skipped') || '0');

      suites.push({
        name,
        tests,
        failures,
        errors,
        skipped,
        passed: tests - failures - errors - skipped,
        testCases: []
      });
    }

    return suites;
  }

  private extractAttribute(tag: string, attr: string): string | null {
    const match = tag.match(new RegExp(`${attr}="([^"]*)"`));
    return match ? match[1] : null;
  }

  private renderSummary(suites: any[]): string {
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const suite of suites) {
      totalTests += suite.tests;
      totalPassed += suite.passed;
      totalFailed += suite.failures + suite.errors;
      totalSkipped += suite.skipped;
    }

    return `
        <div class="summary">
            <div class="summary-card">
                <div class="summary-value">${totalTests}</div>
                <div>Total Tests</div>
            </div>
            <div class="summary-card passed">
                <div class="summary-value">${totalPassed}</div>
                <div>Passed</div>
            </div>
            <div class="summary-card failed">
                <div class="summary-value">${totalFailed}</div>
                <div>Failed</div>
            </div>
            <div class="summary-card skipped">
                <div class="summary-value">${totalSkipped}</div>
                <div>Skipped</div>
            </div>
        </div>`;
  }

  private renderTestSuites(suites: any[]): string {
    let html = '';

    for (const suite of suites) {
      html += `
        <div class="test-suite">
            <div class="suite-header">
                ${suite.name} - ${suite.passed}/${suite.tests} passed
            </div>`;

      // In a real implementation, parse and display individual test cases
      if (suite.tests > 0) {
        html += `
            <div class="test-case passed">Example test case - passed</div>`;
      }

      html += `
        </div>`;
    }

    return html;
  }
}