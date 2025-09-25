# Issue #24: User Story: Network Transport for MCP lib-foo Server

**Issue URL**: https://github.com/f00b455/ts-pure-template/issues/24
**Created**: 2025-09-25T06:00:47Z
**Assignee**: Unassigned

## Description
# User Story: Network Transport for MCP lib-foo Server

## Overview
**As a** developer using MCP clients  
**I want** the MCP lib-foo server to support network transport (HTTP/WebSocket)  
**So that** I can connect to it remotely over the network instead of only via stdio

## Background
The `mcp-lib-foo` package currently provides 5 powerful MCP tools via stdio transport only:
- `fooProcess` - Text processing with prefix/suffix
- `fooGreet` - Greeting generation with foo processing
- `createFooProcessor` - Configured processor creation
- `fooTransform` - String array transformations
- `fooFilter` - Array filtering with predicates

**Current Limitation:** The server only supports `StdioServerTransport`, requiring direct process communication. This prevents:
- Remote MCP client connections
- Web-based MCP clients
- Distributed MCP architectures
- Load balancing and scaling

## User Story

**As a** MCP client developer  
**I want** to connect to the lib-foo MCP server over HTTP/WebSocket  
**So that** I can integrate foo processing tools in distributed applications

### Acceptance Criteria
- [ ] MCP server supports HTTP transport on configurable port (default: 3001)
- [ ] MCP server supports WebSocket transport for real-time connections  
- [ ] All existing MCP tools work identically over network transport
- [ ] Server can run in both stdio mode (default) and network mode via CLI flag
- [ ] Proper connection handling and cleanup
- [ ] CORS support for web-based MCP clients
- [ ] Connection logging and basic metrics

### Technical Requirements

#### Network Transport Options
- **HTTP Transport**: Standard MCP-over-HTTP for stateless interactions
- **WebSocket Transport**: Real-time bidirectional MCP communication
- **Dual Mode**: Support both stdio (current) and network transports

#### CLI Interface
```bash
# Current stdio mode (unchanged)
mcp-lib-foo

# New network mode
mcp-lib-foo --transport http --port 3001
mcp-lib-foo --transport websocket --port 3001  
mcp-lib-foo --transport both --port 3001
```

#### Configuration
```typescript
interface ServerConfig {
  transport: 'stdio' | 'http' | 'websocket' | 'both';
  port?: number;
  host?: string;
  cors?: boolean;
}
```

## Technical Implementation

### MCP SDK Network Transports
The `@modelcontextprotocol/sdk` likely provides network transport options:
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// Add network transports:
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { WebSocketServerTransport } from '@modelcontextprotocol/sdk/server/websocket.js';
```

### Proposed Architecture
```typescript
// Current: stdio only
const transport = new StdioServerTransport();
await server.connect(transport);

// New: configurable transport
const transport = createTransport(config);
await server.connect(transport);
```

### Connection Management
- Graceful connection handling
- Multiple concurrent client support  
- Connection state management
- Proper error propagation over network

## Business Value
- **Remote Access**: Enable distributed MCP architectures
- **Web Integration**: Allow web-based MCP clients to connect
- **Scalability**: Foundation for load balancing and horizontal scaling
- **Development**: Easier testing with network-accessible MCP server
- **Flexibility**: Support both local (stdio) and remote (network) use cases

## Examples

### HTTP MCP Client Connection
```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

### WebSocket MCP Client Connection  
```javascript
const ws = new WebSocket('ws://localhost:3001/mcp');
ws.send(JSON.stringify({ method: "tools/list" }));
```

### MCP Client Library Usage
```typescript
import { MCPClient } from '@modelcontextprotocol/sdk/client';

// Connect over network instead of stdio
const client = new MCPClient({
  transport: 'http',
  url: 'http://localhost:3001/mcp'
});

// All existing MCP operations work the same
const tools = await client.listTools();
const result = await client.callTool('fooProcess', { 
  input: 'hello', 
  prefix: 'foo-' 
});
```

## Testing Requirements
- [ ] Network transport connectivity tests
- [ ] Multiple concurrent client connections
- [ ] Connection error handling and recovery
- [ ] Performance testing vs stdio transport
- [ ] Cross-platform network compatibility
- [ ] Security testing for network exposure

## Configuration & Security
- [ ] Environment-based configuration (PORT, HOST, CORS)
- [ ] Optional authentication/authorization for network access
- [ ] Rate limiting for network connections
- [ ] Basic security headers for HTTP transport

## Backward Compatibility  
- [ ] Existing stdio transport remains the default
- [ ] No breaking changes to current MCP tool implementations
- [ ] CLI maintains backward compatibility
- [ ] Package.json scripts unchanged for stdio usage

## Definition of Done
- [ ] MCP server supports HTTP and WebSocket transports
- [ ] CLI supports transport selection via command line flags
- [ ] All existing MCP tools work over network transport
- [ ] Comprehensive test coverage for network modes
- [ ] Documentation with connection examples
- [ ] Performance benchmarks comparing stdio vs network
- [ ] Security review completed

## Dependencies
- `@modelcontextprotocol/sdk` network transport modules
- Current MCP server implementation
- CLI argument parsing library (if not already present)

## Estimated Effort: 1-2 days
- Network transport integration: 0.5 days
- CLI configuration: 0.5 days  
- Testing and documentation: 0.5-1 days

---

**Priority**: Medium  
**Complexity**: Low-Medium  
**Value**: High

This enhancement enables the powerful MCP lib-foo tools to be accessed remotely while maintaining full compatibility with existing stdio-based workflows.

## Work Log
- Branch created: issue-24-user-story-network-transport-for-mcp-lib-foo-serve
- [ ] Implementation
- [ ] Tests
- [ ] Documentation
