import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { greet, formatDate } from '../../src/index';

import type { CommonWorld } from '@ts-template/cucumber-shared';

interface SharedWorld extends CommonWorld {
  greetFunction?: typeof greet;
  formatDateFunction?: typeof formatDate;
  inputDate?: Date;
  originalDateString?: string;
}

// Greet function steps
Given('I have access to the shared greet function', function (this: SharedWorld) {
  this.greetFunction = greet;
});

When('I call greet with {string}', function (this: SharedWorld, name: string) {
  this.result = this.greetFunction!(name);
});

When('I call greet with {string} multiple times', function (this: SharedWorld, name: string) {
  this.results = [];
  for (let i = 0; i < 5; i++) {
    this.results.push(this.greetFunction!(name));
  }
  this.result = this.results[0] || '';
});

// Using shared "Then('the result should be {string}')" step from cucumber-shared

// Using shared "Then('all results should be identical')" step from cucumber-shared
// Note: The shared step uses assert.deepEqual instead of expect().toBe()

// Date formatting function steps
Given('I have access to the shared formatDate function', function (this: SharedWorld) {
  this.formatDateFunction = formatDate;
});

Given('I have a date {string}', function (this: SharedWorld, dateString: string) {
  this.inputDate = new Date(dateString);
  this.originalDateString = this.inputDate.toISOString();
});

Given('I have a date object', function (this: SharedWorld) {
  this.inputDate = new Date('2024-06-15T14:30:00Z');
  this.originalDateString = this.inputDate.toISOString();
});

When('I call formatDate with that date', function (this: SharedWorld) {
  this.result = this.formatDateFunction!(this.inputDate!);
});

When('I call formatDate with that date multiple times', function (this: SharedWorld) {
  this.results = [];
  for (let i = 0; i < 5; i++) {
    this.results.push(this.formatDateFunction!(this.inputDate!));
  }
  this.result = this.results[0] || '';
});

Then('the original date object should remain unchanged', function (this: SharedWorld) {
  expect(this.inputDate!.toISOString()).toBe(this.originalDateString);
});

Then('the function should not modify its input', function (this: SharedWorld) {
  // This is enforced by TypeScript readonly parameter
  // We verify the date hasn't changed
  expect(this.inputDate!.toISOString()).toBe(this.originalDateString);
});