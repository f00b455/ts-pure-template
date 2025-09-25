# Issue #29: Implement test-reporter package for GitHub Wiki publishing

**Issue URL**: https://github.com/f00b455/ts-pure-template/issues/29
**Created**: 2025-09-25T08:34:38Z
**Assignee**: Unassigned

## Description
## Context

Issue #5 defined the BDD tests for the test-reporter package, which have been implemented in PR #26. However, the actual implementation of the test reporter functionality is still missing.

## Current State

- ✅ BDD tests written and passing (using dummy implementations)
- ✅ Step definitions implemented
- ❌ Actual test reporter implementation missing
- ❌ GitHub Actions workflow for Wiki publishing missing

## Required Implementation

### 1. Core Functionality
- **Markdown Formatter**: Convert Cucumber JSON reports to GitHub Wiki markdown
- **Report Collector**: Gather test reports from all packages  
- **Wiki Publisher**: Push reports to GitHub Wiki using git
- **CLI Script**: Command-line interface for the reporter

### 2. Report Processing Pipeline
1. Collect test reports (JSON/HTML) from all packages
2. Convert to markdown format suitable for Wiki
3. Generate index pages with navigation
4. Apply retention policy (keep last N reports per branch)
5. Push to GitHub Wiki repository

### 3. GitHub Actions Integration
- Workflow that runs after tests complete
- Clones Wiki repository
- Processes and publishes reports
- Updates index pages

## Technical Requirements

### Input Formats
- Cucumber JSON reports
- Cucumber HTML reports  
- Vitest JSON reports (future)
- Playwright reports (future)

### Output Structure
```
wiki/
├── Home.md                    # Main index with latest runs
├── reports/
│   ├── main/
│   │   ├── <run-id-1>/
│   │   │   ├── index.md      # Run summary
│   │   │   └── details.md    # Full test details
│   │   └── <run-id-2>/
│   └── feature-branch/
│       └── <run-id>/
└── _index/
    ├── main.md               # Branch-specific index
    └── feature-branch.md
```

### Implementation Files Needed
- `src/markdown-formatter.ts` - Convert reports to markdown
- `src/report-collector.ts` - Collect reports from packages
- `src/wiki-publisher.ts` - Git operations for Wiki
- `src/cli.ts` - CLI interface
- `.github/workflows/publish-reports.yml` - GitHub Action

## Acceptance Criteria
- [ ] Reports automatically published after each CI run
- [ ] Markdown format optimized for GitHub Wiki
- [ ] Navigation between runs and branches
- [ ] Retention policy prevents unbounded growth
- [ ] Failed test details clearly visible
- [ ] Performance metrics included
- [ ] Works with monorepo structure

## References
- Original user story: #5
- BDD implementation: #26
- Feature file: `packages/test-reporter/features/wiki-testreports.feature`

## Next Steps
1. Create feature branch from main
2. Implement core modules (TDD approach)
3. Add CLI interface
4. Create GitHub Action workflow
5. Test with real CI pipeline
6. Update documentation

## Work Log
- Branch created: issue-29-implement-test-reporter-package-for-github-wiki-pu
- [ ] Implementation
- [ ] Tests
- [ ] Documentation
