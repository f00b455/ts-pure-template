import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ReportRetention } from '../src/retention';

describe('ReportRetention', () => {
  let tempDir: string;
  let retention: ReportRetention;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'retention-test-'));
    retention = new ReportRetention({ maxRuns: 3 });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('cleanup', () => {
    it('should remove old runs exceeding maxRuns limit', async () => {
      // Arrange - create 5 runs for a branch
      const branchPath = path.join(tempDir, 'reports', 'main');
      await fs.mkdir(branchPath, { recursive: true });

      for (let i = 1; i <= 5; i++) {
        const runPath = path.join(branchPath, `run-${i}`);
        await fs.mkdir(runPath, { recursive: true });
        await fs.writeFile(path.join(runPath, 'index.html'), `Report ${i}`);
        // Add delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Act
      const removedCount = await retention.cleanup({
        wikiPath: tempDir,
        branch: 'main',
        maxRuns: 3
      });

      // Assert
      expect(removedCount).toBe(2); // Should remove 2 oldest runs

      const remainingRuns = await fs.readdir(branchPath);
      expect(remainingRuns.length).toBe(3);
      expect(remainingRuns).toContain('run-5'); // Most recent
      expect(remainingRuns).toContain('run-4');
      expect(remainingRuns).toContain('run-3');
      expect(remainingRuns).not.toContain('run-1'); // Oldest removed
      expect(remainingRuns).not.toContain('run-2'); // Second oldest removed
    });

    it('should clean all branches when no specific branch is provided', async () => {
      // Arrange - create runs for multiple branches
      const branches = ['main', 'feature-a', 'feature-b'];

      for (const branch of branches) {
        const branchPath = path.join(tempDir, 'reports', branch);
        await fs.mkdir(branchPath, { recursive: true });

        for (let i = 1; i <= 5; i++) {
          const runPath = path.join(branchPath, `run-${i}`);
          await fs.mkdir(runPath, { recursive: true });
          await fs.writeFile(path.join(runPath, 'index.html'), 'Report');
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }

      // Act
      const totalRemoved = await retention.cleanup({
        wikiPath: tempDir,
        maxRuns: 3
      });

      // Assert
      expect(totalRemoved).toBe(6); // 2 removed per branch × 3 branches

      for (const branch of branches) {
        const remainingRuns = await fs.readdir(path.join(tempDir, 'reports', branch));
        expect(remainingRuns.length).toBe(3);
      }
    });

    it('should handle empty branches gracefully', async () => {
      // Arrange
      const branchPath = path.join(tempDir, 'reports', 'empty-branch');
      await fs.mkdir(branchPath, { recursive: true });

      // Act
      const removedCount = await retention.cleanup({
        wikiPath: tempDir,
        branch: 'empty-branch',
        maxRuns: 3
      });

      // Assert
      expect(removedCount).toBe(0);
    });

    it('should handle non-existent wiki path gracefully', async () => {
      // Act
      const removedCount = await retention.cleanup({
        wikiPath: path.join(tempDir, 'non-existent'),
        maxRuns: 3
      });

      // Assert
      expect(removedCount).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Arrange
      const branches = [
        { name: 'main', runs: 5 },
        { name: 'feature-a', runs: 3 },
        { name: 'feature-b', runs: 2 }
      ];

      for (const branch of branches) {
        const branchPath = path.join(tempDir, 'reports', branch.name);
        await fs.mkdir(branchPath, { recursive: true });

        for (let i = 1; i <= branch.runs; i++) {
          const runPath = path.join(branchPath, `run-${i}`);
          await fs.mkdir(runPath, { recursive: true });
        }
      }

      // Act
      const stats = await retention.getStats(tempDir);

      // Assert
      expect(stats.branchCount).toBe(3);
      expect(stats.totalRuns).toBe(10); // 5 + 3 + 2
      expect(stats.maxRunsPerBranch).toBe(3);
    });

    it('should return empty stats for non-existent path', async () => {
      // Act
      const stats = await retention.getStats(path.join(tempDir, 'non-existent'));

      // Assert
      expect(stats.branchCount).toBe(0);
      expect(stats.totalRuns).toBe(0);
      expect(stats.maxRunsPerBranch).toBe(3);
    });
  });

  describe('shouldCleanup', () => {
    it('should return true when total runs exceed threshold', async () => {
      // Arrange
      const retention = new ReportRetention({ maxRuns: 2 });
      const reportsPath = path.join(tempDir, 'reports');

      // Create 3 branches with 3 runs each (9 total, threshold = 2 * 3 = 6)
      for (const branch of ['main', 'feature-a', 'feature-b']) {
        const branchPath = path.join(reportsPath, branch);
        await fs.mkdir(branchPath, { recursive: true });

        for (let i = 1; i <= 3; i++) {
          const runPath = path.join(branchPath, `run-${i}`);
          await fs.mkdir(runPath, { recursive: true });
        }
      }

      // Act
      const shouldClean = await retention.shouldCleanup(tempDir);

      // Assert
      expect(shouldClean).toBe(true);
    });

    it('should return false when total runs are within threshold', async () => {
      // Arrange
      const retention = new ReportRetention({ maxRuns: 5 });
      const reportsPath = path.join(tempDir, 'reports');

      // Create 2 branches with 2 runs each (4 total, threshold = 5 * 2 = 10)
      for (const branch of ['main', 'feature-a']) {
        const branchPath = path.join(reportsPath, branch);
        await fs.mkdir(branchPath, { recursive: true });

        for (let i = 1; i <= 2; i++) {
          const runPath = path.join(branchPath, `run-${i}`);
          await fs.mkdir(runPath, { recursive: true });
        }
      }

      // Act
      const shouldClean = await retention.shouldCleanup(tempDir);

      // Assert
      expect(shouldClean).toBe(false);
    });
  });

  describe('cleanup with maxAgeDays', () => {
    it('should remove runs older than maxAgeDays', async () => {
      // Arrange
      const retention = new ReportRetention({
        maxRuns: 10,
        maxAgeDays: 0.00001 // Very small value for testing (about 1 second)
      });

      const branchPath = path.join(tempDir, 'reports', 'main');
      await fs.mkdir(branchPath, { recursive: true });

      // Create old run
      const oldRunPath = path.join(branchPath, 'old-run');
      await fs.mkdir(oldRunPath, { recursive: true });
      await fs.writeFile(path.join(oldRunPath, 'index.html'), 'Old report');

      // Wait to ensure the run is "old"
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new run
      const newRunPath = path.join(branchPath, 'new-run');
      await fs.mkdir(newRunPath, { recursive: true });
      await fs.writeFile(path.join(newRunPath, 'index.html'), 'New report');

      // Act
      const removedCount = await retention.cleanup({
        wikiPath: tempDir,
        branch: 'main',
        maxRuns: 10
      });

      // Assert
      expect(removedCount).toBe(1); // Old run should be removed

      const remainingRuns = await fs.readdir(branchPath);
      expect(remainingRuns).toContain('new-run');
      expect(remainingRuns).not.toContain('old-run');
    });
  });
});