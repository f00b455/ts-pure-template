# @ts-template/wiki-reports

Test report publishing system for GitHub Wiki.

## Features

- Automatic publishing of CI/CD test reports to GitHub Wiki
- Support for multiple test formats (JUnit, Jest, Vitest, Cucumber)
- HTML report generation with responsive design
- Automatic index generation and updates
- Retention policy for managing report storage
- Branch-based report organization

## Usage

This package is designed to be used in GitHub Actions workflows. See `workflow-template.yml` for an example workflow configuration.

### Report Converters

The package includes converters for common test report formats:

- **JUnit**: Converts JUnit XML to HTML
- **Jest**: Converts Jest JSON results to HTML
- **Vitest**: Converts Vitest JSON results to HTML with coverage
- **Cucumber**: Converts Cucumber JSON results to HTML with BDD features

### Configuration

```typescript
import { WikiReportsPublisher, ReportConfig } from '@ts-template/wiki-reports';

const config: ReportConfig = {
  branch: 'main',
  runId: 'run-123',
  commitSha: 'abc123',
  timestamp: new Date(),
  reportsPath: './reports',
  wikiPath: './wiki',
  retentionLimit: 20  // Keep last 20 runs per branch
};

const publisher = new WikiReportsPublisher(config);
```

## GitHub Actions Setup

1. Enable GitHub Wiki for your repository
2. Copy `workflow-template.yml` to `.github/workflows/wiki-reports.yml`
3. Configure test report artifacts in your CI workflow
4. Reports will be automatically published after successful CI runs

## Structure

Reports are organized in the Wiki as:
```
wiki/
├── Home.md                      # Index page with latest runs
└── reports/
    ├── main/
    │   ├── run-123/
    │   │   ├── index.html      # Run overview
    │   │   ├── junit.html      # JUnit results
    │   │   └── coverage.html   # Coverage report
    │   └── run-124/
    └── feature-branch/
        └── run-125/
```

## Development

```bash
# Build the package
pnpm build

# Run tests
pnpm test

# Run Cucumber BDD tests
pnpm test:cucumber

# Type checking
pnpm type-check

# Linting
pnpm lint
```