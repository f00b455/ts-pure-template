export { WikiReportsPublisher } from './publisher';
export { ReportIndexGenerator } from './indexGenerator';
export { ReportRetention } from './retention';
export { JUnitConverter } from './converters/junit';
export { JestConverter } from './converters/jest';
export { VitestConverter } from './converters/vitest';
export { CucumberConverter } from './converters/cucumber';

export interface ReportConfig {
  branch: string;
  runId: string;
  commitSha: string;
  timestamp: Date;
  reportsPath: string;
  wikiPath: string;
  retentionLimit?: number;
}

export interface ReportConverter {
  convert(input: string | Buffer): string;
  getFormat(): string;
}