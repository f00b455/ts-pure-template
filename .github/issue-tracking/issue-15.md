# Issue #15: Harmonize TypeScript/Module System Configuration Across Monorepo

**Issue URL**: https://github.com/f00b455/ts-pure-template/issues/15
**Created by**: @f00b455
**Auto-processed**: Wed Sep 24 15:38:19 UTC 2025

## Description
## Problem

The current monorepo has inconsistent module system configurations that create friction when working with TypeScript, Cucumber BDD tests, and shared libraries. We're mixing:

- **ESM packages** (`"type": "module"` in package.json)
- **CommonJS packages** (no type field)
- **TypeScript compilation** targeting different module systems
- **Cucumber step definitions** requiring CommonJS (`.cjs` files)
- **Build tools** expecting different module formats
- **Dynamic imports** needed to bridge ESM/CJS incompatibilities

This creates a complex web of compatibility issues, especially for:
- Cucumber BDD test step definitions
- Shared library consumption
- Build tool configuration
- Import/require statements

## Current Issues

1. **lib-foo package**: ESM package can't easily consume in Cucumber CJS step definitions
2. **cucumber-shared package**: Built as both ESM/CJS but consumption is inconsistent
3. **Step definitions**: Mix of `.ts`, `.js`, `.cjs` files with different import strategies
4. **TypeScript configs**: Different compilation targets across packages
5. **Import syntax**: Mix of `import`, `require()`, and dynamic `import()` calls

## Proposed Solution

Standardize on **TypeScript with ESM throughout the monorepo** with consistent tooling:

### 1. Package Configuration
- All packages use `"type": "module"` 
- Consistent TypeScript compilation to ESM
- Unified tsconfig settings across packages

### 2. Cucumber Integration
- Use Cucumber's native TypeScript support with ts-node/esm
- Standard `.ts` step definition files
- ESM-compatible cucumber configurations
- Eliminate need for `.cjs` workarounds

### 3. Build Tooling
- Update all build tools to support ESM consistently
- Unified compilation pipeline
- Consistent output formats

### 4. Import Strategy
- Standard ES6 `import/export` syntax everywhere
- Eliminate dynamic imports and require() mixing
- Consistent module resolution

## Acceptance Criteria

- [ ] All packages use TypeScript with ESM consistently
- [ ] Cucumber tests work with `.ts` step definitions (no `.cjs` needed)
- [ ] Shared libraries import cleanly across packages
- [ ] Build pipeline works uniformly
- [ ] No more ESM/CJS compatibility workarounds
- [ ] Developer experience is smooth when adding new tests/features

## Priority

**High** - This affects developer productivity and makes adding new BDD tests unnecessarily complex.

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

## Work Log
- Branch created: issue-15-harmonize-typescript-module-system-configuration-a (via cron job)
- [ ] Implementation
- [ ] Tests
- [ ] Documentation
