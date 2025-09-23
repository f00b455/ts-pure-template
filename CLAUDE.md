# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Clean Code Principles

### Code Quality Standards:
- **Single Responsibility**: Each function/class should have one reason to change
- **Pure Functions**: Prefer functions without side effects when possible
- **Explicit Types**: Use TypeScript's type system fully - avoid `any`
- **Descriptive Naming**: Use clear, searchable names for variables and functions
- **Small Functions**: Keep functions focused and under 20 lines when possible
- **No Comments for What**: Code should be self-documenting; comments explain why, not what

### Pure Function Principles:
- **Deterministic**: Same input always produces same output
- **No Side Effects**: Don't modify external state, DOM, or global variables
- **No External Dependencies**: Don't rely on external mutable state
- **Immutable Parameters**: Don't mutate input parameters
- **Referential Transparency**: Function calls can be replaced with their return values
- **Predictable**: Easy to test, debug, and reason about
- **Examples of Pure Functions**:
  ```typescript
  // ✅ Pure - deterministic, no side effects
  const add = (a: number, b: number): number => a + b;
  const formatUser = (user: User): string => `${user.name} (${user.email})`;

  // ❌ Impure - side effects, external dependencies
  const logAndAdd = (a: number, b: number): number => {
    console.log('Adding numbers'); // Side effect
    return a + b;
  };
  const getCurrentUser = (): User => database.users.current; // External dependency
  ```
- **When to Use Pure Functions**: Data transformations, calculations, formatting, validation
- **When Impure is Acceptable**: I/O operations, API calls, database queries, logging

### Testing Principles:
- **Test-Driven Development**: Write tests first when adding new features
- **Mock External Dependencies**: Always use mocks for external services/APIs
- **Test Database**: Always use test database, never production data
- **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification
- **Descriptive Test Names**: Test names should describe the behavior being tested

### Architecture Guidelines:
- **Dependency Injection**: Prefer injecting dependencies over tight coupling
- **Error Handling**: Use explicit error types and handle all error cases
- **Immutability**: Prefer immutable data structures and operations
- **Separation of Concerns**: Keep business logic separate from framework code
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Type Safety**: Leverage TypeScript's strict mode for compile-time safety

### Performance Considerations:
- **Bundle Size**: Keep frontend bundle size minimal
- **Database Queries**: Use efficient queries and avoid N+1 problems
- **Caching**: Implement appropriate caching strategies
- **Lazy Loading**: Load resources only when needed

## Project Structure

This is a TypeScript monorepo using pnpm workspaces and Turborepo:

```
ts-pure-template/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Fastify backend API
├── packages/
│   └── shared/       # Shared TypeScript utilities and types
├── .changeset/       # Changesets configuration for versioning
├── .claude/          # Claude Code-Playbooks
└── .github/          # CI/CD workflows
```

## Development Commands

### Root Commands (run these from project root):
- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all packages and applications
- `pnpm test` - Run unit tests across all packages
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm test:cucumber` - Run Cucumber BDD tests
- `pnpm lint` - Lint all packages
- `pnpm type-check` - TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm changeset` - Create a changeset for versioning

### Package-Specific Commands:
- `pnpm --filter @ts-template/web dev` - Run Next.js in dev mode
- `pnpm --filter @ts-template/api dev` - Run Fastify API in dev mode
- `pnpm --filter @ts-template/shared test` - Test shared package only

## Architecture

### Monorepo Setup:
- **pnpm**: Package manager with workspace support
- **Turborepo**: Build system and task runner for monorepos
- **Changesets**: Versioning and changelog management

### Frontend (apps/web):
- **Next.js 14**: React framework with App Router
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing
- Uses shared package via workspace protocol

### Backend (apps/api):
- **Fastify**: Fast Node.js web framework
- **Swagger**: API documentation (available at /documentation)
- **Vitest**: Unit testing
- **Cucumber**: BDD testing with Gherkin syntax
- CORS configured for Next.js frontend

### Shared Package (packages/shared):
- Common TypeScript utilities and types
- Consumed by both web and API applications
- Includes comprehensive unit tests

### Testing Strategy:
- Unit tests with Vitest (with mocks as per user preference)
- E2E tests with Playwright
- BDD tests with Cucumber
- Always use test database (important requirement)

### CI/CD:
- GitHub Actions with separate jobs for linting, testing, building
- Automated releases with Changesets
- Coverage reporting with Codecov

## Important Notes:
- Always use test database for tests
- Use mocks in tests as specified in user requirements
- TypeScript strict mode enabled across all packages
- Shared tsconfig.base.json for consistent configuration
