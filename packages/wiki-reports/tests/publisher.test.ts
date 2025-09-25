import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WikiReportsPublisher } from '../src/publisher';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    access: vi.fn()
  }
}));

describe('WikiReportsPublisher', () => {
  const mockConfig = {
    branch: 'main',
    runId: 'run-123',
    commitSha: 'abc123def',
    timestamp: new Date('2024-01-01T12:00:00Z'),
    reportsPath: '/tmp/reports',
    wikiPath: '/tmp/wiki'
  };

  let publisher: WikiReportsPublisher;

  beforeEach(() => {
    vi.clearAllMocks();
    publisher = new WikiReportsPublisher(mockConfig);
  });

  describe('publish', () => {
    it('should create directory structure', async () => {
      const reports = new Map([
        ['junit.xml', '<testsuites/>'],
        ['coverage.html', '<html>Coverage</html>']
      ]);

      await publisher.publish(reports);

      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        path.join('/tmp/wiki', 'reports', 'main', 'run-123'),
        { recursive: true }
      );
    });

    it('should write all report files', async () => {
      const reports = new Map([
        ['junit.xml', '<testsuites/>'],
        ['coverage.html', '<html>Coverage</html>']
      ]);

      vi.mocked(fs.promises.access).mockRejectedValue(new Error('File not found'));

      await publisher.publish(reports);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        path.join('/tmp/wiki', 'reports', 'main', 'run-123', 'junit.xml'),
        '<testsuites/>'
      );
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        path.join('/tmp/wiki', 'reports', 'main', 'run-123', 'coverage.html'),
        '<html>Coverage</html>'
      );
    });

    it('should create index.html if not present', async () => {
      const reports = new Map([
        ['test.html', '<html>Test</html>']
      ]);

      vi.mocked(fs.promises.access).mockRejectedValue(new Error('File not found'));

      await publisher.publish(reports);

      const indexPath = path.join('/tmp/wiki', 'reports', 'main', 'run-123', 'index.html');
      const writeFileCalls = vi.mocked(fs.promises.writeFile).mock.calls;
      const indexCall = writeFileCalls.find(call => call[0] === indexPath);

      expect(indexCall).toBeDefined();
      expect(indexCall![1]).toContain('Test Reports');
      expect(indexCall![1]).toContain('run-123');
      expect(indexCall![1]).toContain('main');
    });

    it('should handle Buffer content', async () => {
      const buffer = Buffer.from('Binary content');
      const reports = new Map<string, string | Buffer>([
        ['binary.dat', buffer]
      ]);

      await publisher.publish(reports);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        path.join('/tmp/wiki', 'reports', 'main', 'run-123', 'binary.dat'),
        buffer
      );
    });
  });

  describe('publishFallback', () => {
    it('should create fallback report when no artifacts available', async () => {
      await publisher.publishFallback();

      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        path.join('/tmp/wiki', 'reports', 'main', 'run-123'),
        { recursive: true }
      );

      const writeFileCalls = vi.mocked(fs.promises.writeFile).mock.calls;
      const fallbackCall = writeFileCalls.find(call =>
        (call[1] as string).includes('Keine Reports verfügbar')
      );

      expect(fallbackCall).toBeDefined();
      expect(fallbackCall![1]).toContain('2024-01-01T12:00:00.000Z');
      expect(fallbackCall![1]).toContain('main');
      expect(fallbackCall![1]).toContain('run-123');
      expect(fallbackCall![1]).toContain('abc123def');
    });

    it('should include proper styling in fallback report', async () => {
      await publisher.publishFallback();

      const writeFileCalls = vi.mocked(fs.promises.writeFile).mock.calls;
      const fallbackCall = writeFileCalls[0];

      expect(fallbackCall[1]).toContain('<!DOCTYPE html>');
      expect(fallbackCall[1]).toContain('<style>');
      expect(fallbackCall[1]).toContain('font-family');
    });
  });
});