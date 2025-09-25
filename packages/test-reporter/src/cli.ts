#!/usr/bin/env node

import { collectReports, groupReportsByType } from './collector';
import {
  formatCucumberReport,
  parseCucumberJson
} from './formatter';
import {
  publishToWiki,
  updateWikiIndex,
  commitAndPushWiki,
  cloneWikiRepo,
  generateCommitMessage
} from './publisher';
import {
  generateWikiIndex,
  generateWikiMarkdown,
  type TestReport
} from './index';
import * as path from 'path';

interface CliOptions {
  branch?: string;
  runId?: string;
  commitSha?: string;
  wikiRepo?: string;
  wikiPath?: string;
  maxReports?: number;
  dryRun?: boolean;
  rootPath?: string;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--branch':
        options.branch = next;
        i++;
        break;
      case '--run-id':
        options.runId = next;
        i++;
        break;
      case '--commit':
        options.commitSha = next;
        i++;
        break;
      case '--wiki-repo':
        options.wikiRepo = next;
        i++;
        break;
      case '--wiki-path':
        options.wikiPath = next;
        i++;
        break;
      case '--max-reports':
        options.maxReports = parseInt(next, 10);
        i++;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--root':
        options.rootPath = next;
        i++;
        break;
    }
  }

  return options;
}

function getEnvWithFallback(envVar: string, fallback?: string): string {
  return process.env[envVar] || fallback || '';
}

function validateOptions(options: CliOptions): void {
  const errors: string[] = [];

  if (!options.branch) {
    errors.push('Branch is required (--branch or GITHUB_REF_NAME)');
  }
  if (!options.runId) {
    errors.push('Run ID is required (--run-id or GITHUB_RUN_ID)');
  }
  if (!options.commitSha) {
    errors.push('Commit SHA is required (--commit or GITHUB_SHA)');
  }

  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
}

async function processReports(
  rootPath: string,
  options: CliOptions
): Promise<Map<string, string>> {
  console.log('Collecting test reports...');
  const reports = await collectReports(rootPath, {
    skipMissing: true
  });

  const grouped = groupReportsByType(reports);
  const processedReports = new Map<string, string>();

  if (grouped['cucumber-json'].length > 0) {
    console.log(`Processing ${grouped['cucumber-json'].length} Cucumber JSON reports`);

    for (const report of grouped['cucumber-json']) {
      if (report.content) {
        const cucumberData = parseCucumberJson(report.content);
        const markdown = formatCucumberReport(cucumberData);
        const fileName = path.basename(report.path).replace('.json', '.md');
        processedReports.set(fileName, markdown);
      }
    }
  }

  if (grouped['cucumber-html'].length > 0) {
    console.log(`Found ${grouped['cucumber-html'].length} HTML reports`);
    for (const report of grouped['cucumber-html']) {
      if (report.content) {
        const fileName = path.basename(report.path);
        processedReports.set(fileName, report.content);
      }
    }
  }

  return processedReports;
}

function createTestReport(options: CliOptions): TestReport {
  return {
    runId: options.runId!,
    branch: options.branch!,
    commitSha: options.commitSha!,
    timestamp: new Date().toISOString(),
    reportPath: `reports/${options.branch}/${options.runId}/index.html`,
    status: 'success'
  };
}

async function main(): Promise<void> {
  const args = process.argv;
  const options = parseArgs(args);

  options.branch = options.branch || getEnvWithFallback('GITHUB_REF_NAME');
  options.runId = options.runId || getEnvWithFallback('GITHUB_RUN_ID');
  options.commitSha = options.commitSha || getEnvWithFallback('GITHUB_SHA');
  options.wikiRepo = options.wikiRepo || getEnvWithFallback('GITHUB_REPOSITORY');
  options.rootPath = options.rootPath || process.cwd();

  validateOptions(options);

  const wikiPath = options.wikiPath || '/tmp/wiki';

  if (options.wikiRepo && !options.dryRun) {
    const wikiUrl = `https://github.com/${options.wikiRepo}.wiki.git`;
    console.log(`Cloning wiki repository: ${wikiUrl}`);

    try {
      await cloneWikiRepo(wikiUrl, wikiPath, options.dryRun);
    } catch (error) {
      console.warn(`Could not clone wiki (might not exist yet): ${error}`);
    }
  }

  const reports = await processReports(options.rootPath, options);

  if (reports.size === 0) {
    console.log('No reports found to publish');
    return;
  }

  console.log(`Publishing ${reports.size} reports to wiki...`);

  const publishResult = await publishToWiki(reports, {
    wikiPath,
    branch: options.branch!,
    runId: options.runId!,
    commitSha: options.commitSha!,
    maxReportsPerBranch: options.maxReports || 20,
    dryRun: options.dryRun
  });

  if (publishResult.success) {
    console.log(`Published to: ${publishResult.reportPath}`);
    console.log(`Files: ${publishResult.filesPublished.length}`);

    const testReport = createTestReport(options);
    const index = generateWikiIndex([testReport]);
    const indexMarkdown = generateWikiMarkdown(index);

    await updateWikiIndex(wikiPath, indexMarkdown, {
      wikiPath,
      branch: options.branch!,
      runId: options.runId!,
      commitSha: options.commitSha!,
      dryRun: options.dryRun
    });

    if (!options.dryRun && options.wikiRepo) {
      const message = generateCommitMessage({
        wikiPath,
        branch: options.branch!,
        runId: options.runId!,
        commitSha: options.commitSha!
      });

      await commitAndPushWiki(wikiPath, message, {
        wikiPath,
        branch: options.branch!,
        runId: options.runId!,
        commitSha: options.commitSha!,
        dryRun: options.dryRun
      });

      console.log('Wiki updated successfully');
    }
  } else {
    console.error('Failed to publish reports:', publishResult.errors);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main, parseArgs, validateOptions };