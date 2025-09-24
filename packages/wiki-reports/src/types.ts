export type ReportFormat = 'junit' | 'jest' | 'vitest' | 'cucumber';

export interface PublishConfig {
  wikiPath: string;
  branch: string;
  runId: string;
  commitSha: string;
  timestamp: Date;
  retentionCount?: number;
}

export interface ConversionResult {
  format: ReportFormat;
  html: string;
  stats?: TestStats;
}

export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration?: number;
  coverage?: CoverageStats;
}

export interface CoverageStats {
  lines: number;
  branches: number;
  functions: number;
  statements: number;
}

export interface ReportMetadata {
  branch: string;
  runId: string;
  commitSha: string;
  timestamp: Date;
  formats: ReportFormat[];
  stats?: TestStats;
}

export interface IndexEntry {
  branch: string;
  runId: string;
  commitSha: string;
  timestamp: Date;
  path: string;
  stats?: TestStats;
}