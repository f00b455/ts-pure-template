import * as fs from 'fs';
import * as path from 'path';
import { ReportConfig } from './index';

export class WikiReportsPublisher {
  private config: ReportConfig;

  constructor(config: ReportConfig) {
    this.config = config;
  }

  async publish(reports: Map<string, string | Buffer>): Promise<void> {
    const targetPath = path.join(
      this.config.wikiPath,
      'reports',
      this.config.branch,
      this.config.runId
    );

    // Create directory structure
    await fs.promises.mkdir(targetPath, { recursive: true });

    // Publish each report
    for (const [filename, content] of reports) {
      const filePath = path.join(targetPath, filename);
      await fs.promises.writeFile(filePath, content);
    }

    // Create index.html if not present
    const indexPath = path.join(targetPath, 'index.html');
    if (!await this.fileExists(indexPath)) {
      await this.createIndexHtml(indexPath);
    }
  }

  async publishFallback(): Promise<void> {
    const targetPath = path.join(
      this.config.wikiPath,
      'reports',
      this.config.branch,
      this.config.runId
    );

    await fs.promises.mkdir(targetPath, { recursive: true });

    const fallbackContent = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keine Reports verfügbar</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 40px auto;
            max-width: 800px;
            padding: 0 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
        }
        .info {
            background: #f0f8ff;
            border-left: 4px solid #007acc;
            padding: 15px;
            margin: 20px 0;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Keine Reports verfügbar</h1>
        <div class="info">
            <p>Für diesen Pipeline-Lauf wurden keine Testberichte erzeugt.</p>
            <p class="timestamp">Zeitstempel: ${this.config.timestamp.toISOString()}</p>
            <p>Branch: <strong>${this.config.branch}</strong></p>
            <p>Run ID: <strong>${this.config.runId}</strong></p>
            <p>Commit: <code>${this.config.commitSha}</code></p>
        </div>
    </div>
</body>
</html>`;

    const indexPath = path.join(targetPath, 'index.html');
    await fs.promises.writeFile(indexPath, fallbackContent);
  }

  private async createIndexHtml(indexPath: string): Promise<void> {
    const indexContent = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Reports - ${this.config.runId}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 40px auto;
            max-width: 1200px;
            padding: 0 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
        }
        .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .meta-item {
            background: #f0f8ff;
            padding: 10px 15px;
            border-radius: 4px;
            border-left: 3px solid #007acc;
        }
        .meta-label {
            color: #666;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .meta-value {
            color: #333;
            font-weight: 600;
            margin-top: 5px;
        }
        .reports {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .report-list {
            list-style: none;
            padding: 0;
        }
        .report-item {
            padding: 15px;
            border-bottom: 1px solid #e1e4e8;
            transition: background 0.2s;
        }
        .report-item:hover {
            background: #f6f8fa;
        }
        .report-item:last-child {
            border-bottom: none;
        }
        .report-link {
            color: #007acc;
            text-decoration: none;
            font-weight: 500;
        }
        .report-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Reports</h1>
        <div class="meta">
            <div class="meta-item">
                <div class="meta-label">Branch</div>
                <div class="meta-value">${this.config.branch}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Run ID</div>
                <div class="meta-value">${this.config.runId}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Commit</div>
                <div class="meta-value">${this.config.commitSha.substring(0, 8)}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Zeitstempel</div>
                <div class="meta-value">${this.config.timestamp.toLocaleString('de-DE')}</div>
            </div>
        </div>
    </div>
    <div class="reports">
        <h2>Verfügbare Reports</h2>
        <ul class="report-list" id="reportList">
            <!-- Reports will be listed here -->
        </ul>
    </div>
    <script>
        // List all HTML files in current directory
        const reports = [];
        // This would be populated by the actual files in the directory
        const reportList = document.getElementById('reportList');
        if (reports.length === 0) {
            reportList.innerHTML = '<li class="report-item">Laden Sie spezifische Report-Dateien hoch, um sie hier anzuzeigen.</li>';
        } else {
            reports.forEach(report => {
                const li = document.createElement('li');
                li.className = 'report-item';
                li.innerHTML = '<a href="' + report.file + '" class="report-link">' + report.name + '</a>';
                reportList.appendChild(li);
            });
        }
    </script>
</body>
</html>`;

    await fs.promises.writeFile(indexPath, indexContent);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}