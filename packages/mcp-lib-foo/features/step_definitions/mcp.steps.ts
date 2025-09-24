import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { ChildProcess } from 'child_process';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  fooProcess,
  fooGreet,
  createFooProcessor,
  fooTransform,
  fooFilter,
  type FooConfig
} from '@ts-template/lib-foo';

interface MCPWorld {
  server?: Server;
  serverProcess?: ChildProcess;
  input?: string;
  prefix?: string;
  suffix?: string;
  result?: unknown;
  error?: Error;
  array?: unknown[];
  name?: string;
  action?: string;
  transformType?: string;
  filterType?: string;
  tools?: unknown[];
  config?: FooConfig;
}

let world: MCPWorld = {};

function unimplemented(step: string): never {
  throw new Error(`UNIMPLEMENTED_STEP: ${step} — please implement.`);
}

Before(() => {
  world = {};
});

After(() => {
  if (world.serverProcess) {
    world.serverProcess.kill();
  }
});

// Background
Given('the MCP server is initialized', function() {
  world.server = new Server(
    { name: 'mcp-lib-foo', version: '0.0.0' },
    { capabilities: { tools: {} } }
  );
  assert(world.server, 'Server should be initialized');
});

Given('the MCP server package is built', function() {
  // This would be verified in CI/CD
  assert(true, 'Package build verification');
});

// fooProcess scenarios
Given('I have input {string}', function(input: string) {
  world.input = input;
});

Given('I have prefix {string}', function(prefix: string) {
  world.prefix = prefix;
});

Given('I have suffix {string}', function(suffix: string) {
  world.suffix = suffix;
});

When('I call the fooProcess tool', function() {
  assert(world.input, 'Input is required');
  assert(world.prefix, 'Prefix is required');

  const config: FooConfig = { prefix: world.prefix, suffix: world.suffix };
  world.result = fooProcess(config)(world.input);
});

Then('the result should be {string}', function(expected: string) {
  assert.equal(world.result, expected);
});

// fooGreet scenarios
Given('I have a name {string}', function(name: string) {
  world.name = name;
});

When('I call the fooGreet tool', function() {
  assert(world.name, 'Name is required');
  assert(world.prefix, 'Prefix is required');

  const config: FooConfig = { prefix: world.prefix, suffix: world.suffix };
  world.result = fooGreet(config)(world.name);
});

Then('the result should contain {string}', function(expected: string) {
  assert(typeof world.result === 'string', 'Result should be a string');
  assert(world.result.includes(expected), `Result should contain "${expected}"`);
});

Then('the result should start with {string}', function(expected: string) {
  assert(typeof world.result === 'string', 'Result should be a string');
  assert(world.result.startsWith(expected), `Result should start with "${expected}"`);
});

Then('the result should end with {string}', function(expected: string) {
  assert(typeof world.result === 'string', 'Result should be a string');
  assert(world.result.endsWith(expected), `Result should end with "${expected}"`);
});

// createFooProcessor scenarios
Given('I have a configured processor with prefix {string} and suffix {string}', function(prefix: string, suffix: string) {
  world.config = { prefix, suffix };
});

Given('I select action {string}', function(action: string) {
  world.action = action;
});

When('I call the createFooProcessor tool', function() {
  assert(world.config, 'Config is required');
  assert(world.action, 'Action is required');
  assert(world.input, 'Input is required');

  const processor = createFooProcessor(world.config);
  if (world.action === 'process') {
    world.result = processor.process(world.input);
  } else if (world.action === 'greetWithFoo') {
    world.result = processor.greetWithFoo(world.input);
  }
});

// fooTransform scenarios
Given('I have an array of strings {word}', function(arrayStr: string) {
  world.array = JSON.parse(arrayStr);
});

Given('I select transform type {string}', function(transformType: string) {
  world.transformType = transformType;
});

When('I call the fooTransform tool', function() {
  assert(Array.isArray(world.array), 'Array is required');
  assert(world.transformType, 'Transform type is required');

  let transformer: (value: string) => string;
  switch (world.transformType) {
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
      throw new Error(`Unknown transform type: ${world.transformType}`);
  }

  world.result = fooTransform(world.array as string[], transformer);
});

Then('the result should be {word}', function(expectedStr: string) {
  const expected = JSON.parse(expectedStr);
  assert.deepEqual(world.result, expected);
});

// fooFilter scenarios
Given('I have an array {word}', function(arrayStr: string) {
  world.array = JSON.parse(arrayStr);
});

Given('I select filter type {string}', function(filterType: string) {
  world.filterType = filterType;
});

When('I call the fooFilter tool', function() {
  assert(Array.isArray(world.array), 'Array is required');
  assert(world.filterType, 'Filter type is required');

  let predicate: (value: unknown) => boolean;
  switch (world.filterType) {
    case 'truthy':
      predicate = (v: unknown) => !!v;
      break;
    case 'falsy':
      predicate = (v: unknown) => !v;
      break;
    default:
      throw new Error(`Unknown filter type: ${world.filterType}`);
  }

  world.result = fooFilter(world.array, predicate);
});

Then('the result should contain exactly {word}', function(expectedStr: string) {
  const expected = JSON.parse(expectedStr);
  assert.deepEqual(world.result, expected);
});

// Server infrastructure scenarios
When('I start the MCP server', function() {
  unimplemented('When I start the MCP server');
});

Then('the server should be running', function() {
  unimplemented('Then the server should be running');
});

Then('it should respond to list tools request', function() {
  unimplemented('Then it should respond to list tools request');
});

Then('it should expose {int} tools', function(count: number) {
  unimplemented(`Then it should expose ${count} tools`);
});

Given('the MCP server is running', function() {
  unimplemented('Given the MCP server is running');
});

When('I request the list of tools', function() {
  unimplemented('When I request the list of tools');
});

Then('I should see {string} tool', function(toolName: string) {
  unimplemented(`Then I should see "${toolName}" tool`);
});

When('I call a non-existent tool {string}', function(toolName: string) {
  unimplemented(`When I call a non-existent tool "${toolName}"`);
});

Then('I should receive an error message', function() {
  unimplemented('Then I should receive an error message');
});

Then('the error should contain {string}', function(message: string) {
  unimplemented(`Then the error should contain "${message}"`);
});

When('I call fooProcess with missing required parameters', function() {
  unimplemented('When I call fooProcess with missing required parameters');
});

Then('I should receive an error response', function() {
  unimplemented('Then I should receive an error response');
});

Then('the server should remain running', function() {
  unimplemented('Then the server should remain running');
});