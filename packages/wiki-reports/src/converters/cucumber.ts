import { ReportConverter } from './base';
import type { ConversionResult } from '../types';

interface CucumberFeature {
  keyword: string;
  name: string;
  description: string;
  elements: CucumberScenario[];
  tags?: CucumberTag[];
}

interface CucumberScenario {
  keyword: string;
  name: string;
  description?: string;
  steps: CucumberStep[];
  tags?: CucumberTag[];
  type: string;
}

interface CucumberStep {
  keyword: string;
  name: string;
  result: {
    status: 'passed' | 'failed' | 'skipped' | 'pending';
    duration?: number;
    error_message?: string;
  };
  match?: {
    location: string;
  };
}

interface CucumberTag {
  name: string;
}

export class CucumberConverter extends ReportConverter {
  readonly format = 'cucumber' as const;

  async convert(data: unknown): Promise<ConversionResult> {
    const features = this.parseCucumberData(data);
    const stats = this.calculateStats(features);
    const html = this.generateHtml(features, stats);

    return {
      format: this.format,
      html,
      stats,
    };
  }

  private parseCucumberData(data: unknown): CucumberFeature[] {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    if (Array.isArray(data)) {
      return data as CucumberFeature[];
    }

    return [];
  }

  private calculateStats(features: CucumberFeature[]) {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;

    for (const feature of features) {
      for (const scenario of feature.elements) {
        total++;

        let scenarioPassed = true;
        let scenarioSkipped = false;
        let scenarioDuration = 0;

        for (const step of scenario.steps) {
          if (step.result.status === 'failed') {
            scenarioPassed = false;
          }
          if (step.result.status === 'skipped' || step.result.status === 'pending') {
            scenarioSkipped = true;
          }
          scenarioDuration += step.result.duration || 0;
        }

        if (!scenarioPassed) {
          failed++;
        } else if (scenarioSkipped) {
          skipped++;
        } else {
          passed++;
        }

        duration += scenarioDuration / 1000000000; // Convert nanoseconds to seconds
      }
    }

    return { total, passed, failed, skipped, duration };
  }

  private generateHtml(features: CucumberFeature[], stats: any): string {
    const content = `
      <div class="header">
        <h1>Cucumber Test Report</h1>
        <p>Generated at ${new Date().toISOString()}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Scenarios</h3>
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
        <h2>Features</h2>
        ${features.map(feature => this.generateFeatureHtml(feature)).join('')}
      </div>
    `;

    return this.createHtmlTemplate('Cucumber Test Report', content);
  }

  private generateFeatureHtml(feature: CucumberFeature): string {
    const tags = feature.tags ? feature.tags.map(tag => `<span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 12px; margin-right: 5px; font-size: 0.85em;">${tag.name}</span>`).join('') : '';

    return `
      <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 class="collapsible">
          ${tags}
          ${this.escapeHtml(feature.name)}
        </h3>
        <div class="collapsible-content">
          ${feature.description ? `<p style="margin: 10px 0; color: #666;">${this.escapeHtml(feature.description)}</p>` : ''}

          ${feature.elements.map(scenario => this.generateScenarioHtml(scenario)).join('')}
        </div>
      </div>
    `;
  }

  private generateScenarioHtml(scenario: CucumberScenario): string {
    const tags = scenario.tags ? scenario.tags.map(tag => `<span style="background: #764ba2; color: white; padding: 2px 6px; border-radius: 10px; margin-right: 5px; font-size: 0.8em;">${tag.name}</span>`).join('') : '';

    let scenarioStatus = 'passed';
    for (const step of scenario.steps) {
      if (step.result.status === 'failed') {
        scenarioStatus = 'failed';
        break;
      } else if (step.result.status === 'skipped' || step.result.status === 'pending') {
        scenarioStatus = 'skipped';
      }
    }

    return `
      <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid ${scenarioStatus === 'passed' ? '#28a745' : scenarioStatus === 'failed' ? '#dc3545' : '#ffc107'};">
        <h4>
          ${tags}
          ${this.escapeHtml(scenario.keyword)}: ${this.escapeHtml(scenario.name)}
        </h4>
        ${scenario.description ? `<p style="margin: 10px 0; color: #666; font-style: italic;">${this.escapeHtml(scenario.description)}</p>` : ''}

        <div style="margin-top: 15px;">
          ${scenario.steps.map(step => this.generateStepHtml(step)).join('')}
        </div>
      </div>
    `;
  }

  private generateStepHtml(step: CucumberStep): string {
    let statusIcon = '✅';
    let statusColor = '#28a745';

    switch (step.result.status) {
      case 'failed':
        statusIcon = '❌';
        statusColor = '#dc3545';
        break;
      case 'skipped':
      case 'pending':
        statusIcon = '⏭️';
        statusColor = '#ffc107';
        break;
    }

    const duration = step.result.duration ? ` (${(step.result.duration / 1000000).toFixed(0)}ms)` : '';

    return `
      <div style="margin: 8px 0; padding: 8px 12px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: flex-start;">
        <span style="margin-right: 10px; color: ${statusColor};">${statusIcon}</span>
        <div style="flex: 1;">
          <span style="font-weight: 600; color: #667eea;">${this.escapeHtml(step.keyword)}</span>
          ${this.escapeHtml(step.name)}
          <span style="color: #999; font-size: 0.9em;">${duration}</span>
          ${step.result.error_message ? `
            <pre style="margin-top: 10px; background: #fee; padding: 10px; border-radius: 4px; color: #dc3545; font-size: 0.85em;">
${this.escapeHtml(step.result.error_message)}
            </pre>
          ` : ''}
        </div>
      </div>
    `;
  }
}