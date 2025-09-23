import * as fs from 'fs/promises';
import * as path from 'path';

export interface PublishOptions {
  branch: string;
  runId: string;
  commitSha: string;
  reportsPath: string;
  failOnError?: boolean;
}

export interface PublishResult {
  success: boolean;
  message: string;
  timestamp: string;
  path?: string;
}

export interface WikiPublisherConfig {
  wikiPath: string;
  gitUser?: string;
  gitEmail?: string;
}

export class WikiReportsPublisher {
  private readonly wikiPath: string;
  private readonly gitUser: string;
  private readonly gitEmail: string;

  constructor(config: WikiPublisherConfig) {
    this.wikiPath = config.wikiPath;
    this.gitUser = config.gitUser || 'ci-bot';
    this.gitEmail = config.gitEmail || 'bot@users.noreply.github.com';
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    const timestamp = new Date().toISOString();

    try {
      // Check if reports exist
      const reportsExist = await this.checkReportsExist(options.reportsPath);

      if (!reportsExist) {
        const message = 'Keine Reports verfügbar';
        await this.createNoReportsEntry(options, timestamp);

        return {
          success: true,
          message,
          timestamp
        };
      }

      // Create target directory
      const targetPath = path.join(
        this.wikiPath,
        'reports',
        options.branch,
        options.runId
      );

      await fs.mkdir(targetPath, { recursive: true });

      // Copy reports to wiki
      await this.copyReports(options.reportsPath, targetPath);

      // Update wiki index
      await this.updateWikiIndex(options, timestamp);

      return {
        success: true,
        message: `Reports published to ${targetPath}`,
        timestamp,
        path: targetPath
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (options.failOnError) {
        throw error;
      }

      return {
        success: false,
        message: `Failed to publish reports: ${errorMessage}`,
        timestamp
      };
    }
  }

  private async checkReportsExist(reportsPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(reportsPath);
      if (!stats.isDirectory()) {
        return false;
      }

      const files = await fs.readdir(reportsPath);
      return files.length > 0;
    } catch {
      return false;
    }
  }

  private async copyReports(sourcePath: string, targetPath: string): Promise<void> {
    const files = await fs.readdir(sourcePath);

    for (const file of files) {
      const sourceFile = path.join(sourcePath, file);
      const targetFile = path.join(targetPath, file);

      const stats = await fs.stat(sourceFile);

      if (stats.isDirectory()) {
        await fs.mkdir(targetFile, { recursive: true });
        await this.copyReports(sourceFile, targetFile);
      } else {
        await fs.copyFile(sourceFile, targetFile);
      }
    }
  }

  private async createNoReportsEntry(options: PublishOptions, timestamp: string): Promise<void> {
    const targetPath = path.join(
      this.wikiPath,
      'reports',
      options.branch,
      options.runId
    );

    await fs.mkdir(targetPath, { recursive: true });

    const noReportsHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>No Reports Available</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .info {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .metadata {
            color: #666;
            font-size: 14px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>No Test Reports Available</h1>
        <div class="info">
            <p>No test reports were generated for this build.</p>
            <p>This could mean:</p>
            <ul>
                <li>Tests did not run</li>
                <li>Test artifacts were not generated</li>
                <li>An error occurred during test execution</li>
            </ul>
        </div>
        <div class="metadata">
            <p><strong>Branch:</strong> ${options.branch}</p>
            <p><strong>Run ID:</strong> ${options.runId}</p>
            <p><strong>Commit:</strong> ${options.commitSha}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile(
      path.join(targetPath, 'index.html'),
      noReportsHtml
    );
  }

  private async updateWikiIndex(options: PublishOptions, timestamp: string): Promise<void> {
    const homePath = path.join(this.wikiPath, 'Home.md');

    // Create latest run section
    const latestSection = `## Letzter Lauf (${options.runId})

- **Branch:** ${options.branch}
- **Run:** [${options.runId}](reports/${options.branch}/${options.runId}/index.html)
- **Commit:** ${options.commitSha}
- **Zeit:** ${timestamp}

`;

    // Get existing history
    const history = await this.getReportHistory();

    // Build complete home page
    const homeContent = `# Test Reports

${latestSection}

### Historie

${history}
`;

    await fs.writeFile(homePath, homeContent);
  }

  private async getReportHistory(): Promise<string> {
    const reportsPath = path.join(this.wikiPath, 'reports');
    const history: string[] = [];

    try {
      const branches = await fs.readdir(reportsPath);

      for (const branch of branches) {
        const branchPath = path.join(reportsPath, branch);
        const stats = await fs.stat(branchPath);

        if (!stats.isDirectory()) continue;

        const runs = await fs.readdir(branchPath);
        const sortedRuns = runs.sort().reverse().slice(0, 5);

        for (const run of sortedRuns) {
          history.push(
            `- ${branch} / ${run} → [Report](reports/${branch}/${run}/index.html)`
          );
        }
      }
    } catch {
      // Reports directory might not exist yet
    }

    return history.join('\n') || 'No previous reports available.';
  }
}