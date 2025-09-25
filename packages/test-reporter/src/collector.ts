import * as fs from 'fs/promises';
import * as path from 'path';

export interface ReportFile {
  path: string;
  type: 'cucumber-json' | 'cucumber-html' | 'vitest' | 'playwright' | 'unknown';
  content?: string;
}

export interface CollectorOptions {
  packagePaths?: string[];
  reportPatterns?: string[];
  skipMissing?: boolean;
}

const DEFAULT_PATTERNS = [
  '**/cucumber-report.json',
  '**/cucumber-report.html',
  '**/test-results/*.json',
  '**/coverage/lcov-report/index.html',
  '**/playwright-report/index.html'
];

function detectReportType(filePath: string): ReportFile['type'] {
  const name = path.basename(filePath).toLowerCase();

  if (name.includes('cucumber') && name.endsWith('.json')) {
    return 'cucumber-json';
  }
  if (name.includes('cucumber') && name.endsWith('.html')) {
    return 'cucumber-html';
  }
  if (name.includes('vitest') || name.includes('coverage')) {
    return 'vitest';
  }
  if (name.includes('playwright')) {
    return 'playwright';
  }

  return 'unknown';
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findReportsInPackage(
  packagePath: string,
  patterns: string[]
): Promise<ReportFile[]> {
  const reports: ReportFile[] = [];

  for (const pattern of patterns) {
    const cleanPattern = pattern.replace(/^\*\*\//, '');
    const reportPath = path.join(packagePath, cleanPattern);

    if (await fileExists(reportPath)) {
      reports.push({
        path: reportPath,
        type: detectReportType(reportPath)
      });
    }
  }

  return reports;
}

async function loadReportContent(report: ReportFile): Promise<ReportFile> {
  try {
    const content = await fs.readFile(report.path, 'utf-8');
    return { ...report, content };
  } catch (error) {
    console.error(`Failed to read ${report.path}: ${error}`);
    return report;
  }
}

export async function collectReports(
  rootPath: string,
  options: CollectorOptions = {}
): Promise<ReportFile[]> {
  const patterns = options.reportPatterns || DEFAULT_PATTERNS;
  const allReports: ReportFile[] = [];

  if (options.packagePaths && options.packagePaths.length > 0) {
    for (const pkgPath of options.packagePaths) {
      const fullPath = path.join(rootPath, pkgPath);
      const reports = await findReportsInPackage(fullPath, patterns);
      allReports.push(...reports);
    }
  } else {
    const packagesDir = path.join(rootPath, 'packages');
    const appsDir = path.join(rootPath, 'apps');

    try {
      const packages = await fs.readdir(packagesDir);
      for (const pkg of packages) {
        const pkgPath = path.join(packagesDir, pkg);
        const stats = await fs.stat(pkgPath);
        if (stats.isDirectory()) {
          const reports = await findReportsInPackage(pkgPath, patterns);
          allReports.push(...reports);
        }
      }
    } catch (error) {
      if (!options.skipMissing) {
        console.error(`Failed to read packages directory: ${error}`);
      }
    }

    try {
      const apps = await fs.readdir(appsDir);
      for (const app of apps) {
        const appPath = path.join(appsDir, app);
        const stats = await fs.stat(appPath);
        if (stats.isDirectory()) {
          const reports = await findReportsInPackage(appPath, patterns);
          allReports.push(...reports);
        }
      }
    } catch (error) {
      if (!options.skipMissing) {
        console.error(`Failed to read apps directory: ${error}`);
      }
    }
  }

  const reportsWithContent = await Promise.all(
    allReports.map(loadReportContent)
  );

  return reportsWithContent;
}

export function groupReportsByType(
  reports: ReportFile[]
): Record<ReportFile['type'], ReportFile[]> {
  const grouped: Record<ReportFile['type'], ReportFile[]> = {
    'cucumber-json': [],
    'cucumber-html': [],
    'vitest': [],
    'playwright': [],
    'unknown': []
  };

  for (const report of reports) {
    grouped[report.type].push(report);
  }

  return grouped;
}

export function generateReportMetadata(report: ReportFile): {
  packageName: string;
  fileName: string;
  directory: string;
} {
  const fileName = path.basename(report.path);
  const directory = path.dirname(report.path);

  const packageMatch = directory.match(/packages\/([^/]+)|apps\/([^/]+)/);
  const packageName = packageMatch
    ? packageMatch[1] || packageMatch[2] || 'unknown'
    : 'root';

  return {
    packageName,
    fileName,
    directory
  };
}