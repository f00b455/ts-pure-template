import { promises as fs } from 'fs';
import path from 'path';
import type { IndexEntry, ReportMetadata } from './types';

export class ReportIndexGenerator {
  private readonly wikiPath: string;
  private readonly maxEntriesPerBranch: number;

  constructor(wikiPath: string, maxEntriesPerBranch = 20) {
    this.wikiPath = wikiPath;
    this.maxEntriesPerBranch = maxEntriesPerBranch;
  }

  async generateIndex(): Promise<void> {
    const reportsPath = path.join(this.wikiPath, 'reports');
    const entries = await this.collectEntries(reportsPath);

    // Group entries by branch
    const entriesByBranch = this.groupByBranch(entries);

    // Generate HTML index
    const indexHtml = this.createIndexHtml(entriesByBranch);
    await fs.writeFile(path.join(this.wikiPath, 'index.html'), indexHtml);

    // Generate Markdown for Wiki Home
    const indexMarkdown = this.createIndexMarkdown(entriesByBranch);
    await fs.writeFile(path.join(this.wikiPath, 'Home.md'), indexMarkdown);
  }

  private async collectEntries(reportsPath: string): Promise<IndexEntry[]> {
    const entries: IndexEntry[] = [];

    try {
      const branches = await fs.readdir(reportsPath);

      for (const branch of branches) {
        const branchPath = path.join(reportsPath, branch);
        const stat = await fs.stat(branchPath);

        if (stat.isDirectory()) {
          const runs = await fs.readdir(branchPath);

          for (const runId of runs) {
            const runPath = path.join(branchPath, runId);
            const metadataPath = path.join(runPath, 'metadata.json');

            try {
              const metadataContent = await fs.readFile(metadataPath, 'utf-8');
              const metadata: ReportMetadata = JSON.parse(metadataContent);

              entries.push({
                branch: metadata.branch,
                runId: metadata.runId,
                commitSha: metadata.commitSha,
                timestamp: new Date(metadata.timestamp),
                path: `reports/${branch}/${runId}`,
                stats: metadata.stats,
              });
            } catch {
              // If metadata doesn't exist, create basic entry
              entries.push({
                branch,
                runId,
                commitSha: 'unknown',
                timestamp: new Date(),
                path: `reports/${branch}/${runId}`,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting entries:', error);
    }

    // Sort by timestamp descending
    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private groupByBranch(entries: IndexEntry[]): Map<string, IndexEntry[]> {
    const grouped = new Map<string, IndexEntry[]>();

    for (const entry of entries) {
      const branchEntries = grouped.get(entry.branch) || [];
      if (branchEntries.length < this.maxEntriesPerBranch) {
        branchEntries.push(entry);
        grouped.set(entry.branch, branchEntries);
      }
    }

    return grouped;
  }

  private createIndexHtml(entriesByBranch: Map<string, IndexEntry[]>): string {
    const latestEntry = this.getLatestEntry(entriesByBranch);
    const branchSections = this.createBranchSections(entriesByBranch);
    const stats = this.calculateGlobalStats(entriesByBranch);

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Reports Index</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
    .search-box { margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 8px; }
    .search-box input { width: 100%; padding: 10px; border: none; border-radius: 5px; font-size: 16px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .branch-section { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .branch-header { font-size: 1.5em; margin-bottom: 15px; color: #333; }
    .run-list { list-style: none; padding: 0; }
    .run-item { padding: 15px; border-bottom: 1px solid #eee; display: grid; grid-template-columns: 1fr auto; align-items: center; }
    .run-item:hover { background: #f8f9fa; }
    .run-info { display: flex; flex-direction: column; gap: 5px; }
    .run-id { font-weight: 600; color: #667eea; text-decoration: none; }
    .run-meta { font-size: 0.9em; color: #666; }
    .run-stats { display: flex; gap: 15px; }
    .stat-badge { padding: 5px 10px; border-radius: 20px; font-size: 0.85em; }
    .passed { background: #d4edda; color: #155724; }
    .failed { background: #f8d7da; color: #721c24; }
    .trend-indicator { font-size: 1.2em; margin-left: 5px; }
    @media (max-width: 768px) {
      .run-item { grid-template-columns: 1fr; gap: 10px; }
      .stats-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>📊 Test Reports Dashboard</h1>
      ${latestEntry ? `
      <div style="margin-top: 20px;">
        <h2>Letzter Lauf: <a href="${latestEntry.path}/index.html" style="color: white;">${latestEntry.runId}</a></h2>
        <div>Branch: ${latestEntry.branch} | Commit: ${latestEntry.commitSha.substring(0, 7)} | Zeit: ${latestEntry.timestamp.toLocaleString('de-DE')}</div>
      </div>
      ` : '<p>Noch keine Reports vorhanden</p>'}

      <div class="search-box">
        <input type="search" id="search" placeholder="Suche nach Commit SHA, Branch oder Run ID..." onkeyup="filterReports()">
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div style="font-size: 2em; font-weight: bold;">${stats.totalRuns}</div>
        <div style="color: #666;">Total Runs</div>
      </div>
      <div class="stat-card">
        <div style="font-size: 2em; font-weight: bold;">${stats.branches}</div>
        <div style="color: #666;">Active Branches</div>
      </div>
      <div class="stat-card">
        <div style="font-size: 2em; font-weight: bold;">${stats.successRate.toFixed(1)}%</div>
        <div style="color: #666;">Success Rate ${this.getTrendIndicator(stats.trend)}</div>
      </div>
      <div class="stat-card">
        <div style="font-size: 2em; font-weight: bold;">${stats.avgDuration}s</div>
        <div style="color: #666;">Avg Duration</div>
      </div>
    </div>

    ${branchSections}
  </div>

  <script>
    function filterReports() {
      const searchTerm = document.getElementById('search').value.toLowerCase();
      const runItems = document.querySelectorAll('.run-item');

      runItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
  }

  private createIndexMarkdown(entriesByBranch: Map<string, IndexEntry[]>): string {
    const latestEntry = this.getLatestEntry(entriesByBranch);
    let markdown = '# Test Reports\\n\\n';

    if (latestEntry) {
      markdown += `## Letzter Lauf (${latestEntry.runId})\\n\\n`;
      markdown += `- **Branch:** ${latestEntry.branch}\\n`;
      markdown += `- **Run:** [${latestEntry.runId}](${latestEntry.path}/index.html)\\n`;
      markdown += `- **Commit:** ${latestEntry.commitSha}\\n`;
      markdown += `- **Zeit:** ${latestEntry.timestamp.toISOString()} (UTC)\\n\\n`;
    }

    markdown += '### Historie\\n\\n';

    for (const [branch, entries] of entriesByBranch) {
      markdown += `#### ${branch}\\n`;
      for (const entry of entries) {
        markdown += `- ${entry.runId} → [Report](${entry.path}/index.html)\\n`;
      }
      markdown += '\\n';
    }

    return markdown;
  }

  private createBranchSections(entriesByBranch: Map<string, IndexEntry[]>): string {
    let sections = '';

    for (const [branch, entries] of entriesByBranch) {
      sections += `
      <div class="branch-section">
        <h2 class="branch-header">🔧 ${branch}</h2>
        <ul class="run-list">`;

      for (const entry of entries) {
        sections += `
          <li class="run-item" data-branch="${branch}" data-sha="${entry.commitSha}" data-run="${entry.runId}">
            <div class="run-info">
              <a href="${entry.path}/index.html" class="run-id">Run ${entry.runId}</a>
              <span class="run-meta">
                SHA: ${entry.commitSha.substring(0, 7)} |
                ${entry.timestamp.toLocaleString('de-DE')}
              </span>
            </div>
            ${entry.stats ? `
            <div class="run-stats">
              <span class="stat-badge passed">${entry.stats.passed} passed</span>
              <span class="stat-badge failed">${entry.stats.failed} failed</span>
            </div>
            ` : ''}
          </li>`;
      }

      sections += `
        </ul>
      </div>`;
    }

    return sections;
  }

  private getLatestEntry(entriesByBranch: Map<string, IndexEntry[]>): IndexEntry | undefined {
    let latest: IndexEntry | undefined;

    for (const entries of entriesByBranch.values()) {
      if (entries.length > 0) {
        if (!latest || entries[0].timestamp > latest.timestamp) {
          latest = entries[0];
        }
      }
    }

    return latest;
  }

  private calculateGlobalStats(entriesByBranch: Map<string, IndexEntry[]>) {
    let totalRuns = 0;
    let successfulRuns = 0;
    let totalDuration = 0;
    let durationCount = 0;

    for (const entries of entriesByBranch.values()) {
      totalRuns += entries.length;

      for (const entry of entries) {
        if (entry.stats) {
          if (entry.stats.failed === 0) {
            successfulRuns++;
          }
          if (entry.stats.duration) {
            totalDuration += entry.stats.duration;
            durationCount++;
          }
        }
      }
    }

    return {
      totalRuns,
      branches: entriesByBranch.size,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
      avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
      trend: 'stable' as 'better' | 'worse' | 'stable',
    };
  }

  private getTrendIndicator(trend: 'better' | 'worse' | 'stable'): string {
    switch (trend) {
      case 'better':
        return '<span class="trend-indicator">📈</span>';
      case 'worse':
        return '<span class="trend-indicator">📉</span>';
      default:
        return '<span class="trend-indicator">➡️</span>';
    }
  }
}