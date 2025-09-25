export interface CucumberFeature {
  name: string;
  description?: string;
  elements: CucumberScenario[];
}

export interface CucumberScenario {
  name: string;
  type: 'scenario' | 'background';
  steps: CucumberStep[];
  tags?: CucumberTag[];
}

export interface CucumberStep {
  name: string;
  keyword: string;
  result: StepResult;
  duration?: number;
  error_message?: string;
}

export interface StepResult {
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration?: number;
  error_message?: string;
}

export interface CucumberTag {
  name: string;
}

export interface CucumberReport {
  features: CucumberFeature[];
  metadata?: Record<string, unknown>;
}

export interface FormatOptions {
  showDuration?: boolean;
  showTags?: boolean;
  showErrors?: boolean;
  summaryFirst?: boolean;
}

function formatDuration(nanoseconds?: number): string {
  if (!nanoseconds) return '';
  const ms = nanoseconds / 1_000_000;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(2)}s`;
  const m = s / 60;
  return `${m.toFixed(2)}m`;
}

function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    passed: '✅',
    failed: '❌',
    skipped: '⏭️',
    pending: '⏸️'
  };
  return emojis[status] || '❓';
}

function formatStepName(step: CucumberStep): string {
  const status = getStatusEmoji(step.result.status);
  const duration = step.duration
    ? ` (${formatDuration(step.duration)})`
    : '';
  return `${status} ${step.keyword} ${step.name}${duration}`;
}

function formatScenarioSteps(steps: CucumberStep[]): string[] {
  return steps.map(step => {
    const lines = [`  ${formatStepName(step)}`];
    if (step.error_message) {
      lines.push('  ```');
      lines.push(`  ${step.error_message}`);
      lines.push('  ```');
    }
    return lines.join('\n');
  });
}

function formatScenarioTags(tags: CucumberTag[]): string {
  if (!tags || tags.length === 0) return '';
  return tags.map(t => t.name).join(' ') + '\n';
}

function formatScenario(scenario: CucumberScenario): string[] {
  const lines: string[] = [];

  if (scenario.tags && scenario.tags.length > 0) {
    lines.push(formatScenarioTags(scenario.tags));
  }

  lines.push(`### ${scenario.name}`);
  lines.push('');
  lines.push(...formatScenarioSteps(scenario.steps));
  lines.push('');

  return lines;
}

function formatFeature(feature: CucumberFeature): string[] {
  const lines: string[] = [`## ${feature.name}`, ''];

  if (feature.description) {
    lines.push(feature.description, '');
  }

  for (const scenario of feature.elements) {
    if (scenario.type === 'scenario') {
      lines.push(...formatScenario(scenario));
    }
  }

  return lines;
}

function calculateStats(report: CucumberReport): {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  pending: number;
} {
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    pending: 0
  };

  for (const feature of report.features) {
    for (const scenario of feature.elements) {
      if (scenario.type === 'scenario') {
        stats.total++;
        const hasFailedStep = scenario.steps.some(
          s => s.result.status === 'failed'
        );
        if (hasFailedStep) {
          stats.failed++;
        } else if (scenario.steps.every(s => s.result.status === 'passed')) {
          stats.passed++;
        } else if (scenario.steps.some(s => s.result.status === 'skipped')) {
          stats.skipped++;
        } else {
          stats.pending++;
        }
      }
    }
  }

  return stats;
}

function formatSummary(stats: ReturnType<typeof calculateStats>): string[] {
  const successRate = stats.total > 0
    ? ((stats.passed / stats.total) * 100).toFixed(1)
    : '0';

  return [
    '## Summary',
    '',
    `- **Total Scenarios:** ${stats.total}`,
    `- **Passed:** ${stats.passed} ✅`,
    `- **Failed:** ${stats.failed} ❌`,
    `- **Skipped:** ${stats.skipped} ⏭️`,
    `- **Pending:** ${stats.pending} ⏸️`,
    `- **Success Rate:** ${successRate}%`,
    ''
  ];
}

export function formatCucumberReport(
  report: CucumberReport,
  options: FormatOptions = {}
): string {
  const lines: string[] = ['# Cucumber Test Report', ''];

  const stats = calculateStats(report);

  if (options.summaryFirst !== false) {
    lines.push(...formatSummary(stats));
  }

  for (const feature of report.features) {
    lines.push(...formatFeature(feature));
  }

  if (options.summaryFirst === false) {
    lines.push(...formatSummary(stats));
  }

  return lines.join('\n');
}

export function parseCucumberJson(jsonContent: string): CucumberReport {
  try {
    const data = JSON.parse(jsonContent);
    if (Array.isArray(data)) {
      return { features: data };
    }
    return data;
  } catch (error) {
    throw new Error(`Failed to parse Cucumber JSON: ${error}`);
  }
}