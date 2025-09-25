import * as fs from 'fs';
import * as path from 'path';

export class ReportRetention {
  private wikiPath: string;
  private retentionLimit: number;

  constructor(wikiPath: string, retentionLimit = 20) {
    this.wikiPath = wikiPath;
    this.retentionLimit = retentionLimit;
  }

  async applyRetention(branch: string): Promise<number> {
    const branchPath = path.join(this.wikiPath, 'reports', branch);
    let deletedCount = 0;

    try {
      // Check if branch directory exists
      await fs.promises.access(branchPath);

      // Get all run directories with their stats
      const runDirs = await fs.promises.readdir(branchPath);
      const runStats: Array<{ name: string; mtime: Date }> = [];

      for (const runDir of runDirs) {
        const runPath = path.join(branchPath, runDir);
        const stat = await fs.promises.stat(runPath);

        if (stat.isDirectory()) {
          runStats.push({
            name: runDir,
            mtime: stat.mtime
          });
        }
      }

      // Sort by modification time (newest first)
      runStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Delete runs beyond retention limit
      if (runStats.length > this.retentionLimit) {
        const toDelete = runStats.slice(this.retentionLimit);

        for (const run of toDelete) {
          const runPath = path.join(branchPath, run.name);
          await this.deleteDirectory(runPath);
          deletedCount++;
        }
      }
    } catch (error) {
      // Branch directory might not exist
      console.warn(`Could not apply retention for branch ${branch}:`, error);
    }

    return deletedCount;
  }

  async applyGlobalRetention(): Promise<Map<string, number>> {
    const reportsPath = path.join(this.wikiPath, 'reports');
    const deletionStats = new Map<string, number>();

    try {
      const branches = await fs.promises.readdir(reportsPath);

      for (const branch of branches) {
        const branchPath = path.join(reportsPath, branch);
        const stat = await fs.promises.stat(branchPath);

        if (stat.isDirectory()) {
          const deletedCount = await this.applyRetention(branch);
          if (deletedCount > 0) {
            deletionStats.set(branch, deletedCount);
          }
        }
      }
    } catch (error) {
      console.warn('Could not apply global retention:', error);
    }

    return deletionStats;
  }

  private async deleteDirectory(dirPath: string): Promise<void> {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await this.deleteDirectory(fullPath);
      } else {
        await fs.promises.unlink(fullPath);
      }
    }

    await fs.promises.rmdir(dirPath);
  }

  async getReportSize(branch?: string): Promise<number> {
    const targetPath = branch
      ? path.join(this.wikiPath, 'reports', branch)
      : path.join(this.wikiPath, 'reports');

    return this.getDirectorySize(targetPath);
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          totalSize += await this.getDirectorySize(fullPath);
        } else {
          const stat = await fs.promises.stat(fullPath);
          totalSize += stat.size;
        }
      }
    } catch (error) {
      console.warn(`Could not calculate directory size for ${dirPath}:`, error);
    }

    return totalSize;
  }

  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}