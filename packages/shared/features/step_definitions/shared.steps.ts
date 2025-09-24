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
// Note: "I have access to" step is now in cucumber-shared package
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

// Note: "the result should be" step is now in cucumber-shared package
// Keeping this for now to avoid breaking tests - will be removed after updating cucumber config

// Note: "all results should be identical" step is now in cucumber-shared package
// Keeping this for now to avoid breaking tests - will be removed after updating cucumber config

// Date formatting function steps
// Note: "I have access to" step is now in cucumber-shared package
Given('I have access to the shared formatDate function', function () {
  formatDateFunction = formatDate;
});

// Note: Date initialization steps are now in cucumber-shared package
// Keeping package-specific implementation
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

// Note: Date immutability assertions are now in cucumber-shared package
// Keeping this for now to avoid breaking tests - will be removed after updating cucumber config