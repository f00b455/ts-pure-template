import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WikiReportsPublisher } from '../src/publisher';
import type { PublishConfig, ConversionResult } from '../src/types';
import { promises as fs } from 'fs';
import path from 'path';

vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  },
}));

describe('WikiReportsPublisher', () => {
  const mockWikiPath = '/tmp/wiki';
  let publisher: WikiReportsPublisher;

  beforeEach(() => {
    publisher = new WikiReportsPublisher(mockWikiPath);
    vi.clearAllMocks();
  });

  describe('publish', () => {
    const baseConfig: PublishConfig = {
      wikiPath: mockWikiPath,
      branch: 'main',
      runId: '123',
      commitSha: 'abc123',
      timestamp: new Date('2024-01-01T12:00:00Z'),
    };

    it('should create fallback page when no reports provided', async () => {
      const result = await publisher.publish(baseConfig, []);

      expect(result.success).toBe(true);
      expect(result.error).toBe('No artifacts available');
      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(mockWikiPath, 'reports', 'main', '123'),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        expect.stringContaining('Keine Reports verfügbar')
      );
    });

    it('should publish reports successfully', async () => {
      const reports: ConversionResult[] = [
        {
          format: 'jest',
          html: '<html>Jest Report</html>',
          stats: {
            total: 10,
            passed: 8,
            failed: 1,
            skipped: 1,
            duration: 5.5,
          },
        },
        {
          format: 'vitest',
          html: '<html>Vitest Report</html>',
          stats: {
            total: 20,
            passed: 20,
            failed: 0,
            skipped: 0,
            duration: 3.2,
          },
        },
      ];

      const result = await publisher.publish(baseConfig, reports);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(fs.mkdir).toHaveBeenCalled();

      // Check individual report files
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('jest.html'),
        '<html>Jest Report</html>'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('vitest.html'),
        '<html>Vitest Report</html>'
      );

      // Check index file
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        expect.stringContaining('Test Reports - 123')
      );

      // Check metadata file
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('metadata.json'),
        expect.stringContaining('"branch": "main"')
      );
    });

    it('should handle file system errors gracefully', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await publisher.publish(baseConfig, []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    it('should aggregate stats correctly', async () => {
      const reports: ConversionResult[] = [
        {
          format: 'jest',
          html: '<html>Jest</html>',
          stats: {
            total: 10,
            passed: 7,
            failed: 2,
            skipped: 1,
            duration: 5,
          },
        },
        {
          format: 'vitest',
          html: '<html>Vitest</html>',
          stats: {
            total: 20,
            passed: 18,
            failed: 1,
            skipped: 1,
            duration: 10,
          },
        },
      ];

      await publisher.publish(baseConfig, reports);

      // Check that index contains aggregated stats
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        expect.stringMatching(/Total Tests[^]*30/) // Total should be 30
      );
    });
  });

  describe('report path generation', () => {
    it('should generate correct path for branch and run', async () => {
      const config: PublishConfig = {
        wikiPath: mockWikiPath,
        branch: 'feature/test-branch',
        runId: '456',
        commitSha: 'def456',
        timestamp: new Date(),
      };

      await publisher.publish(config, []);

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(mockWikiPath, 'reports', 'feature/test-branch', '456'),
        { recursive: true }
      );
    });
  });
});