import { ReportConverter } from '../index';

export class CucumberConverter implements ReportConverter {
  getFormat(): string {
    return 'cucumber';
  }

  convert(input: string | Buffer): string {
    let features;
    try {
      features = JSON.parse(input.toString());
    } catch (error) {
      return this.createErrorReport('Invalid Cucumber JSON format');
    }

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cucumber BDD Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            background: #f5f5f5;
            padding: 20px;
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
            border-bottom: 3px solid #23a559;
            padding-bottom: 10px;
            display: flex;
            align-items: center;
        }
        h1::before {
            content: "🥒";
            margin-right: 10px;
            font-size: 1.2em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid;
        }
        .summary-card.features {
            border-color: #23a559;
            background: #f0fdf4;
        }
        .summary-card.scenarios {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        .summary-card.passed {
            border-color: #10b981;
            background: #d1fae5;
        }
        .summary-card.failed {
            border-color: #ef4444;
            background: #fee2e2;
        }
        .summary-card.skipped {
            border-color: #f59e0b;
            background: #fef3c7;
        }
        .summary-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
        }
        .summary-label {
            margin-top: 5px;
            color: #666;
        }
        .feature {
            margin: 30px 0;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .feature-header {
            background: linear-gradient(135deg, #23a559 0%, #16a34a 100%);
            color: white;
            padding: 15px 20px;
        }
        .feature-name {
            font-size: 1.2em;
            font-weight: bold;
        }
        .feature-tags {
            margin-top: 5px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .tag {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.85em;
        }
        .feature-description {
            padding: 15px 20px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            font-style: italic;
            color: #666;
        }
        .scenario {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        .scenario:last-child {
            border-bottom: none;
        }
        .scenario-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .scenario-status {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            font-weight: bold;
            color: white;
        }
        .scenario-status.passed {
            background: #10b981;
        }
        .scenario-status.failed {
            background: #ef4444;
        }
        .scenario-status.skipped {
            background: #f59e0b;
        }
        .scenario-name {
            font-weight: 600;
            color: #333;
            flex: 1;
        }
        .scenario-duration {
            color: #9ca3af;
            font-size: 0.9em;
        }
        .steps {
            margin-left: 34px;
        }
        .step {
            margin: 10px 0;
            padding: 8px 12px;
            border-radius: 4px;
            display: flex;
            align-items: flex-start;
        }
        .step.passed {
            background: #f0fdf4;
            border-left: 3px solid #10b981;
        }
        .step.failed {
            background: #fef2f2;
            border-left: 3px solid #ef4444;
        }
        .step.skipped {
            background: #fafafa;
            border-left: 3px solid #9ca3af;
        }
        .step-keyword {
            font-weight: 600;
            margin-right: 8px;
            color: #059669;
            min-width: 50px;
        }
        .step-text {
            flex: 1;
            color: #333;
        }
        .step-duration {
            color: #9ca3af;
            font-size: 0.85em;
            margin-left: 10px;
        }
        .error-message {
            margin-top: 10px;
            margin-left: 58px;
            padding: 10px;
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
            color: #991b1b;
        }
        .data-table {
            margin-top: 10px;
            margin-left: 58px;
            border-collapse: collapse;
            font-size: 0.9em;
        }
        .data-table th, .data-table td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
        }
        .data-table th {
            background: #f3f4f6;
            font-weight: 600;
        }
        .examples {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px dashed #e5e7eb;
        }
        .examples-title {
            font-weight: 600;
            color: #666;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Cucumber BDD Report</h1>
        ${this.renderSummary(features)}
        ${this.renderFeatures(features)}
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

  private renderSummary(features: any[]): string {
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    let skippedScenarios = 0;

    if (Array.isArray(features)) {
      for (const feature of features) {
        if (feature.elements) {
          for (const element of feature.elements) {
            if (element.type === 'scenario') {
              totalScenarios++;
              const status = this.getScenarioStatus(element);
              if (status === 'passed') passedScenarios++;
              else if (status === 'failed') failedScenarios++;
              else skippedScenarios++;
            }
          }
        }
      }
    }

    return `
        <div class="summary">
            <div class="summary-card features">
                <div class="summary-value">${features.length}</div>
                <div class="summary-label">Features</div>
            </div>
            <div class="summary-card scenarios">
                <div class="summary-value">${totalScenarios}</div>
                <div class="summary-label">Scenarios</div>
            </div>
            <div class="summary-card passed">
                <div class="summary-value">${passedScenarios}</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-card failed">
                <div class="summary-value">${failedScenarios}</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-card skipped">
                <div class="summary-value">${skippedScenarios}</div>
                <div class="summary-label">Skipped</div>
            </div>
        </div>`;
  }

  private renderFeatures(features: any[]): string {
    if (!Array.isArray(features) || features.length === 0) {
      return '<p>No features found</p>';
    }

    let html = '';

    for (const feature of features) {
      html += `
        <div class="feature">
            <div class="feature-header">
                <div class="feature-name">${feature.name || 'Feature'}</div>
                ${this.renderTags(feature.tags)}
            </div>`;

      if (feature.description) {
        html += `<div class="feature-description">${feature.description}</div>`;
      }

      if (feature.elements) {
        for (const element of feature.elements) {
          if (element.type === 'scenario' || element.type === 'scenario_outline') {
            html += this.renderScenario(element);
          }
        }
      }

      html += '</div>';
    }

    return html;
  }

  private renderTags(tags: any[]): string {
    if (!tags || tags.length === 0) return '';

    let html = '<div class="feature-tags">';
    for (const tag of tags) {
      html += `<span class="tag">${tag.name}</span>`;
    }
    html += '</div>';

    return html;
  }

  private renderScenario(scenario: any): string {
    const status = this.getScenarioStatus(scenario);
    const duration = this.calculateDuration(scenario.steps);
    const statusIcon = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '○';

    let html = `
        <div class="scenario">
            <div class="scenario-header">
                <div class="scenario-status ${status}">${statusIcon}</div>
                <div class="scenario-name">${scenario.name}</div>
                ${duration ? `<div class="scenario-duration">${duration}ms</div>` : ''}
            </div>
            <div class="steps">`;

    if (scenario.steps) {
      for (const step of scenario.steps) {
        html += this.renderStep(step);
      }
    }

    html += '</div>';

    if (scenario.examples) {
      html += this.renderExamples(scenario.examples);
    }

    html += '</div>';

    return html;
  }

  private renderStep(step: any): string {
    const status = step.result ? step.result.status : 'skipped';
    const duration = step.result && step.result.duration ?
      Math.round(step.result.duration / 1000000) : null;

    let html = `
        <div class="step ${status}">
            <span class="step-keyword">${step.keyword}</span>
            <span class="step-text">${step.name || ''}</span>
            ${duration ? `<span class="step-duration">${duration}ms</span>` : ''}
        </div>`;

    if (step.result && step.result.error_message) {
      html += `<div class="error-message">${this.escapeHtml(step.result.error_message)}</div>`;
    }

    if (step.rows) {
      html += this.renderDataTable(step.rows);
    }

    return html;
  }

  private renderDataTable(rows: any[]): string {
    if (!rows || rows.length === 0) return '';

    let html = '<table class="data-table">';

    // First row as headers
    if (rows[0] && rows[0].cells) {
      html += '<thead><tr>';
      for (const cell of rows[0].cells) {
        html += `<th>${cell}</th>`;
      }
      html += '</tr></thead>';

      // Rest as body
      if (rows.length > 1) {
        html += '<tbody>';
        for (let i = 1; i < rows.length; i++) {
          html += '<tr>';
          for (const cell of rows[i].cells) {
            html += `<td>${cell}</td>`;
          }
          html += '</tr>';
        }
        html += '</tbody>';
      }
    }

    html += '</table>';
    return html;
  }

  private renderExamples(examples: any[]): string {
    if (!examples || examples.length === 0) return '';

    let html = '<div class="examples"><div class="examples-title">Examples:</div>';

    for (const example of examples) {
      if (example.rows) {
        html += this.renderDataTable(example.rows);
      }
    }

    html += '</div>';
    return html;
  }

  private getScenarioStatus(scenario: any): string {
    if (!scenario.steps) return 'skipped';

    let hasFailed = false;
    let hasSkipped = false;

    for (const step of scenario.steps) {
      if (step.result) {
        if (step.result.status === 'failed') {
          hasFailed = true;
        } else if (step.result.status === 'skipped' || step.result.status === 'undefined') {
          hasSkipped = true;
        }
      } else {
        hasSkipped = true;
      }
    }

    if (hasFailed) return 'failed';
    if (hasSkipped) return 'skipped';
    return 'passed';
  }

  private calculateDuration(steps: any[]): number | null {
    if (!steps) return null;

    let total = 0;
    for (const step of steps) {
      if (step.result && step.result.duration) {
        total += step.result.duration;
      }
    }

    return total > 0 ? Math.round(total / 1000000) : null;
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