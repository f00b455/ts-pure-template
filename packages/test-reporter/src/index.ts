export interface TestReport {
  runId: string;
  branch: string;
  commitSha: string;
  timestamp: string;
  reportPath: string;
  status: 'success' | 'failure' | 'pending';
}

export interface WikiIndex {
  lastRun: TestReport | null;
  recentRuns: TestReport[];
  branches: Record<string, TestReport[]>;
}

export interface WikiConfig {
  maxReportsPerBranch: number;
  basePath: string;
  timezone?: string;
}

const DEFAULT_CONFIG: WikiConfig = {
  maxReportsPerBranch: 20,
  basePath: 'reports',
  timezone: 'UTC'
};

/**
 * Pure function to generate Wiki index from test reports
 */
export function generateWikiIndex(reports: TestReport[], config: Partial<WikiConfig> = {}): WikiIndex {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Sort reports by timestamp descending
  const sortedReports = [...reports].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group by branch
  const branchGroups: Record<string, TestReport[]> = {};
  for (const report of sortedReports) {
    if (!branchGroups[report.branch]) {
      branchGroups[report.branch] = [];
    }
    branchGroups[report.branch].push(report);
  }

  // Apply retention policy per branch
  const prunedBranches: Record<string, TestReport[]> = {};
  for (const [branch, branchReports] of Object.entries(branchGroups)) {
    prunedBranches[branch] = branchReports.slice(0, finalConfig.maxReportsPerBranch);
  }

  return {
    lastRun: sortedReports[0] || null,
    recentRuns: sortedReports.slice(0, finalConfig.maxReportsPerBranch),
    branches: prunedBranches
  };
}

/**
 * Pure function to generate Markdown for Wiki home page
 */
export function generateWikiMarkdown(index: WikiIndex, config: Partial<WikiConfig> = {}): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const lines: string[] = [];

  lines.push('# Test Reports');
  lines.push('');

  if (index.lastRun) {
    lines.push(`## Latest Run (${index.lastRun.runId})`);
    lines.push('');
    lines.push(`- **Branch:** ${index.lastRun.branch}`);
    lines.push(`- **Run:** [${index.lastRun.runId}](${index.lastRun.reportPath})`);
    lines.push(`- **Commit:** ${index.lastRun.commitSha}`);
    lines.push(`- **Time:** ${formatTimestamp(index.lastRun.timestamp, finalConfig.timezone)}`);
    lines.push(`- **Status:** ${index.lastRun.status}`);
    lines.push('');
  } else {
    lines.push('## No Reports Available');
    lines.push('');
    lines.push('No test reports have been published yet.');
    lines.push('');
  }

  if (index.recentRuns.length > 0) {
    lines.push('### Recent Runs');
    lines.push('');
    for (const run of index.recentRuns) {
      lines.push(`- ${run.branch} / ${run.runId} → [Report](${run.reportPath})`);
    }
    lines.push('');
  }

  // Branch-specific sections
  for (const [branch, runs] of Object.entries(index.branches)) {
    if (runs.length > 0) {
      lines.push(`### Branch: ${branch}`);
      lines.push('');
      for (const run of runs) {
        const time = formatTimestamp(run.timestamp, finalConfig.timezone);
        lines.push(`- [${run.runId}](${run.reportPath}) - ${time} (${run.status})`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Pure function to format timestamp
 */
export function formatTimestamp(timestamp: string, timezone = 'UTC'): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short'
  };

  return date.toLocaleString('en-US', options);
}

/**
 * Pure function to determine reports to retain
 */
export function getReportsToRetain(
  reports: TestReport[],
  maxPerBranch: number
): { retain: TestReport[]; remove: TestReport[] } {
  // Sort by timestamp descending
  const sorted = [...reports].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group by branch
  const branches = new Map<string, TestReport[]>();
  for (const report of sorted) {
    if (!branches.has(report.branch)) {
      branches.set(report.branch, []);
    }
    branches.get(report.branch)!.push(report);
  }

  const retain: TestReport[] = [];
  const remove: TestReport[] = [];

  // Apply retention policy per branch
  for (const [, branchReports] of branches) {
    branchReports.forEach((report, index) => {
      if (index < maxPerBranch) {
        retain.push(report);
      } else {
        remove.push(report);
      }
    });
  }

  return { retain, remove };
}

/**
 * Pure function to parse report path
 */
export function parseReportPath(path: string): { branch: string; runId: string } | null {
  // Expected format: reports/{branch}/{runId}/
  const match = path.match(/reports\/([^/]+)\/([^/]+)\/?/);
  if (match) {
    return {
      branch: match[1],
      runId: match[2]
    };
  }
  return null;
}

/**
 * Pure function to build report path
 */
export function buildReportPath(branch: string, runId: string, basePath = 'reports'): string {
  return `${basePath}/${branch}/${runId}/index.html`;
}