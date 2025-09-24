import { Given, When, Then } from '@cucumber/cucumber';
import { execSync } from 'child_process';
import { expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(__dirname, '../../dist/index.js');

let commandOutput: string = '';
let exitCode: number = 0;
let startTime: number = 0;
let endTime: number = 0;

function unimplemented(step: string): never {
  throw new Error(`UNIMPLEMENTED_STEP: ${step} — please implement.`);
}

Given('the hello-cli is installed and available', function () {
  // In a real scenario, we would verify the CLI is built and available
  // For now, we assume it's available after build
  try {
    execSync('pnpm build', { cwd: path.join(__dirname, '../..') });
  } catch (error) {
    console.error('Failed to build CLI:', error);
    throw error;
  }
});

When('I run {string} without any arguments', function (command: string) {
  startTime = Date.now();
  try {
    commandOutput = execSync(`node ${cliPath}`, { encoding: 'utf8' });
    exitCode = 0;
  } catch (error: any) {
    commandOutput = error.stdout || error.message;
    exitCode = error.status || 1;
  }
  endTime = Date.now();
});

When('I run {string}', function (command: string) {
  startTime = Date.now();
  const args = command.replace('hello-cli', '').trim();
  try {
    commandOutput = execSync(`node ${cliPath} ${args}`, { encoding: 'utf8' });
    exitCode = 0;
  } catch (error: any) {
    commandOutput = error.stdout || error.message;
    exitCode = error.status || 1;
  }
  endTime = Date.now();
});

Then('I should see a spinner for about {int} seconds', function (seconds: number) {
  // In integration tests, we verify the total execution time includes spinner time
  const executionTime = (endTime - startTime) / 1000;
  expect(executionTime).toBeGreaterThanOrEqual(seconds - 0.5);
  expect(commandOutput).toContain('Ready!');
});

Then('I should see a progress bar running for about {int} seconds', function (seconds: number) {
  // The total execution time should be at least spinner + progress bar time
  const executionTime = (endTime - startTime) / 1000;
  expect(executionTime).toBeGreaterThanOrEqual(8 - 0.5); // 5s spinner + 3s progress
});

Then('I should see a colorful greeting for {string} in a box', function (name: string) {
  // We can't easily test for colors in the output, but we can check for the box characters
  expect(commandOutput).toContain('╔');
  expect(commandOutput).toContain('╗');
  expect(commandOutput).toContain('╚');
  expect(commandOutput).toContain('╝');
  expect(commandOutput).toContain('Hello CLI');
});

Then('the greeting should contain {string}', function (expectedText: string) {
  // Remove ANSI color codes for text comparison
  const cleanOutput = commandOutput.replace(/\x1b\[[0-9;]*m/g, '');
  expect(cleanOutput).toContain(expectedText);
});

Then('the exit code should be {int}', function (expectedCode: number) {
  expect(exitCode).toBe(expectedCode);
});

Then('I should see an error message for empty name', function () {
  const cleanOutput = commandOutput.replace(/\x1b\[[0-9;]*m/g, '');
  expect(cleanOutput).toContain('Error: Name cannot be empty');
});

Then('I should see usage information', function () {
  expect(commandOutput).toContain('--name');
  expect(commandOutput).toContain('Name to greet');
});

Then('the output should mention the --name option', function () {
  expect(commandOutput).toContain('--name');
});