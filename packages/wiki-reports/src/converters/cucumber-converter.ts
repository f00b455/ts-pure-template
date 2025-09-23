import * as fs from 'fs/promises';
import * as path from 'path';
import { ReportConverter, ConvertOptions, ConvertResult, TestSummary } from './report-converter';

interface CucumberFeature {
  name: string;
  description?: string;
  scenarios: CucumberScenario[];
}

interface CucumberScenario {
  name: string;
  steps: CucumberStep[];
  status: 'passed' | 'failed' | 'skipped';
  duration?: number;
}

interface CucumberStep {
  keyword: string;
  text: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration?: number;
  error?: string;
}

export class CucumberConverter extends ReportConverter {
  async canConvert(filePath: string): Promise<boolean> {
    if (!filePath.endsWith('.json')) return false;

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return Array.isArray(data) && data[0]?.elements !== undefined;
    } catch {
      return false;
    }
  }

  async convert(options: ConvertOptions): Promise<ConvertResult> {
    const jsonContent = await fs.readFile(options.inputPath, 'utf-8');
    const cucumberResults = JSON.parse(jsonContent);
    const features = this.parseCucumberResults(cucumberResults);
    const summary = this.calculateSummary(features);

    const htmlContent = this.generateHtml(features, summary, options.metadata);
    await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
    await fs.writeFile(options.outputPath, htmlContent);

    return {
      success: true,
      outputPath: options.outputPath,
      format: 'cucumber',
      summary
    };
  }

  async getSummary(filePath: string): Promise<TestSummary> {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    const features = this.parseCucumberResults(data);
    return this.calculateSummary(features);
  }

  private parseCucumberResults(data: any[]): CucumberFeature[] {
    const features: CucumberFeature[] = [];

    for (const feature of data) {
      const parsedFeature: CucumberFeature = {
        name: feature.name || 'Unnamed Feature',
        description: feature.description,
        scenarios: []
      };

      for (const element of feature.elements || []) {
        if (element.type !== 'scenario') continue;

        const scenario: CucumberScenario = {
          name: element.name || 'Unnamed Scenario',
          steps: [],
          status: 'passed',
          duration: 0
        };

        for (const step of element.steps || []) {
          const parsedStep: CucumberStep = {
            keyword: step.keyword || '',
            text: step.name || '',
            status: step.result?.status || 'pending',
            duration: step.result?.duration,
            error: step.result?.error_message
          };

          scenario.steps.push(parsedStep);
          scenario.duration = (scenario.duration || 0) + (parsedStep.duration || 0);

          if (parsedStep.status === 'failed') {
            scenario.status = 'failed';
          } else if (parsedStep.status === 'skipped' && scenario.status === 'passed') {
            scenario.status = 'skipped';
          }
        }

        parsedFeature.scenarios.push(scenario);
      }

      features.push(parsedFeature);
    }

    return features;
  }

  private calculateSummary(features: CucumberFeature[]): TestSummary {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;

    for (const feature of features) {
      for (const scenario of feature.scenarios) {
        total++;
        if (scenario.status === 'passed') passed++;
        else if (scenario.status === 'failed') failed++;
        else if (scenario.status === 'skipped') skipped++;
        duration += scenario.duration || 0;
      }
    }

    return {
      total,
      passed,
      failed,
      skipped,
      duration: duration / 1000000 // Convert from nanoseconds to milliseconds
    };
  }

  private generateHtml(features: CucumberFeature[], summary: TestSummary, metadata?: Record<string, any>): string {
    const headerContent = `
      <div class="header">
        <h1>Cucumber Test Report</h1>
        <div class="summary">
          <div class="summary-card">
            <div class="summary-value">${features.length}</div>
            <div class="summary-label">Features</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${summary.total}</div>
            <div class="summary-label">Scenarios</div>
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
    `;

    const featuresContent = features
      .map(feature => this.generateFeatureHtml(feature))
      .join('');

    const content = `
      ${headerContent}
      <div class="content">
        ${featuresContent}
      </div>
    `;

    return this.createHtmlTemplate('Cucumber Test Report', content);
  }

  private generateFeatureHtml(feature: CucumberFeature): string {
    const scenariosHtml = feature.scenarios
      .map(scenario => this.generateScenarioHtml(scenario))
      .join('');

    return `
      <div class="test-suite">
        <div class="suite-header">
          <div class="suite-name">Feature: ${feature.name}</div>
          <div class="suite-summary">
            ${feature.scenarios.length} scenarios
          </div>
        </div>
        <div class="suite-tests expanded">
          ${scenariosHtml}
        </div>
      </div>
    `;
  }

  private generateScenarioHtml(scenario: CucumberScenario): string {
    const stepsHtml = scenario.steps
      .map(step => `
        <div class="step ${step.status}">
          <span class="keyword">${step.keyword}</span>
          <span class="text">${step.text}</span>
          <span class="test-status ${step.status}">${step.status}</span>
          ${step.error ? `<div class="error-details">${step.error}</div>` : ''}
        </div>
      `)
      .join('');

    return `
      <div class="scenario">
        <div class="test-case ${scenario.status}">
          <div class="test-name">Scenario: ${scenario.name}</div>
          <div class="test-status ${scenario.status}">${scenario.status}</div>
        </div>
        <div class="steps">
          ${stepsHtml}
        </div>
      </div>
    `;
  }
}