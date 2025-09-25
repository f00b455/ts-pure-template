# Issue #24: User Story: HTTP Frontend for MCP lib-foo Tools

**Issue URL**: https://github.com/f00b455/ts-pure-template/issues/24
**Created**: 2025-09-25T06:00:47Z
**Assignee**: Unassigned

## Description
# User Story: HTTP Frontend for MCP lib-foo Tools

## Overview
**As a** developer using the TypeScript monorepo template  
**I want** a web-based HTTP frontend for the MCP lib-foo tools  
**So that** I can interact with the foo processing functions through a user-friendly web interface instead of only through the MCP protocol

## Background
The `mcp-lib-foo` package currently provides 5 powerful tools via MCP (Model Context Protocol):
- `fooProcess` - Text processing with prefix/suffix
- `fooGreet` - Greeting generation with foo processing
- `createFooProcessor` - Configured processor creation
- `fooTransform` - String array transformations (uppercase, lowercase, reverse, trim)
- `fooFilter` - Array filtering with predicates (truthy, falsy, numeric, string, custom)

These tools are currently only accessible via MCP stdio transport (CLI), limiting their accessibility and usability for web-based workflows.

## User Stories

### Epic: MCP Tools HTTP API
**As a** web developer  
**I want** HTTP API endpoints for all MCP lib-foo tools  
**So that** I can integrate foo processing capabilities into web applications

#### Story 1: HTTP API Endpoints
**As a** frontend developer  
**I want** RESTful API endpoints at `/api/mcp/foo/*` that mirror the MCP tool functionality  
**So that** I can call foo processing functions via HTTP requests

**Acceptance Criteria:**
- [ ] `POST /api/mcp/foo/process` - Text processing with prefix/suffix
- [ ] `POST /api/mcp/foo/greet` - Greeting generation  
- [ ] `POST /api/mcp/foo/processor` - Configured processor actions
- [ ] `POST /api/mcp/foo/transform` - String array transformations
- [ ] `POST /api/mcp/foo/filter` - Array filtering operations
- [ ] All endpoints return JSON responses matching MCP tool output format
- [ ] Comprehensive error handling with appropriate HTTP status codes
- [ ] OpenAPI/Swagger documentation for all endpoints

#### Story 2: Interactive Web Interface
**As a** user testing foo processing capabilities  
**I want** a web interface with forms for each MCP tool  
**So that** I can experiment with different inputs and see results immediately

**Acceptance Criteria:**
- [ ] Dedicated page `/tools/foo` in the Next.js frontend
- [ ] Interactive forms for each of the 5 MCP tools
- [ ] Real-time validation of inputs based on JSON schemas
- [ ] Live preview of results as inputs change
- [ ] Copy-to-clipboard functionality for results
- [ ] Example inputs/presets for quick testing
- [ ] Responsive design for mobile and desktop use

#### Story 3: API Documentation Integration
**As a** developer exploring the foo processing API  
**I want** comprehensive API documentation accessible via the web interface  
**So that** I can understand how to integrate these tools into my projects

**Acceptance Criteria:**
- [ ] Swagger UI integration showing MCP tool endpoints
- [ ] Code examples for each endpoint (curl, JavaScript, TypeScript)
- [ ] Input/output schema documentation
- [ ] Error response documentation
- [ ] Interactive API testing capability

## Technical Architecture

### Proposed Structure
```
apps/api/src/routes/
├── mcp/
│   ├── foo.ts           # HTTP endpoints wrapping MCP tools
│   └── foo.test.ts      # API endpoint tests

apps/web/src/app/
├── tools/
│   ├── foo/
│   │   ├── page.tsx     # Main foo tools page
│   │   ├── components/  # Tool-specific form components
│   │   └── types.ts     # TypeScript interfaces
```

### Integration Points
- **API Layer**: Fastify routes that wrap existing MCP tool functions
- **Frontend Layer**: Next.js components consuming the HTTP API
- **Shared Types**: Common TypeScript interfaces between API and frontend
- **Error Handling**: Consistent error formatting across HTTP and MCP protocols

## Technical Requirements

### API Requirements
- RESTful HTTP endpoints mirroring MCP tool functionality
- JSON request/response format compatible with existing MCP schemas
- Proper HTTP status codes (200, 400, 422, 500)
- CORS configuration for frontend integration
- Rate limiting and basic security headers

### Frontend Requirements  
- React components for each MCP tool with form inputs
- Real-time input validation using JSON schema validation
- Responsive UI components using existing design system
- Error state handling and user feedback
- Loading states for async API calls

### Testing Requirements
- Unit tests for HTTP API endpoints
- Integration tests for API ↔ Frontend communication
- BDD scenarios for user workflows
- End-to-end tests covering complete user journeys

## Business Value
- **Developer Experience**: Easier testing and experimentation with foo processing tools
- **Accessibility**: Web interface lowers barrier to entry for non-technical users
- **Integration**: HTTP API enables broader ecosystem integration
- **Documentation**: Interactive examples improve developer onboarding
- **Scalability**: Foundation for future MCP tool web interfaces

## Definition of Done
- [ ] All 5 MCP tools accessible via HTTP API endpoints
- [ ] Comprehensive web interface with interactive forms
- [ ] Full test coverage (unit, integration, e2e, BDD)
- [ ] Complete API documentation with examples
- [ ] Responsive design working on mobile and desktop
- [ ] Performance testing shows acceptable response times (<200ms)
- [ ] Accessibility testing passes WCAG 2.1 AA standards

## Dependencies
- Existing `@ts-template/lib-foo` package
- Current MCP server implementation
- Fastify API infrastructure
- Next.js frontend framework

## Risk Assessment
- **Low Risk**: Building on proven MCP tool functionality
- **Medium Risk**: Ensuring API performance matches MCP protocol efficiency  
- **Low Risk**: UI/UX design complexity is manageable with existing patterns

## Estimated Effort
- **API Development**: 2-3 days
- **Frontend Development**: 3-4 days  
- **Testing & Documentation**: 1-2 days
- **Total**: ~6-9 days

---

**Priority**: Medium  
**Complexity**: Medium  
**Value**: High

This enhancement would provide significant value by making the powerful MCP lib-foo tools accessible via modern web interfaces while maintaining the existing MCP protocol functionality.

## Work Log
- Branch created: issue-24-user-story-http-frontend-for-mcp-lib-foo-tools
- [ ] Implementation
- [ ] Tests
- [ ] Documentation
