import * as fs from 'fs';
import * as path from 'path';

export interface RunInfo {
  branch: string;
  runId: string;
  commitSha: string;
  timestamp: Date;
  reportPath: string;
}

export class ReportIndexGenerator {
  private wikiPath: string;
  private maxRuns: number;

  constructor(wikiPath: string, maxRuns = 20) {
    this.wikiPath = wikiPath;
    this.maxRuns = maxRuns;
  }

  async generateIndex(latestRun?: RunInfo): Promise<void> {
    const runs = await this.collectRuns();
    const content = this.createIndexContent(runs, latestRun);

    const indexPath = path.join(this.wikiPath, 'Home.md');
    await fs.promises.writeFile(indexPath, content);
  }

  private async collectRuns(): Promise<RunInfo[]> {
    const reportsPath = path.join(this.wikiPath, 'reports');
    const runs: RunInfo[] = [];

    try {
      const branches = await fs.promises.readdir(reportsPath);

      for (const branch of branches) {
        const branchPath = path.join(reportsPath, branch);
        const stat = await fs.promises.stat(branchPath);

        if (stat.isDirectory()) {
          const runDirs = await fs.promises.readdir(branchPath);

          for (const runId of runDirs) {
            const runPath = path.join(branchPath, runId);
            const runStat = await fs.promises.stat(runPath);

            if (runStat.isDirectory()) {
              runs.push({
                branch,
                runId,
                commitSha: '',
                timestamp: runStat.mtime,
                reportPath: `reports/${branch}/${runId}/index.html`
              });
            }
          }
        }
      }
    } catch (error) {
      // Reports directory might not exist yet
      console.warn('Could not read reports directory:', error);
    }

    // Sort by timestamp descending (newest first)
    runs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return runs.slice(0, this.maxRuns * 3); // Get more than needed, will filter per branch
  }

  private createIndexContent(runs: RunInfo[], latestRun?: RunInfo): string {
    let content = '# Test Reports\\n\\n';

    if (latestRun) {
      content += `## Letzter Lauf (${latestRun.runId})\\n\\n`;
      content += `- **Branch:** ${latestRun.branch}\\n`;
      content += `- **Run:** [${latestRun.runId}](${latestRun.reportPath})\\n`;
      content += `- **Commit:** ${latestRun.commitSha}\\n`;
      content += `- **Zeit:** ${latestRun.timestamp.toISOString()} (UTC)\\n\\n`;
    }

    content += '### Historie\\n\\n';

    // Group runs by branch
    const runsByBranch = new Map<string, RunInfo[]>();
    for (const run of runs) {
      if (!runsByBranch.has(run.branch)) {
        runsByBranch.set(run.branch, []);
      }
      runsByBranch.get(run.branch)!.push(run);
    }

    // Add runs for each branch (limited to maxRuns per branch)
    for (const [branch, branchRuns] of runsByBranch) {
      content += `\\n#### ${branch}\\n`;
      const limitedRuns = branchRuns.slice(0, this.maxRuns);

      for (const run of limitedRuns) {
        content += `- ${run.runId} → [Report](${run.reportPath})\\n`;
      }
    }

    content += `\\n---\\n_Zuletzt aktualisiert: ${new Date().toISOString()}_\\n`;

    return content;
  }

  async generateHtmlIndex(runs: RunInfo[]): Promise<string> {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Reports Index</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007acc;
            padding-bottom: 10px;
        }
        .search-box {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .search-box input {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .branch-section {
            margin: 30px 0;
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .branch-title {
            color: #007acc;
            font-size: 1.3em;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e1e4e8;
        }
        .run-list {
            list-style: none;
            padding: 0;
        }
        .run-item {
            padding: 12px;
            margin: 8px 0;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid #007acc;
            transition: all 0.2s;
        }
        .run-item:hover {
            background: #e9ecef;
            transform: translateX(5px);
        }
        .run-link {
            color: #007acc;
            text-decoration: none;
            font-weight: 500;
        }
        .run-link:hover {
            text-decoration: underline;
        }
        .run-meta {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .latest-run {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .latest-run h2 {
            margin-top: 0;
        }
        .latest-run a {
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test Reports</h1>

        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Suche nach Branch oder Run ID..." />
        </div>

        ${runs.length > 0 && runs[0] ? `
        <div class="latest-run">
            <h2>Letzter Lauf</h2>
            <div>Branch: <strong>${runs[0].branch}</strong></div>
            <div>Run: <a href="${runs[0].reportPath}">${runs[0].runId}</a></div>
            <div>Zeit: ${runs[0].timestamp.toLocaleString('de-DE')}</div>
        </div>
        ` : ''}

        <div id="branchSections">
            ${this.groupRunsByBranchHtml(runs)}
        </div>
    </div>

    <script>
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const runItems = document.querySelectorAll('.run-item');

            runItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });

            // Hide empty branch sections
            document.querySelectorAll('.branch-section').forEach(section => {
                const visibleRuns = section.querySelectorAll('.run-item[style="display: block"], .run-item:not([style])');
                section.style.display = visibleRuns.length > 0 ? 'block' : 'none';
            });
        });
    </script>
</body>
</html>`;
  }

  private groupRunsByBranchHtml(runs: RunInfo[]): string {
    const runsByBranch = new Map<string, RunInfo[]>();

    for (const run of runs) {
      if (!runsByBranch.has(run.branch)) {
        runsByBranch.set(run.branch, []);
      }
      runsByBranch.get(run.branch)!.push(run);
    }

    let html = '';
    for (const [branch, branchRuns] of runsByBranch) {
      const limitedRuns = branchRuns.slice(0, this.maxRuns);

      html += `
        <div class="branch-section">
            <h3 class="branch-title">${branch}</h3>
            <ul class="run-list">`;

      for (const run of limitedRuns) {
        html += `
                <li class="run-item">
                    <a href="${run.reportPath}" class="run-link">${run.runId}</a>
                    <div class="run-meta">
                        ${run.timestamp.toLocaleString('de-DE')}
                    </div>
                </li>`;
      }

      html += `
            </ul>
        </div>`;
    }

    return html;
  }
}