import * as fs from 'fs/promises';
import * as path from 'path';

export interface IndexOptions {
  wikiPath: string;
  maxRunsPerBranch?: number;
}

export interface BranchIndexOptions {
  wikiPath: string;
  branch: string;
}

export interface RunInfo {
  runId: string;
  timestamp: number;
  commitSha?: string;
  status?: string;
}

export interface IndexData {
  branches: Map<string, RunInfo[]>;
  lastUpdated: string;
  totalRuns: number;
  maxRunsPerBranch: number;
}

export class ReportIndexGenerator {
  async updateIndex(options: IndexOptions): Promise<void> {
    const maxRuns = options.maxRunsPerBranch || 20;
    const reportsPath = path.join(options.wikiPath, 'reports');

    const indexData = await this.collectIndexData(reportsPath, maxRuns);
    await this.writeIndexPage(options.wikiPath, indexData);
    await this.writeBranchPages(options.wikiPath, indexData);
  }

  async generateBranchIndex(options: BranchIndexOptions): Promise<string> {
    const branchPath = path.join(options.wikiPath, 'reports', options.branch);

    try {
      const runs = await this.getBranchRuns(branchPath);
      return this.createBranchIndexHtml(options.branch, runs);
    } catch {
      return this.createEmptyBranchIndex(options.branch);
    }
  }

  async getIndex(wikiPath: string): Promise<IndexData> {
    const reportsPath = path.join(wikiPath, 'reports');
    return this.collectIndexData(reportsPath, 20);
  }

  private async collectIndexData(reportsPath: string, maxRuns: number): Promise<IndexData> {
    const indexData: IndexData = {
      branches: new Map(),
      lastUpdated: new Date().toISOString(),
      totalRuns: 0,
      maxRunsPerBranch: maxRuns
    };

    try {
      const branches = await fs.readdir(reportsPath);

      for (const branch of branches) {
        const branchPath = path.join(reportsPath, branch);
        const stats = await fs.stat(branchPath);

        if (!stats.isDirectory()) continue;

        const runs = await this.getBranchRuns(branchPath);
        const sortedRuns = runs
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxRuns);

        indexData.branches.set(branch, sortedRuns);
        indexData.totalRuns += sortedRuns.length;
      }
    } catch {
      // Reports directory might not exist
    }

    return indexData;
  }

  private async getBranchRuns(branchPath: string): Promise<RunInfo[]> {
    const runs: RunInfo[] = [];
    const runDirs = await fs.readdir(branchPath);

    for (const runId of runDirs) {
      const runPath = path.join(branchPath, runId);
      const stats = await fs.stat(runPath);

      if (!stats.isDirectory()) continue;

      // Try to read metadata if available
      const metadata = await this.readRunMetadata(runPath);

      runs.push({
        runId,
        timestamp: stats.mtime.getTime(),
        commitSha: metadata?.commitSha,
        status: metadata?.status
      });
    }

    return runs;
  }

  private async readRunMetadata(runPath: string): Promise<any> {
    try {
      const metadataPath = path.join(runPath, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async writeIndexPage(wikiPath: string, indexData: IndexData): Promise<void> {
    const indexHtml = this.createIndexHtml(indexData);
    const indexPath = path.join(wikiPath, 'reports', 'index.html');

    await fs.mkdir(path.dirname(indexPath), { recursive: true });
    await fs.writeFile(indexPath, indexHtml);
  }

  private async writeBranchPages(wikiPath: string, indexData: IndexData): Promise<void> {
    for (const [branch, runs] of indexData.branches) {
      const branchHtml = this.createBranchIndexHtml(branch, runs);
      const branchIndexPath = path.join(wikiPath, 'reports', branch, 'index.html');

      await fs.mkdir(path.dirname(branchIndexPath), { recursive: true });
      await fs.writeFile(branchIndexPath, branchHtml);
    }
  }

  private createIndexHtml(indexData: IndexData): string {
    const branchSections = Array.from(indexData.branches.entries())
      .map(([branch, runs]) => this.createBranchSection(branch, runs))
      .join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Reports Index</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f5f5f5;
            margin: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }
        h2 {
            color: #555;
            margin-top: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .stats {
            display: flex;
            gap: 20px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .stat-card {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            flex: 1;
            min-width: 150px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        .branch-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .runs-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .runs-table th {
            text-align: left;
            padding: 10px;
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
        }
        .runs-table td {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
        }
        .runs-table tr:hover {
            background: #f8f9fa;
        }
        .runs-table a {
            color: #007bff;
            text-decoration: none;
            font-weight: 500;
        }
        .runs-table a:hover {
            text-decoration: underline;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
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
        @media (max-width: 768px) {
            .runs-table {
                font-size: 14px;
            }
            .runs-table th, .runs-table td {
                padding: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test Reports Index</h1>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${indexData.totalRuns}</div>
                <div class="stat-label">Total Runs</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${indexData.branches.size}</div>
                <div class="stat-label">Active Branches</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${new Date(indexData.lastUpdated).toLocaleDateString()}</div>
                <div class="stat-label">Last Updated</div>
            </div>
        </div>

        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Search by branch, run ID, or commit SHA..." />
        </div>

        ${branchSections}
    </div>

    <script>
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.runs-table tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    </script>
</body>
</html>`;
  }

  private createBranchSection(branch: string, runs: RunInfo[]): string {
    const rows = runs
      .map(run => `
        <tr>
            <td><a href="${branch}/${run.runId}/index.html">${run.runId}</a></td>
            <td>${run.commitSha || 'N/A'}</td>
            <td class="timestamp">${new Date(run.timestamp).toLocaleString()}</td>
            <td>${run.status || 'Complete'}</td>
        </tr>
      `)
      .join('');

    return `
      <div class="branch-section">
        <h2>Branch: ${branch}</h2>
        <table class="runs-table">
            <thead>
                <tr>
                    <th>Run ID</th>
                    <th>Commit</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
      </div>
    `;
  }

  private createBranchIndexHtml(branch: string, runs: RunInfo[]): string {
    const rows = runs
      .map(run => `
        <tr>
            <td><a href="${run.runId}/index.html">${run.runId}</a></td>
            <td>${run.commitSha || 'N/A'}</td>
            <td>${new Date(run.timestamp).toLocaleString()}</td>
            <td>${run.status || 'Complete'}</td>
        </tr>
      `)
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Reports - ${branch}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }
        .back-link {
            margin-bottom: 20px;
        }
        .back-link a {
            color: #007bff;
            text-decoration: none;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            text-align: left;
            padding: 10px;
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
        }
        tr:hover {
            background: #f8f9fa;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="back-link">
            <a href="../index.html">← Back to All Branches</a>
        </div>
        <h1>Test Reports - ${branch}</h1>
        <table>
            <thead>
                <tr>
                    <th>Run ID</th>
                    <th>Commit SHA</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
</body>
</html>`;
  }

  private createEmptyBranchIndex(branch: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Reports - ${branch}</title>
</head>
<body>
    <h1>No reports available for branch: ${branch}</h1>
</body>
</html>`;
  }
}