import { promises as fs } from 'fs';
import path from 'path';
import type { PublishConfig, ConversionResult, ReportMetadata } from './types';

export class WikiReportsPublisher {
  private readonly wikiPath: string;

  constructor(wikiPath: string) {
    this.wikiPath = wikiPath;
  }

  async publish(
    config: PublishConfig,
    reports: ConversionResult[]
  ): Promise<{ success: boolean; path: string; error?: string }> {
    try {
      const reportPath = this.getReportPath(config);

      // Create directory structure
      await fs.mkdir(reportPath, { recursive: true });

      // If no reports, create a fallback page
      if (reports.length === 0) {
        const fallbackHtml = this.createFallbackPage(config);
        await fs.writeFile(path.join(reportPath, 'index.html'), fallbackHtml);
        return {
          success: true,
          path: reportPath,
          error: 'No artifacts available',
        };
      }

      // Write each report to its own file
      for (const report of reports) {
        const fileName = `${report.format}.html`;
        await fs.writeFile(path.join(reportPath, fileName), report.html);
      }

      // Create main index for this run
      const indexHtml = this.createRunIndex(config, reports);
      await fs.writeFile(path.join(reportPath, 'index.html'), indexHtml);

      // Save metadata for index generation
      const metadata: ReportMetadata = {
        branch: config.branch,
        runId: config.runId,
        commitSha: config.commitSha,
        timestamp: config.timestamp,
        formats: reports.map(r => r.format),
        stats: this.aggregateStats(reports),
      };
      await fs.writeFile(
        path.join(reportPath, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      return {
        success: true,
        path: reportPath,
      };
    } catch (error) {
      return {
        success: false,
        path: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getReportPath(config: PublishConfig): string {
    return path.join(this.wikiPath, 'reports', config.branch, config.runId);
  }

  private createFallbackPage(config: PublishConfig): string {
    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Reports - ${config.runId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    .header { background: #f0f0f0; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .info { margin: 10px 0; }
    .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Report - Run ${config.runId}</h1>
    <div class="info">Branch: ${config.branch}</div>
    <div class="info">Commit: ${config.commitSha}</div>
    <div class="info">Zeit: ${config.timestamp.toISOString()}</div>
  </div>
  <div class="warning">
    <h2>Keine Reports verfügbar</h2>
    <p>Es wurden keine Testberichte für diesen Lauf generiert.</p>
    <p>Zeitstempel: ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;
  }

  private createRunIndex(config: PublishConfig, reports: ConversionResult[]): string {
    const stats = this.aggregateStats(reports);
    const formatLinks = reports
      .map(r => `<li><a href="${r.format}.html">${r.format.toUpperCase()} Report</a></li>`)
      .join('\\n');

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Reports - ${config.runId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 2em; font-weight: bold; }
    .stat-label { color: #666; font-size: 0.9em; }
    .passed { color: #28a745; }
    .failed { color: #dc3545; }
    .skipped { color: #ffc107; }
    .formats { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .formats ul { list-style: none; padding: 0; }
    .formats li { padding: 10px; border-bottom: 1px solid #eee; }
    .formats a { color: #667eea; text-decoration: none; font-weight: 500; }
    .formats a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Report - Run ${config.runId}</h1>
    <div>Branch: ${config.branch}</div>
    <div>Commit: ${config.commitSha}</div>
    <div>Zeit: ${config.timestamp.toISOString()}</div>
  </div>

  ${stats ? `
  <div class="stats">
    <div class="stat-card">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-card">
      <div class="stat-value passed">${stats.passed}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value failed">${stats.failed}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value skipped">${stats.skipped}</div>
      <div class="stat-label">Skipped</div>
    </div>
  </div>
  ` : ''}

  <div class="formats">
    <h2>Verfügbare Reports</h2>
    <ul>
      ${formatLinks}
    </ul>
  </div>
</body>
</html>`;
  }

  private aggregateStats(reports: ConversionResult[]) {
    if (reports.length === 0 || !reports.some(r => r.stats)) {
      return undefined;
    }

    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    };

    for (const report of reports) {
      if (report.stats) {
        stats.total += report.stats.total;
        stats.passed += report.stats.passed;
        stats.failed += report.stats.failed;
        stats.skipped += report.stats.skipped;
        stats.duration += report.stats.duration || 0;
      }
    }

    return stats;
  }
}