import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { DataOperationsContext } from '../types';

// Common steps for array and data operations
Given('I have an array {string}', function (this: DataOperationsContext, arrayString: string) {
  this.inputArray = JSON.parse(arrayString);
  this.originalArray = [...this.inputArray];
});

Given('I have a number array {string}', function (this: DataOperationsContext, arrayString: string) {
  this.inputArray = JSON.parse(arrayString);
  this.originalArray = [...this.inputArray];
});

Given('I have a string array {string}', function (this: DataOperationsContext, arrayString: string) {
  this.inputArray = JSON.parse(arrayString);
  this.originalArray = [...this.inputArray];
});

Given('I have an empty array', function (this: DataOperationsContext) {
  this.inputArray = [];
  this.originalArray = [];
});

// Common immutability assertions for arrays
Then('the original array should remain unchanged', function (this: DataOperationsContext) {
  assert.deepEqual(this.inputArray, this.originalArray);
});

Then('the functions should return new arrays', function (this: DataOperationsContext) {
  assert.notEqual(this.result, this.inputArray);
});

// Common transformation steps (can be customized with specific functions)
When('I transform it with any function', function (this: DataOperationsContext) {
  this.transformer = (item: any) => item + '_transformed';
  // Note: Actual transformation is done in package-specific steps
});

When('I filter it with any predicate', function (this: DataOperationsContext) {
  this.predicate = () => true;
  // Note: Actual filtering is done in package-specific steps
});

// Date-related common steps
Given('I have a date {string}', function (this: DataOperationsContext, dateString: string) {
  const date = new Date(dateString);
  this.originalArray = [date.toISOString()]; // Store original state
  this.inputArray = [date];
});

Given('I have a date object', function (this: DataOperationsContext) {
  const date = new Date('2024-06-15T14:30:00Z');
  this.originalArray = [date.toISOString()];
  this.inputArray = [date];
});

Then('the original date object should remain unchanged', function (this: DataOperationsContext) {
  if (this.inputArray && this.originalArray) {
    const date = this.inputArray[0];
    assert.equal(date.toISOString(), this.originalArray[0]);
  }
});

Then('the function should not modify its input', function (this: DataOperationsContext) {
  // This is enforced by TypeScript readonly parameter
  // We verify the data hasn't changed
  if (this.inputArray && this.originalArray) {
    if (this.inputArray[0] instanceof Date) {
      assert.equal(this.inputArray[0].toISOString(), this.originalArray[0]);
    } else {
      assert.deepEqual(this.inputArray, this.originalArray);
    }
  }
});