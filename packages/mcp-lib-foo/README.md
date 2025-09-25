# MCP Server for lib-foo

MCP (Model Context Protocol) Server that exposes lib-foo functionality for use with Claude Code and other MCP-compatible clients.

## Features

This MCP server exposes the following tools from the lib-foo package:

- **fooProcess**: Process text with prefix and optional suffix
- **fooGreet**: Create greetings with foo processing
- **createFooProcessor**: Create a configured foo processor
- **fooTransform**: Transform arrays of strings with custom transformers
- **fooFilter**: Filter arrays based on predicates

### Transport Modes

- **STDIO Transport**: Traditional MCP transport using standard input/output (default)
- **HTTP Transport**: RESTful HTTP endpoint for web applications
- **WebSocket Transport**: Real-time bidirectional communication for persistent connections

## Installation

### Local Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test
pnpm test:cucumber

# Start the server (default stdio transport)
pnpm start

# Start with HTTP transport
MCP_TRANSPORT=http MCP_PORT=3000 pnpm start

# Start with WebSocket transport
MCP_TRANSPORT=websocket MCP_PORT=3001 pnpm start
```

### Docker Deployment

#### Build and Run with Docker

```bash
# Build the Docker image
docker build -t mcp-lib-foo:latest -f packages/mcp-lib-foo/Dockerfile .

# Run with HTTP transport
docker run -it --rm \
  -e NODE_ENV=production \
  -e MCP_TRANSPORT=http \
  -e MCP_PORT=3000 \
  -e MCP_CORS=true \
  -p 3010:3000 \
  mcp-lib-foo:latest

# Run with WebSocket transport
docker run -it --rm \
  -e NODE_ENV=production \
  -e MCP_TRANSPORT=websocket \
  -e MCP_PORT=3000 \
  -p 3011:3000 \
  mcp-lib-foo:latest

# Run with STDIO transport (default)
docker run -it --rm \
  -e NODE_ENV=production \
  mcp-lib-foo:latest
```

#### Using Docker Compose

```bash
# Start HTTP transport service (default)
cd packages/mcp-lib-foo
docker-compose up -d mcp-lib-foo-http

# Start WebSocket transport service
docker-compose --profile websocket up -d mcp-lib-foo-websocket

# Start STDIO transport service
docker-compose --profile stdio up -d mcp-lib-foo-stdio

# Development mode with hot reload
docker-compose --profile dev up mcp-lib-foo-dev

# View logs
docker-compose logs -f

# Stop the server
docker-compose down

# Run tests in Docker
docker-compose --profile test up mcp-lib-foo-test
```

### Kubernetes Deployment

```bash
# Apply all resources
kubectl apply -f packages/mcp-lib-foo/k8s-deployment.yaml

# Scale deployment
kubectl scale deployment mcp-lib-foo -n mcp-services --replicas=5

# Check status
kubectl get pods -n mcp-services
kubectl logs -n mcp-services -l app=mcp-lib-foo
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode (development/production/test) |
| `MCP_SERVER_NAME` | `mcp-lib-foo` | Server identifier |
| `MCP_SERVER_VERSION` | `0.0.0` | Server version |
| `MCP_TRANSPORT` | `stdio` | Transport mode: `stdio`, `http`, or `websocket` |
| `MCP_PORT` | `3000` | Port for HTTP/WebSocket transports |
| `MCP_HOST` | `0.0.0.0` | Host to bind network transports |
| `MCP_CORS` | `false` | Enable CORS for HTTP transport |
| `MCP_HEALTH_PATH` | `/health` | Path for health check endpoint |
| `LOG_LEVEL` | `info` | Logging level (info/debug/error) |

### Claude Code Integration

To use this MCP server with Claude Code, add it to your MCP configuration:

#### STDIO Transport (Default)

```json
{
  "mcpServers": {
    "mcp-lib-foo": {
      "command": "node",
      "args": ["/path/to/mcp-lib-foo/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### HTTP Transport

```json
{
  "mcpServers": {
    "mcp-lib-foo": {
      "command": "node",
      "args": ["/path/to/mcp-lib-foo/dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "MCP_TRANSPORT": "http",
        "MCP_PORT": "3000",
        "MCP_CORS": "true"
      }
    }
  }
}
```

#### Docker Integration

```json
{
  "mcpServers": {
    "mcp-lib-foo": {
      "command": "docker",
      "args": ["run", "-i", "--rm",
               "-e", "MCP_TRANSPORT=stdio",
               "mcp-lib-foo:latest"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Network Transport Usage

### HTTP Transport API

```javascript
// Health check
const health = await fetch('http://localhost:3000/health');
const status = await health.json();
// { status: 'healthy', transport: 'http', server: 'mcp-lib-foo', version: '0.0.0' }

// MCP request
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-ID': 'unique-session-id'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'fooProcess',
      arguments: {
        input: 'test',
        prefix: 'foo'
      }
    },
    id: 1
  })
});
```

### WebSocket Transport API

```javascript
// Connect via WebSocket
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  // Send MCP request
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1
  }));
});

ws.on('message', (data) => {
  const response = JSON.parse(data);
  console.log('Received:', response);
});
```

## API Documentation

### Available Tools

#### fooProcess

Process text with prefix and optional suffix.

**Parameters:**
- `input` (string, required): The input text to process
- `prefix` (string, required): Prefix to add to the input
- `suffix` (string, optional): Suffix to add to the input

**Example:**
```json
{
  "tool": "fooProcess",
  "arguments": {
    "input": "test",
    "prefix": "pre-",
    "suffix": "-post"
  }
}
```

#### fooGreet

Create greetings with foo processing.

**Parameters:**
- `name` (string, required): The name to greet
- `prefix` (string, required): Prefix for the greeting
- `suffix` (string, optional): Suffix for the greeting

**Example:**
```json
{
  "tool": "fooGreet",
  "arguments": {
    "name": "Alice",
    "prefix": "***",
    "suffix": "!!!"
  }
}
```

#### createFooProcessor

Create a configured foo processor.

**Parameters:**
- `prefix` (string, required): Default prefix for the processor
- `suffix` (string, optional): Default suffix for the processor
- `action` (string, required): Action to perform ("process" | "greetWithFoo")
- `input` (string, required): Input for the selected action

**Example:**
```json
{
  "tool": "createFooProcessor",
  "arguments": {
    "prefix": "[",
    "suffix": "]",
    "action": "process",
    "input": "data"
  }
}
```

#### fooTransform

Transform an array of strings.

**Parameters:**
- `data` (array of strings, required): Array to transform
- `transformType` (string, required): Type of transformation ("uppercase" | "lowercase" | "reverse" | "trim")

**Example:**
```json
{
  "tool": "fooTransform",
  "arguments": {
    "data": ["hello", "world"],
    "transformType": "uppercase"
  }
}
```

#### fooFilter

Filter an array based on a predicate.

**Parameters:**
- `items` (array, required): Array of items to filter
- `filterType` (string, required): Type of filter ("truthy" | "falsy" | "nonEmpty" | "numeric" | "string")
- `customPredicate` (string, optional): Custom predicate for string filtering (e.g., "minLength:5")

**Example:**
```json
{
  "tool": "fooFilter",
  "arguments": {
    "items": [1, "test", 0, "", "valid", null],
    "filterType": "truthy"
  }
}
```

## Development

### Project Structure

```
packages/mcp-lib-foo/
├── src/
│   ├── index.ts                     # Main MCP server with transport support
│   └── index.test.ts                # Unit tests
├── features/                        # BDD feature files
│   ├── mcp-tools.feature
│   ├── mcp-server.feature
│   ├── network-transport.feature   # Network transport scenarios
│   └── step_definitions/
│       ├── mcp.steps.ts
│       └── network-transport.steps.ts
├── Dockerfile                       # Multi-stage Docker build with transport modes
├── docker-compose.yml               # Multi-service Docker setup
├── k8s-deployment.yaml              # Kubernetes production deployment
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── cucumber.cjs
```

### Testing

The package includes comprehensive testing:

- **Unit Tests**: Run with `pnpm test`
- **BDD Tests**: Run with `pnpm test:cucumber`
- **Docker Tests**: Run with `docker-compose --profile test up`

### Building

```bash
# TypeScript build
pnpm build

# Docker build for network transport
docker build -t mcp-lib-foo:latest -f Dockerfile ../..

# Docker build for stdio transport
docker build --target runner-stdio -t mcp-lib-foo:stdio -f Dockerfile ../..
```

## Troubleshooting

### Server Won't Start

1. Check that all dependencies are installed: `pnpm install`
2. Ensure the package is built: `pnpm build`
3. Verify environment variables are set correctly
4. Check Docker logs if using containerized deployment

### Connection Issues with Claude Code

1. Verify the server is running: `docker ps` or check process list
2. Check the MCP configuration in Claude Code settings
3. Ensure the correct path to the server executable
4. Review server logs for error messages

### Network Transport Issues

1. Verify port is not already in use: `lsof -i :3000`
2. Check firewall settings allow incoming connections
3. For HTTP, test health endpoint: `curl http://localhost:3000/health`
4. For WebSocket, use wscat or similar tool to test connection
5. Enable debug logging: `LOG_LEVEL=debug`

### Docker Build Failures

1. Ensure you're building from the repository root
2. Check that all workspace dependencies are present
3. Verify Docker daemon is running
4. Clear Docker cache: `docker builder prune`

## Security Considerations

- Always run containers as non-root user (UID 1001)
- Use read-only root filesystem when possible
- Configure appropriate resource limits
- Enable CORS only when necessary and configure allowed origins
- Use TLS/SSL for production deployments
- Implement authentication/authorization for production use
- Regular security updates for dependencies

## License

Private package - see repository license.