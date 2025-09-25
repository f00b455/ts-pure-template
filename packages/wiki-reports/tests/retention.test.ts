import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportRetention } from '../src/retention';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    rmdir: vi.fn(),
    access: vi.fn()
  }
}));

describe('ReportRetention', () => {
  let retention: ReportRetention;

  beforeEach(() => {
    vi.clearAllMocks();
    retention = new ReportRetention('/tmp/wiki', 20);
  });

  describe('applyRetention', () => {
    it('should keep only the specified number of most recent runs', async () => {
      const mockRuns = [];
      const mockStats = [];

      // Create 25 mock runs
      for (let i = 1; i <= 25; i++) {
        mockRuns.push(`run-${i}`);
        mockStats.push({
          isDirectory: () => true,
          mtime: new Date(2024, 0, i) // Different dates for each run
        });
      }

      vi.mocked(fs.promises.access).mockResolvedValue(undefined);
      vi.mocked(fs.promises.readdir).mockResolvedValue(mockRuns as any);

      // Mock stat for each run
      vi.mocked(fs.promises.stat).mockImplementation((p) => {
        const runName = path.basename(p as string);
        const index = mockRuns.indexOf(runName);
        return Promise.resolve(mockStats[index] as any);
      });

      // Mock readdir for deletion
      vi.mocked(fs.promises.readdir).mockImplementation((p, options) => {
        if (options?.withFileTypes) {
          return Promise.resolve([]);
        }
        return Promise.resolve(mockRuns as any);
      });

      const deletedCount = await retention.applyRetention('main');

      // Should delete 5 oldest runs (25 - 20 = 5)
      expect(deletedCount).toBe(5);
      expect(fs.promises.rmdir).toHaveBeenCalledTimes(5);
    });

    it('should not delete anything if under retention limit', async () => {
      const mockRuns = ['run-1', 'run-2', 'run-3'];

      vi.mocked(fs.promises.access).mockResolvedValue(undefined);
      vi.mocked(fs.promises.readdir).mockResolvedValue(mockRuns as any);
      vi.mocked(fs.promises.stat).mockResolvedValue({
        isDirectory: () => true,
        mtime: new Date()
      } as any);

      const deletedCount = await retention.applyRetention('main');

      expect(deletedCount).toBe(0);
      expect(fs.promises.rmdir).not.toHaveBeenCalled();
    });

    it('should handle non-existent branch directory', async () => {
      vi.mocked(fs.promises.access).mockRejectedValue(new Error('ENOENT'));

      const deletedCount = await retention.applyRetention('non-existent');

      expect(deletedCount).toBe(0);
      expect(fs.promises.rmdir).not.toHaveBeenCalled();
    });

    it('should sort runs by modification time', async () => {
      const mockRuns = ['run-old', 'run-new', 'run-middle'];
      const now = Date.now();

      vi.mocked(fs.promises.access).mockResolvedValue(undefined);
      vi.mocked(fs.promises.readdir).mockResolvedValue(mockRuns as any);

      vi.mocked(fs.promises.stat).mockImplementation((p) => {
        const runName = path.basename(p as string);
        let mtime;
        if (runName === 'run-old') {
          mtime = new Date(now - 3600000); // 1 hour ago
        } else if (runName === 'run-middle') {
          mtime = new Date(now - 1800000); // 30 minutes ago
        } else {
          mtime = new Date(now); // now
        }
        return Promise.resolve({
          isDirectory: () => true,
          mtime
        } as any);
      });

      // Set retention limit to 2 to trigger deletion
      retention = new ReportRetention('/tmp/wiki', 2);

      // Mock readdir for directory deletion
      vi.mocked(fs.promises.readdir).mockImplementation((p, options) => {
        if (options?.withFileTypes) {
          return Promise.resolve([]);
        }
        return Promise.resolve(mockRuns as any);
      });

      const deletedCount = await retention.applyRetention('main');

      // Should delete the oldest run
      expect(deletedCount).toBe(1);
    });
  });

  describe('applyGlobalRetention', () => {
    it('should apply retention to all branches', async () => {
      const branches = ['main', 'develop', 'feature-x'];

      vi.mocked(fs.promises.readdir).mockResolvedValueOnce(branches as any);

      for (const branch of branches) {
        vi.mocked(fs.promises.stat).mockResolvedValueOnce({
          isDirectory: () => true
        } as any);
      }

      // Mock each branch having runs
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);
      vi.mocked(fs.promises.readdir).mockImplementation(() =>
        Promise.resolve(['run-1', 'run-2'] as any)
      );
      vi.mocked(fs.promises.stat).mockImplementation(() =>
        Promise.resolve({
          isDirectory: () => true,
          mtime: new Date()
        } as any)
      );

      const stats = await retention.applyGlobalRetention();

      expect(stats.size).toBe(0); // No deletions as each branch has only 2 runs
    });

    it('should handle missing reports directory', async () => {
      vi.mocked(fs.promises.readdir).mockRejectedValue(new Error('ENOENT'));

      const stats = await retention.applyGlobalRetention();

      expect(stats.size).toBe(0);
    });
  });

  describe('getReportSize', () => {
    it('should calculate total size of reports', async () => {
      vi.mocked(fs.promises.readdir).mockImplementation(() =>
        Promise.resolve([
          { name: 'file1.html', isDirectory: () => false },
          { name: 'file2.html', isDirectory: () => false },
          { name: 'subdir', isDirectory: () => true }
        ] as any)
      );

      vi.mocked(fs.promises.stat).mockImplementation((p) => {
        const name = path.basename(p as string);
        if (name === 'file1.html') {
          return Promise.resolve({ size: 1024 } as any);
        } else if (name === 'file2.html') {
          return Promise.resolve({ size: 2048 } as any);
        }
        return Promise.resolve({ size: 0 } as any);
      });

      const size = await retention.getReportSize();

      expect(size).toBeGreaterThan(0);
    });

    it('should handle branch-specific size calculation', async () => {
      vi.mocked(fs.promises.readdir).mockResolvedValue([
        { name: 'report.html', isDirectory: () => false }
      ] as any);

      vi.mocked(fs.promises.stat).mockResolvedValue({ size: 5000 } as any);

      const size = await retention.getReportSize('main');

      expect(size).toBe(5000);
    });
  });

  describe('formatSize', () => {
    it('should format bytes correctly', () => {
      expect(retention.formatSize(500)).toBe('500.00 B');
      expect(retention.formatSize(1024)).toBe('1.00 KB');
      expect(retention.formatSize(1048576)).toBe('1.00 MB');
      expect(retention.formatSize(1073741824)).toBe('1.00 GB');
    });

    it('should handle decimal values', () => {
      expect(retention.formatSize(1536)).toBe('1.50 KB');
      expect(retention.formatSize(2621440)).toBe('2.50 MB');
    });
  });
});