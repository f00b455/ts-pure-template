import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  collectReports,
  groupReportsByType,
  generateReportMetadata,
  type ReportFile
} from './collector';

vi.mock('fs/promises');

describe('groupReportsByType', () => {
  it('should group reports by type', () => {
    const reports: ReportFile[] = [
      { path: '/cucumber-report.json', type: 'cucumber-json' },
      { path: '/cucumber-report.html', type: 'cucumber-html' },
      { path: '/vitest.json', type: 'vitest' },
      { path: '/unknown.txt', type: 'unknown' }
    ];

    const grouped = groupReportsByType(reports);

    expect(grouped['cucumber-json']).toHaveLength(1);
    expect(grouped['cucumber-html']).toHaveLength(1);
    expect(grouped['vitest']).toHaveLength(1);
    expect(grouped['unknown']).toHaveLength(1);
    expect(grouped['playwright']).toHaveLength(0);
  });

  it('should handle empty array', () => {
    const grouped = groupReportsByType([]);

    expect(grouped['cucumber-json']).toHaveLength(0);
    expect(grouped['cucumber-html']).toHaveLength(0);
  });
});

describe('generateReportMetadata', () => {
  it('should extract package name from path', () => {
    const report: ReportFile = {
      path: '/root/packages/foo/cucumber-report.json',
      type: 'cucumber-json'
    };

    const metadata = generateReportMetadata(report);

    expect(metadata.packageName).toBe('foo');
    expect(metadata.fileName).toBe('cucumber-report.json');
    expect(metadata.directory).toBe('/root/packages/foo');
  });

  it('should handle app paths', () => {
    const report: ReportFile = {
      path: '/root/apps/web/test-results.json',
      type: 'vitest'
    };

    const metadata = generateReportMetadata(report);

    expect(metadata.packageName).toBe('web');
    expect(metadata.fileName).toBe('test-results.json');
  });

  it('should handle root level files', () => {
    const report: ReportFile = {
      path: '/root/report.html',
      type: 'unknown'
    };

    const metadata = generateReportMetadata(report);

    expect(metadata.packageName).toBe('root');
    expect(metadata.fileName).toBe('report.html');
  });
});