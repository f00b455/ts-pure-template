#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  fooProcess,
  fooGreet,
  createFooProcessor,
  fooTransform,
  fooFilter,
  type FooConfig
} from '@ts-template/lib-foo';
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { Readable, Writable } from 'node:stream';

// Configuration from environment variables
const config = {
  transport: process.env.MCP_TRANSPORT || 'stdio',
  port: parseInt(process.env.MCP_PORT || '3000', 10),
  host: process.env.MCP_HOST || '0.0.0.0',
  cors: process.env.MCP_CORS === 'true',
  healthPath: process.env.MCP_HEALTH_PATH || '/health'
};

const server = new Server(
  {
    name: 'mcp-lib-foo',
    version: '0.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions with JSON schemas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'fooProcess',
        description: 'Process text with prefix and optional suffix',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'The input text to process',
            },
            prefix: {
              type: 'string',
              description: 'Prefix to add to the input',
            },
            suffix: {
              type: 'string',
              description: 'Optional suffix to add to the input',
            },
          },
          required: ['input', 'prefix'],
        },
      },
      {
        name: 'fooGreet',
        description: 'Create greetings with foo processing',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name to greet',
            },
            prefix: {
              type: 'string',
              description: 'Prefix for the greeting',
            },
            suffix: {
              type: 'string',
              description: 'Optional suffix for the greeting',
            },
          },
          required: ['name', 'prefix'],
        },
      },
      {
        name: 'createFooProcessor',
        description: 'Create a configured foo processor',
        inputSchema: {
          type: 'object',
          properties: {
            prefix: {
              type: 'string',
              description: 'Default prefix for the processor',
            },
            suffix: {
              type: 'string',
              description: 'Optional default suffix for the processor',
            },
            action: {
              type: 'string',
              enum: ['process', 'greetWithFoo'],
              description: 'Action to perform with the processor',
            },
            input: {
              type: 'string',
              description: 'Input for the selected action',
            },
          },
          required: ['prefix', 'action', 'input'],
        },
      },
      {
        name: 'fooTransform',
        description: 'Transform an array of strings with a custom transformer',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of strings to transform',
            },
            transformType: {
              type: 'string',
              enum: ['uppercase', 'lowercase', 'reverse', 'trim'],
              description: 'Type of transformation to apply',
            },
          },
          required: ['data', 'transformType'],
        },
      },
      {
        name: 'fooFilter',
        description: 'Filter an array based on a predicate',
        inputSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                oneOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'boolean' },
                ],
              },
              description: 'Array of items to filter',
            },
            filterType: {
              type: 'string',
              enum: ['truthy', 'falsy', 'nonEmpty', 'numeric', 'string'],
              description: 'Type of filter to apply',
            },
            customPredicate: {
              type: 'string',
              description: 'Optional custom predicate (for strings: minLength:N)',
            },
          },
          required: ['items', 'filterType'],
        },
      },
    ],
  };
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'fooProcess': {
        const { input, prefix, suffix } = args as { input: string; prefix: string; suffix?: string };
        const config: FooConfig = suffix !== undefined ? { prefix, suffix } : { prefix };
        const result = fooProcess(config)(input);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'fooGreet': {
        const { name: userName, prefix, suffix } = args as { name: string; prefix: string; suffix?: string };
        const config: FooConfig = suffix !== undefined ? { prefix, suffix } : { prefix };
        const result = fooGreet(config)(userName);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'createFooProcessor': {
        const { prefix, suffix, action, input } = args as {
          prefix: string;
          suffix?: string;
          action: 'process' | 'greetWithFoo';
          input: string;
        };
        const config: FooConfig = suffix !== undefined ? { prefix, suffix } : { prefix };
        const processor = createFooProcessor(config);

        let result: string;
        if (action === 'process') {
          result = processor.process(input);
        } else {
          result = processor.greetWithFoo(input);
        }

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'fooTransform': {
        const { data, transformType } = args as {
          data: string[];
          transformType: 'uppercase' | 'lowercase' | 'reverse' | 'trim';
        };

        let transformer: (value: string) => string;
        switch (transformType) {
          case 'uppercase':
            transformer = (s: string) => s.toUpperCase();
            break;
          case 'lowercase':
            transformer = (s: string) => s.toLowerCase();
            break;
          case 'reverse':
            transformer = (s: string) => s.split('').reverse().join('');
            break;
          case 'trim':
            transformer = (s: string) => s.trim();
            break;
          default:
            throw new Error(`Unknown transform type: ${transformType}`);
        }

        const result = fooTransform(data, transformer);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }

      case 'fooFilter': {
        const { items, filterType, customPredicate } = args as {
          items: unknown[];
          filterType: 'truthy' | 'falsy' | 'nonEmpty' | 'numeric' | 'string';
          customPredicate?: string;
        };

        let predicate: (value: unknown) => boolean;
        switch (filterType) {
          case 'truthy':
            predicate = (v: unknown) => !!v;
            break;
          case 'falsy':
            predicate = (v: unknown) => !v;
            break;
          case 'nonEmpty':
            predicate = (v: unknown) => {
              if (typeof v === 'string') return v.length > 0;
              if (Array.isArray(v)) return v.length > 0;
              return v != null;
            };
            break;
          case 'numeric':
            predicate = (v: unknown) => typeof v === 'number' && !isNaN(v as number);
            break;
          case 'string':
            if (customPredicate && customPredicate.startsWith('minLength:')) {
              const parts = customPredicate.split(':');
              const minLength = parts[1] ? parseInt(parts[1], 10) : 0;
              predicate = (v: unknown) => typeof v === 'string' && v.length >= minLength;
            } else {
              predicate = (v: unknown) => typeof v === 'string';
            }
            break;
          default:
            throw new Error(`Unknown filter type: ${filterType}`);
        }

        const result = fooFilter(items, predicate);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// Custom HTTP Transport class
class HttpServerTransport {
  private httpServer: http.Server;
  private sessions: Map<string, { reader: Readable; writer: Writable }> = new Map();

  constructor(port: number, host: string, cors: boolean, healthPath: string) {
    this.httpServer = http.createServer((req, res) => {
      // Enable CORS if configured
      if (cors) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }
      }

      // Health check endpoint
      if (req.url === healthPath) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          transport: 'http',
          server: 'mcp-lib-foo',
          version: '0.0.0'
        }));
        return;
      }

      // MCP endpoint
      if (req.url === '/mcp' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const sessionId = req.headers['x-session-id'] as string || 'default';

            // Create or get session
            if (!this.sessions.has(sessionId)) {
              const reader = new Readable({ read() {} });
              const writer = new Writable({
                write(chunk, encoding, callback) {
                  res.write(chunk);
                  callback();
                }
              });
              this.sessions.set(sessionId, { reader, writer });
            }

            const session = this.sessions.get(sessionId)!;
            session.reader.push(body);

            res.writeHead(200, { 'Content-Type': 'application/json' });

            // Process through MCP server
            // Note: This is a simplified implementation
            // In production, you'd need proper stream handling
            setTimeout(() => {
              res.end();
            }, 100);
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    this.httpServer.listen(port, host, () => {
      console.error(`HTTP Server listening on ${host}:${port}`);
    });
  }

  async connect(): Promise<{ readable: Readable; writable: Writable }> {
    // Return default session streams
    const reader = new Readable({ read() {} });
    const writer = new Writable({
      write(chunk, encoding, callback) {
        console.log('HTTP Output:', chunk.toString());
        callback();
      }
    });

    return { readable: reader, writable: writer };
  }

  close(): void {
    this.httpServer.close();
  }
}

// Custom WebSocket Transport class
class WebSocketServerTransport {
  private wss: WebSocketServer;
  private connections: Map<string, { reader: Readable; writer: Writable; ws: any }> = new Map();

  constructor(port: number, host: string) {
    this.wss = new WebSocketServer({ port, host });

    this.wss.on('connection', (ws, req) => {
      const sessionId = req.headers['x-session-id'] as string || `ws-${Date.now()}`;

      const reader = new Readable({ read() {} });
      const writer = new Writable({
        write(chunk, encoding, callback) {
          if (ws.readyState === ws.OPEN) {
            ws.send(chunk.toString());
          }
          callback();
        }
      });

      this.connections.set(sessionId, { reader, writer, ws });

      ws.on('message', (data: Buffer) => {
        reader.push(data.toString());
      });

      ws.on('close', () => {
        this.connections.delete(sessionId);
      });

      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
        this.connections.delete(sessionId);
      });

      console.error(`WebSocket client connected: ${sessionId}`);
    });

    console.error(`WebSocket Server listening on ${host}:${port}`);
  }

  async connect(): Promise<{ readable: Readable; writable: Writable }> {
    // Return a default stream pair for the server
    const reader = new Readable({ read() {} });
    const writer = new Writable({
      write(chunk, encoding, callback) {
        // Broadcast to all connected clients
        for (const conn of this.connections.values()) {
          if (conn.ws.readyState === conn.ws.OPEN) {
            conn.ws.send(chunk.toString());
          }
        }
        callback();
      }.bind(this)
    });

    return { readable: reader, writable: writer };
  }

  close(): void {
    this.wss.close();
  }
}

// Start the server with the appropriate transport
async function main() {
  try {
    let transport: any;

    switch (config.transport.toLowerCase()) {
      case 'http':
        console.error(`Starting HTTP transport on ${config.host}:${config.port}`);
        const httpTransport = new HttpServerTransport(
          config.port,
          config.host,
          config.cors,
          config.healthPath
        );
        const httpStreams = await httpTransport.connect();
        await server.connect({
          readable: httpStreams.readable,
          writable: httpStreams.writable
        } as any);
        break;

      case 'websocket':
      case 'ws':
        console.error(`Starting WebSocket transport on ${config.host}:${config.port}`);
        const wsTransport = new WebSocketServerTransport(config.port, config.host);
        const wsStreams = await wsTransport.connect();
        await server.connect({
          readable: wsStreams.readable,
          writable: wsStreams.writable
        } as any);
        break;

      case 'stdio':
      default:
        console.error('Starting stdio transport');
        transport = new StdioServerTransport();
        await server.connect(transport);
        break;
    }

    console.error(`MCP Server for lib-foo started (${config.transport})`);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down MCP server...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Shutting down MCP server...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});