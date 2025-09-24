import { promises as fs } from 'fs';
import path from 'path';

export class ReportRetention {
  private readonly wikiPath: string;
  private readonly retentionCount: number;

  constructor(wikiPath: string, retentionCount = 20) {
    this.wikiPath = wikiPath;
    this.retentionCount = retentionCount;
  }

  async cleanOldReports(branch: string): Promise<number> {
    const branchPath = path.join(this.wikiPath, 'reports', branch);
    let deletedCount = 0;

    try {
      const runs = await fs.readdir(branchPath);

      // Get run directories with their stats
      const runInfos = await Promise.all(
        runs.map(async runId => {
          const runPath = path.join(branchPath, runId);
          const stat = await fs.stat(runPath);
          return { runId, path: runPath, mtime: stat.mtime };
        })
      );

      // Sort by modification time descending (newest first)
      runInfos.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Delete runs beyond retention count
      const toDelete = runInfos.slice(this.retentionCount);

      for (const runInfo of toDelete) {
        await this.deleteDirectory(runInfo.path);
        deletedCount++;
      }
    } catch (error) {
      console.error(`Error cleaning reports for branch ${branch}:`, error);
    }

    return deletedCount;
  }

  async cleanAllBranches(): Promise<Map<string, number>> {
    const reportsPath = path.join(this.wikiPath, 'reports');
    const results = new Map<string, number>();

    try {
      const branches = await fs.readdir(reportsPath);

      for (const branch of branches) {
        const branchPath = path.join(reportsPath, branch);
        const stat = await fs.stat(branchPath);

        if (stat.isDirectory()) {
          const deleted = await this.cleanOldReports(branch);
          results.set(branch, deleted);
        }
      }
    } catch (error) {
      console.error('Error cleaning all branches:', error);
    }

    return results;
  }

  private async deleteDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      // Recursively delete contents
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await this.deleteDirectory(fullPath);
        } else {
          await fs.unlink(fullPath);
        }
      }

      // Delete the directory itself
      await fs.rmdir(dirPath);
    } catch (error) {
      console.error(`Error deleting directory ${dirPath}:`, error);
    }
  }

  async getReportCount(branch: string): Promise<number> {
    const branchPath = path.join(this.wikiPath, 'reports', branch);

    try {
      const runs = await fs.readdir(branchPath);
      return runs.length;
    } catch {
      return 0;
    }
  }

  async shouldClean(branch: string): Promise<boolean> {
    const count = await this.getReportCount(branch);
    return count > this.retentionCount;
  }
}