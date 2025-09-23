import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WikiReportsPublisher } from '../src/wiki-publisher';
import * as os from 'os';

describe('WikiReportsPublisher', () => {
  let tempDir: string;
  let publisher: WikiReportsPublisher;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wiki-test-'));
    publisher = new WikiReportsPublisher({
      wikiPath: tempDir
    });
  });

  afterEach(async () => {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('publish', () => {
    it('should publish reports successfully when reports exist', async () => {
      // Arrange
      const reportsPath = path.join(tempDir, 'reports-source');
      await fs.mkdir(reportsPath, { recursive: true });
      await fs.writeFile(
        path.join(reportsPath, 'test.html'),
        '<html><body>Test Report</body></html>'
      );

      const options = {
        branch: 'main',
        runId: '123',
        commitSha: 'abc123def456',
        reportsPath
      };

      // Act
      const result = await publisher.publish(options);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Reports published to');
      expect(result.timestamp).toBeDefined();

      // Verify files were copied
      const targetPath = path.join(tempDir, 'reports', 'main', '123');
      const copiedFile = path.join(targetPath, 'test.html');
      const fileExists = await fs.access(copiedFile).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Verify Home.md was created
      const homeFile = path.join(tempDir, 'Home.md');
      const homeExists = await fs.access(homeFile).then(() => true).catch(() => false);
      expect(homeExists).toBe(true);

      const homeContent = await fs.readFile(homeFile, 'utf-8');
      expect(homeContent).toContain('Test Reports');
      expect(homeContent).toContain('main');
      expect(homeContent).toContain('123');
      expect(homeContent).toContain('abc123def456');
    });

    it('should handle missing reports gracefully', async () => {
      // Arrange
      const options = {
        branch: 'main',
        runId: '456',
        commitSha: 'def789',
        reportsPath: path.join(tempDir, 'non-existent')
      };

      // Act
      const result = await publisher.publish(options);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Keine Reports verfügbar');

      // Verify no-reports HTML was created
      const noReportsPath = path.join(tempDir, 'reports', 'main', '456', 'index.html');
      const fileExists = await fs.access(noReportsPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(noReportsPath, 'utf-8');
      expect(content).toContain('No Test Reports Available');
      expect(content).toContain('main');
      expect(content).toContain('456');
    });

    it('should not fail the pipeline when failOnError is false', async () => {
      // Arrange
      const publisher = new WikiReportsPublisher({
        wikiPath: '/invalid/path/that/does/not/exist'
      });

      const options = {
        branch: 'main',
        runId: '789',
        commitSha: 'xyz123',
        reportsPath: tempDir,
        failOnError: false
      };

      // Act
      const result = await publisher.publish(options);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to publish reports');
    });

    it('should handle nested report directories', async () => {
      // Arrange
      const reportsPath = path.join(tempDir, 'reports-source');
      await fs.mkdir(path.join(reportsPath, 'coverage'), { recursive: true });
      await fs.writeFile(
        path.join(reportsPath, 'coverage', 'index.html'),
        '<html><body>Coverage Report</body></html>'
      );

      const options = {
        branch: 'feature-branch',
        runId: '999',
        commitSha: 'aaa111',
        reportsPath
      };

      // Act
      const result = await publisher.publish(options);

      // Assert
      expect(result.success).toBe(true);

      // Verify nested structure was preserved
      const targetFile = path.join(tempDir, 'reports', 'feature-branch', '999', 'coverage', 'index.html');
      const fileExists = await fs.access(targetFile).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should update wiki index with multiple branches', async () => {
      // Arrange - create reports for multiple branches
      const branches = ['main', 'feature-a', 'feature-b'];

      for (const branch of branches) {
        const reportsPath = path.join(tempDir, `reports-${branch}`);
        await fs.mkdir(reportsPath, { recursive: true });
        await fs.writeFile(
          path.join(reportsPath, 'test.html'),
          `<html><body>Report for ${branch}</body></html>`
        );

        await publisher.publish({
          branch,
          runId: `run-${branch}`,
          commitSha: `sha-${branch}`,
          reportsPath
        });
      }

      // Act - read the generated index
      const homeContent = await fs.readFile(path.join(tempDir, 'Home.md'), 'utf-8');

      // Assert
      expect(homeContent).toContain('feature-b'); // Most recent
      expect(homeContent).toContain('feature-a');
      expect(homeContent).toContain('main');
      expect(homeContent).toContain('Historie');
    });
  });
});