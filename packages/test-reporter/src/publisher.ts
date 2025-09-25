import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

export interface PublishConfig {
  wikiPath: string;
  branch: string;
  runId: string;
  commitSha: string;
  maxReportsPerBranch?: number;
  dryRun?: boolean;
}

export interface PublishResult {
  success: boolean;
  reportPath: string;
  filesPublished: string[];
  errors?: string[];
}

const DEFAULT_MAX_REPORTS = 20;

async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeFile(
  filePath: string,
  content: string,
  dryRun?: boolean
): Promise<void> {
  if (dryRun) {
    console.log(`[DRY RUN] Would write to: ${filePath}`);
    return;
  }
  await fs.writeFile(filePath, content, 'utf-8');
}

async function copyFile(
  source: string,
  dest: string,
  dryRun?: boolean
): Promise<void> {
  if (dryRun) {
    console.log(`[DRY RUN] Would copy: ${source} -> ${dest}`);
    return;
  }
  await fs.copyFile(source, dest);
}

function executeGitCommand(
  command: string,
  cwd: string,
  dryRun?: boolean
): string {
  if (dryRun) {
    console.log(`[DRY RUN] Would execute: ${command}`);
    return '';
  }
  try {
    return execSync(command, { cwd, encoding: 'utf-8' });
  } catch (error) {
    console.error(`Git command failed: ${command}`);
    throw error;
  }
}

async function getExistingRuns(
  wikiPath: string,
  branch: string
): Promise<string[]> {
  const branchPath = path.join(wikiPath, 'reports', branch);

  try {
    const entries = await fs.readdir(branchPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

async function removeOldRuns(
  wikiPath: string,
  branch: string,
  runsToRemove: string[],
  dryRun?: boolean
): Promise<void> {
  for (const runId of runsToRemove) {
    const runPath = path.join(wikiPath, 'reports', branch, runId);

    if (dryRun) {
      console.log(`[DRY RUN] Would remove: ${runPath}`);
    } else {
      await fs.rm(runPath, { recursive: true, force: true });
    }
  }
}

async function applyRetentionPolicy(
  wikiPath: string,
  branch: string,
  maxReports: number,
  dryRun?: boolean
): Promise<void> {
  const existingRuns = await getExistingRuns(wikiPath, branch);

  if (existingRuns.length >= maxReports) {
    const runsToRemove = existingRuns.slice(maxReports - 1);
    await removeOldRuns(wikiPath, branch, runsToRemove, dryRun);
  }
}

export async function publishToWiki(
  reports: Map<string, string>,
  config: PublishConfig
): Promise<PublishResult> {
  const result: PublishResult = {
    success: false,
    reportPath: path.join('reports', config.branch, config.runId),
    filesPublished: [],
    errors: []
  };

  try {
    const reportDir = path.join(
      config.wikiPath,
      'reports',
      config.branch,
      config.runId
    );

    await ensureDirectory(reportDir);

    const maxReports = config.maxReportsPerBranch || DEFAULT_MAX_REPORTS;
    await applyRetentionPolicy(
      config.wikiPath,
      config.branch,
      maxReports,
      config.dryRun
    );

    for (const [fileName, content] of reports) {
      const filePath = path.join(reportDir, fileName);
      await writeFile(filePath, content, config.dryRun);
      result.filesPublished.push(filePath);
    }

    result.success = true;
  } catch (error) {
    result.errors = result.errors || [];
    result.errors.push(`Failed to publish reports: ${error}`);
  }

  return result;
}

export async function updateWikiIndex(
  wikiPath: string,
  indexContent: string,
  config: PublishConfig
): Promise<void> {
  const indexPath = path.join(wikiPath, 'Home.md');
  await writeFile(indexPath, indexContent, config.dryRun);
}

export async function commitAndPushWiki(
  wikiPath: string,
  message: string,
  config: PublishConfig
): Promise<void> {
  const commands = [
    'git add .',
    `git commit -m "${message}" || true`,
    'git push origin master || git push origin main'
  ];

  for (const cmd of commands) {
    executeGitCommand(cmd, wikiPath, config.dryRun);
  }
}

export async function cloneWikiRepo(
  repoUrl: string,
  targetPath: string,
  dryRun?: boolean
): Promise<void> {
  if (dryRun) {
    console.log(`[DRY RUN] Would clone: ${repoUrl} -> ${targetPath}`);
    return;
  }

  const parentDir = path.dirname(targetPath);
  await ensureDirectory(parentDir);

  try {
    executeGitCommand(
      `git clone ${repoUrl} ${path.basename(targetPath)}`,
      parentDir,
      dryRun
    );
  } catch (error) {
    console.error(`Failed to clone wiki repository: ${error}`);
    throw error;
  }
}

export function generateCommitMessage(config: PublishConfig): string {
  return `Update test reports for ${config.branch} (${config.runId})

Commit: ${config.commitSha}
Branch: ${config.branch}
Run ID: ${config.runId}`;
}