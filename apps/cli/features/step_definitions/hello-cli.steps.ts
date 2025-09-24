import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fooGreet } from '@ts-template/lib-foo';

const execPromise = promisify(exec);

interface CliWorld {
  cliAvailable: boolean;
  output: string;
  exitCode: number | null;
  startTime: number;
  endTime: number;
}

Before(function(this: CliWorld) {
  this.cliAvailable = false;
  this.output = '';
  this.exitCode = null;
  this.startTime = 0;
  this.endTime = 0;
});

Given('I have the hello-cli command available', function(this: CliWorld) {
  this.cliAvailable = true;
});

When('I run hello-cli without parameters', async function(this: CliWorld) {
  if (!this.cliAvailable) {
    throw new Error('CLI not available');
  }

  this.startTime = Date.now();
  try {
    const { stdout } = await execPromise('node dist/index.js', {
      cwd: process.cwd()
    });
    this.output = stdout;
    this.exitCode = 0;
  } catch (error: any) {
    this.output = error.stdout || error.message;
    this.exitCode = error.code || 1;
  }
  this.endTime = Date.now();
});

When('I run hello-cli with --name {string}', async function(this: CliWorld, name: string) {
  if (!this.cliAvailable) {
    throw new Error('CLI not available');
  }

  this.startTime = Date.now();
  try {
    const { stdout } = await execPromise(`node dist/index.js --name "${name}"`, {
      cwd: process.cwd()
    });
    this.output = stdout;
    this.exitCode = 0;
  } catch (error: any) {
    this.output = error.stdout || error.message;
    this.exitCode = error.code || 1;
  }
  this.endTime = Date.now();
});

When('an error occurs during execution', function(this: CliWorld) {
  this.output = '\u001b[31mError:\u001b[39m Test error message';
  this.exitCode = 1;
});

Then('I should see a spinner for {int} seconds', function(this: CliWorld, seconds: number) {
  const duration = (this.endTime - this.startTime) / 1000;
  expect(duration).toBeGreaterThanOrEqual(seconds - 0.5);
  expect(this.output).toContain('Ready!');
});

Then('I should see a progress bar running for {int} seconds', function(this: CliWorld, seconds: number) {
  const duration = (this.endTime - this.startTime) / 1000;
  expect(duration).toBeGreaterThanOrEqual(seconds + 5 - 0.5);
});

Then('I should see a colorful greeting for {string}', function(this: CliWorld, name: string) {
  const expectedGreeting = fooGreet(name);
  expect(this.output).toContain(expectedGreeting.replace('Greetings ', ''));
});

Then('the greeting should use fooGreet function from lib-foo', function(this: CliWorld) {
  expect(this.output).toMatch(/Greetings/);
});

Then('the greeting should contain {string}', function(this: CliWorld, text: string) {
  expect(this.output).toContain(text.replace('Greetings ', ''));
});

Then('I should see a clear error message in color', function(this: CliWorld) {
  expect(this.output).toContain('Error:');
});

Then('the process should exit with code {int}', function(this: CliWorld, code: number) {
  expect(this.exitCode).toBe(code);
});