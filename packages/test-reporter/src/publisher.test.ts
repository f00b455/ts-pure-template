import { describe, it, expect } from 'vitest';
import { generateCommitMessage } from './publisher';

describe('generateCommitMessage', () => {
  it('should generate proper commit message', () => {
    const message = generateCommitMessage({
      wikiPath: '/tmp/wiki',
      branch: 'main',
      runId: 'run-123',
      commitSha: 'abc123'
    });

    expect(message).toContain('main');
    expect(message).toContain('run-123');
    expect(message).toContain('abc123');
    expect(message).toContain('Update test reports');
  });

  it('should include all config values', () => {
    const message = generateCommitMessage({
      wikiPath: '/tmp/wiki',
      branch: 'feature/test',
      runId: 'run-456',
      commitSha: 'def456'
    });

    expect(message).toContain('Branch: feature/test');
    expect(message).toContain('Run ID: run-456');
    expect(message).toContain('Commit: def456');
  });
});