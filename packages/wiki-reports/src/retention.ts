import * as fs from 'fs/promises';
import * as path from 'path';

export interface RetentionConfig {
  maxRuns: number;
  maxAgeDays?: number;
}

export interface CleanupOptions {
  wikiPath: string;
  branch?: string;
  maxRuns: number;
}

export interface RetentionStats {
  totalRuns: number;
  branchCount: number;
  removedRuns: number;
  maxRunsPerBranch: number;
}

export class ReportRetention {
  private readonly config: RetentionConfig;

  constructor(config: RetentionConfig) {
    this.config = config;
  }

  async cleanup(options: CleanupOptions): Promise<number> {
    const reportsPath = path.join(options.wikiPath, 'reports');
    let totalRemoved = 0;

    try {
      if (options.branch) {
        // Clean specific branch
        totalRemoved = await this.cleanupBranch(
          path.join(reportsPath, options.branch),
          options.maxRuns
        );
      } else {
        // Clean all branches
        const branches = await fs.readdir(reportsPath);

        for (const branch of branches) {
          const branchPath = path.join(reportsPath, branch);
          const stats = await fs.stat(branchPath);

          if (stats.isDirectory()) {
            totalRemoved += await this.cleanupBranch(branchPath, options.maxRuns);
          }
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }

    return totalRemoved;
  }

  async getStats(wikiPath: string): Promise<RetentionStats> {
    const reportsPath = path.join(wikiPath, 'reports');
    const stats: RetentionStats = {
      totalRuns: 0,
      branchCount: 0,
      removedRuns: 0,
      maxRunsPerBranch: this.config.maxRuns
    };

    try {
      const branches = await fs.readdir(reportsPath);

      for (const branch of branches) {
        const branchPath = path.join(reportsPath, branch);
        const branchStats = await fs.stat(branchPath);

        if (branchStats.isDirectory()) {
          stats.branchCount++;
          const runs = await fs.readdir(branchPath);
          stats.totalRuns += runs.length;
        }
      }
    } catch {
      // Reports directory might not exist
    }

    return stats;
  }

  private async cleanupBranch(branchPath: string, maxRuns: number): Promise<number> {
    const runs = await this.getRunsWithTimestamps(branchPath);

    // Sort by timestamp (newest first)
    runs.sort((a, b) => b.timestamp - a.timestamp);

    // Keep only the latest maxRuns
    const runsToRemove = runs.slice(maxRuns);
    let removedCount = 0;

    for (const run of runsToRemove) {
      try {
        await fs.rm(run.path, { recursive: true, force: true });
        removedCount++;
      } catch (error) {
        console.error(`Failed to remove ${run.path}:`, error);
      }
    }

    // Also remove runs older than maxAgeDays if configured
    if (this.config.maxAgeDays) {
      const cutoffTime = Date.now() - (this.config.maxAgeDays * 24 * 60 * 60 * 1000);

      for (const run of runs.slice(0, maxRuns)) {
        if (run.timestamp < cutoffTime) {
          try {
            await fs.rm(run.path, { recursive: true, force: true });
            removedCount++;
          } catch (error) {
            console.error(`Failed to remove old run ${run.path}:`, error);
          }
        }
      }
    }

    return removedCount;
  }

  private async getRunsWithTimestamps(branchPath: string): Promise<Array<{ path: string; timestamp: number }>> {
    const runs: Array<{ path: string; timestamp: number }> = [];
    const runDirs = await fs.readdir(branchPath);

    for (const runDir of runDirs) {
      const runPath = path.join(branchPath, runDir);
      const stats = await fs.stat(runPath);

      if (stats.isDirectory()) {
        runs.push({
          path: runPath,
          timestamp: stats.mtime.getTime()
        });
      }
    }

    return runs;
  }

  async shouldCleanup(wikiPath: string): Promise<boolean> {
    const stats = await this.getStats(wikiPath);
    return stats.totalRuns > stats.maxRunsPerBranch * stats.branchCount;
  }
}