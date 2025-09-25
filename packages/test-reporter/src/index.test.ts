import { describe, it, expect } from 'vitest';
import {
  generateWikiIndex,
  generateWikiMarkdown,
  formatTimestamp,
  getReportsToRetain,
  parseReportPath,
  buildReportPath,
  type TestReport
} from './index';

describe('Test Reporter Module', () => {
  const mockReports: TestReport[] = [
    {
      runId: 'run-1',
      branch: 'main',
      commitSha: 'abc123',
      timestamp: '2024-01-01T10:00:00Z',
      reportPath: 'reports/main/run-1/index.html',
      status: 'success'
    },
    {
      runId: 'run-2',
      branch: 'main',
      commitSha: 'def456',
      timestamp: '2024-01-02T10:00:00Z',
      reportPath: 'reports/main/run-2/index.html',
      status: 'success'
    },
    {
      runId: 'run-3',
      branch: 'feature-x',
      commitSha: 'ghi789',
      timestamp: '2024-01-03T10:00:00Z',
      reportPath: 'reports/feature-x/run-3/index.html',
      status: 'failure'
    }
  ];

  describe('generateWikiIndex', () => {
    it('should generate index with last run and grouped branches', () => {
      const index = generateWikiIndex(mockReports);

      expect(index.lastRun).toEqual(mockReports[2]); // Most recent by timestamp
      expect(index.recentRuns).toHaveLength(3);
      expect(index.branches).toHaveProperty('main');
      expect(index.branches).toHaveProperty('feature-x');
      expect(index.branches.main).toHaveLength(2);
      expect(index.branches['feature-x']).toHaveLength(1);
    });

    it('should respect max reports per branch config', () => {
      const manyReports: TestReport[] = [];
      for (let i = 0; i < 30; i++) {
        manyReports.push({
          runId: `run-${i}`,
          branch: 'main',
          commitSha: `sha-${i}`,
          timestamp: new Date(2024, 0, i + 1).toISOString(),
          reportPath: `reports/main/run-${i}/index.html`,
          status: 'success'
        });
      }

      const index = generateWikiIndex(manyReports, { maxReportsPerBranch: 10 });
      expect(index.branches.main).toHaveLength(10);
      expect(index.recentRuns).toHaveLength(10);
    });

    it('should handle empty reports', () => {
      const index = generateWikiIndex([]);
      expect(index.lastRun).toBeNull();
      expect(index.recentRuns).toHaveLength(0);
      expect(Object.keys(index.branches)).toHaveLength(0);
    });
  });

  describe('generateWikiMarkdown', () => {
    it('should generate markdown with latest run and history', () => {
      const index = generateWikiIndex(mockReports);
      const markdown = generateWikiMarkdown(index);

      expect(markdown).toContain('# Test Reports');
      expect(markdown).toContain('## Latest Run (run-3)');
      expect(markdown).toContain('Branch: feature-x');
      expect(markdown).toContain('### Recent Runs');
      expect(markdown).toContain('### Branch: main');
      expect(markdown).toContain('### Branch: feature-x');
    });

    it('should handle no reports case', () => {
      const index = generateWikiIndex([]);
      const markdown = generateWikiMarkdown(index);

      expect(markdown).toContain('## No Reports Available');
      expect(markdown).toContain('No test reports have been published yet');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp in UTC', () => {
      const formatted = formatTimestamp('2024-01-01T10:30:45Z', 'UTC');
      expect(formatted).toContain('01/01/2024');
      expect(formatted).toContain('10:30:45');
      expect(formatted).toContain('UTC');
    });

    it('should format timestamp in different timezone', () => {
      const formatted = formatTimestamp('2024-01-01T10:30:45Z', 'America/New_York');
      expect(formatted).toContain('01/01/2024');
      expect(formatted).toContain('05:30:45'); // UTC-5
    });
  });

  describe('getReportsToRetain', () => {
    it('should separate reports to retain and remove', () => {
      const manyReports: TestReport[] = [];
      for (let i = 0; i < 25; i++) {
        manyReports.push({
          runId: `run-${i}`,
          branch: 'main',
          commitSha: `sha-${i}`,
          timestamp: new Date(2024, 0, i + 1).toISOString(),
          reportPath: `reports/main/run-${i}/index.html`,
          status: 'success'
        });
      }

      const { retain, remove } = getReportsToRetain(manyReports, 20);
      expect(retain).toHaveLength(20);
      expect(remove).toHaveLength(5);

      // Most recent should be retained
      expect(retain[0].runId).toBe('run-24');
      // Oldest should be removed
      expect(remove).toContainEqual(expect.objectContaining({ runId: 'run-0' }));
    });

    it('should handle multiple branches', () => {
      const multipleReports: TestReport[] = [
        ...Array(15).fill(null).map((_, i) => ({
          runId: `main-${i}`,
          branch: 'main',
          commitSha: `sha-${i}`,
          timestamp: new Date(2024, 0, i + 1).toISOString(),
          reportPath: `reports/main/main-${i}/index.html`,
          status: 'success' as const
        })),
        ...Array(10).fill(null).map((_, i) => ({
          runId: `feature-${i}`,
          branch: 'feature',
          commitSha: `sha-${i}`,
          timestamp: new Date(2024, 0, i + 20).toISOString(),
          reportPath: `reports/feature/feature-${i}/index.html`,
          status: 'success' as const
        }))
      ];

      const { retain, remove } = getReportsToRetain(multipleReports, 10);

      const mainRetained = retain.filter(r => r.branch === 'main');
      const featureRetained = retain.filter(r => r.branch === 'feature');

      expect(mainRetained).toHaveLength(10);
      expect(featureRetained).toHaveLength(10);
      expect(remove).toHaveLength(5); // 15 main - 10 retained = 5 removed
    });
  });

  describe('parseReportPath', () => {
    it('should parse valid report path', () => {
      const result = parseReportPath('reports/main/run-123/index.html');
      expect(result).toEqual({
        branch: 'main',
        runId: 'run-123'
      });
    });

    it('should parse path without trailing slash', () => {
      const result = parseReportPath('reports/feature-x/run-456');
      expect(result).toEqual({
        branch: 'feature-x',
        runId: 'run-456'
      });
    });

    it('should return null for invalid path', () => {
      expect(parseReportPath('invalid/path')).toBeNull();
      expect(parseReportPath('reports/only-one-part')).toBeNull();
    });
  });

  describe('buildReportPath', () => {
    it('should build report path with default base', () => {
      const path = buildReportPath('main', 'run-123');
      expect(path).toBe('reports/main/run-123/index.html');
    });

    it('should build report path with custom base', () => {
      const path = buildReportPath('feature-x', 'run-456', 'wiki/reports');
      expect(path).toBe('wiki/reports/feature-x/run-456/index.html');
    });
  });
});