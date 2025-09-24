import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Server for lib-foo', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server(
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
  });

  describe('Tool Registration', () => {
    it('should expose 5 tools', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let toolsHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === ListToolsRequestSchema) {
          toolsHandler = handler;
        }
      });

      // Re-import to trigger registration
      await import('./index.js');

      const result = await toolsHandler();
      expect(result.tools).toHaveLength(5);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toolNames = result.tools.map((t: any) => t.name);
      expect(toolNames).toContain('fooProcess');
      expect(toolNames).toContain('fooGreet');
      expect(toolNames).toContain('createFooProcessor');
      expect(toolNames).toContain('fooTransform');
      expect(toolNames).toContain('fooFilter');
    });
  });

  describe('fooProcess Tool', () => {
    it('should process text with prefix and suffix', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'fooProcess',
          arguments: {
            input: 'test',
            prefix: 'pre-',
            suffix: '-post',
          },
        },
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('pre-test-post');
    });

    it('should work without suffix', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'fooProcess',
          arguments: {
            input: 'test',
            prefix: 'pre-',
          },
        },
      });

      expect(result.content[0].text).toBe('pre-test');
    });
  });

  describe('fooTransform Tool', () => {
    it('should transform array with uppercase', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'fooTransform',
          arguments: {
            data: ['hello', 'world'],
            transformType: 'uppercase',
          },
        },
      });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(['HELLO', 'WORLD']);
    });

    it('should handle reverse transformation', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'fooTransform',
          arguments: {
            data: ['abc', 'def'],
            transformType: 'reverse',
          },
        },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(['cba', 'fed']);
    });
  });

  describe('fooFilter Tool', () => {
    it('should filter truthy values', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'fooFilter',
          arguments: {
            items: [1, 'test', 0, '', 'valid', null],
            filterType: 'truthy',
          },
        },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual([1, 'test', 'valid']);
    });

    it('should filter by string type', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'fooFilter',
          arguments: {
            items: [1, 'test', true, 'hello', 42],
            filterType: 'string',
          },
        },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(['test', 'hello']);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'unknownTool',
          arguments: {},
        },
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Unknown tool');
    });

    it('should handle invalid transform type', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callHandler: any;
      server.setRequestHandler = vi.fn((schema, handler) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      });

      await import('./index.js');

      const result = await callHandler({
        params: {
          name: 'fooTransform',
          arguments: {
            data: ['test'],
            transformType: 'invalid',
          },
        },
      });

      expect(result.content[0].text).toContain('Error');
    });
  });
});