import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportRetention } from '../src/retention';
import { promises as fs } from 'fs';
import path from 'path';

vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    rmdir: vi.fn(),
  },
}));

describe('ReportRetention', () => {
  const mockWikiPath = '/tmp/wiki';
  let retention: ReportRetention;

  beforeEach(() => {
    retention = new ReportRetention(mockWikiPath, 3); // Keep only 3 reports
    vi.clearAllMocks();
  });

  describe('cleanOldReports', () => {
    it('should keep only the specified number of recent reports', async () => {
      const mockRuns = ['run-1', 'run-2', 'run-3', 'run-4', 'run-5'];
      const now = Date.now();

      vi.mocked(fs.readdir).mockResolvedValue(mockRuns as any);

      // Mock stat to return different timestamps
      vi.mocked(fs.stat).mockImplementation(async (path) => {
        const runId = path.toString().split('/').pop();
        const index = mockRuns.indexOf(runId!);
        return {
          mtime: new Date(now - index * 3600000), // Each older by 1 hour
          isDirectory: () => true,
        } as any;
      });

      // Mock readdir for directory contents
      vi.mocked(fs.readdir).mockImplementation(async (path, options) => {
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return [
            { name: 'index.html', isDirectory: () => false },
            { name: 'metadata.json', isDirectory: () => false },
          ] as any;
        }
        return mockRuns as any;
      });

      const deletedCount = await retention.cleanOldReports('main');

      expect(deletedCount).toBe(2); // Should delete 2 oldest reports
      expect(fs.unlink).toHaveBeenCalledTimes(4); // 2 files per report
      expect(fs.rmdir).toHaveBeenCalledTimes(2); // 2 directories
    });

    it('should not delete anything if under retention limit', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['run-1', 'run-2'] as any);
      vi.mocked(fs.stat).mockResolvedValue({
        mtime: new Date(),
        isDirectory: () => true,
      } as any);

      const deletedCount = await retention.cleanOldReports('main');

      expect(deletedCount).toBe(0);
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(fs.rmdir).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Permission denied'));

      const deletedCount = await retention.cleanOldReports('main');

      expect(deletedCount).toBe(0);
    });
  });

  describe('cleanAllBranches', () => {
    it('should clean reports for all branches', async () => {
      vi.mocked(fs.readdir).mockResolvedValueOnce(['main', 'develop', 'feature-x'] as any);

      // Mock stat for branch directories
      vi.mocked(fs.stat).mockImplementation(async (path) => {
        if (path.toString().includes('reports')) {
          return { isDirectory: () => true } as any;
        }
        return {
          mtime: new Date(),
          isDirectory: () => true,
        } as any;
      });

      // Mock readdir for each branch to return empty
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      const results = await retention.cleanAllBranches();

      expect(results.size).toBe(3);
      expect(results.has('main')).toBe(true);
      expect(results.has('develop')).toBe(true);
      expect(results.has('feature-x')).toBe(true);
    });
  });

  describe('getReportCount', () => {
    it('should return correct count of reports', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['run-1', 'run-2', 'run-3'] as any);

      const count = await retention.getReportCount('main');

      expect(count).toBe(3);
    });

    it('should return 0 for non-existent branch', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('ENOENT'));

      const count = await retention.getReportCount('non-existent');

      expect(count).toBe(0);
    });
  });

  describe('shouldClean', () => {
    it('should return true when over retention limit', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['run-1', 'run-2', 'run-3', 'run-4'] as any);

      const shouldClean = await retention.shouldClean('main');

      expect(shouldClean).toBe(true);
    });

    it('should return false when under retention limit', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['run-1', 'run-2'] as any);

      const shouldClean = await retention.shouldClean('main');

      expect(shouldClean).toBe(false);
    });
  });
});