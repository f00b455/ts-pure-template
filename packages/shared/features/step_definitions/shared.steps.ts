import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { greet, formatDate } from '../../src/index';

let greetFunction: typeof greet;
let formatDateFunction: typeof formatDate;
let result: string;
let results: string[];
let inputDate: Date;
let originalDateString: string;

// Greet function steps
Given('I have access to the shared greet function', function () {
  greetFunction = greet;
});

When('I call greet with {string}', function (name: string) {
  result = greetFunction(name);
});

When('I call greet with {string} multiple times', function (name: string) {
  results = [];
  for (let i = 0; i < 5; i++) {
    results.push(greetFunction(name));
  }
  result = results[0] || '';
});

Then('the result should be {string}', function (expectedResult: string) {
  expect(result).toBe(expectedResult);
});

Then('all results should be identical', function () {
  const firstResult = results[0];
  if (firstResult !== undefined) {
    for (const res of results) {
      expect(res).toBe(firstResult);
    }
  }
});

// Date formatting function steps
Given('I have access to the shared formatDate function', function () {
  formatDateFunction = formatDate;
});

Given('I have a date {string}', function (dateString: string) {
  inputDate = new Date(dateString);
  originalDateString = inputDate.toISOString();
});

Given('I have a date object', function () {
  inputDate = new Date('2024-06-15T14:30:00Z');
  originalDateString = inputDate.toISOString();
});

When('I call formatDate with that date', function () {
  result = formatDateFunction(inputDate);
});

When('I call formatDate with that date multiple times', function () {
  results = [];
  for (let i = 0; i < 5; i++) {
    results.push(formatDateFunction(inputDate));
  }
  result = results[0] || '';
});

Then('the original date object should remain unchanged', function () {
  expect(inputDate.toISOString()).toBe(originalDateString);
});

Then('the function should not modify its input', function () {
  // This is enforced by TypeScript readonly parameter
  // We verify the date hasn't changed
  expect(inputDate.toISOString()).toBe(originalDateString);
});