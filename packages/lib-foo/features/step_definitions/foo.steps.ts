import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import {
  fooProcess,
  fooGreet,
  fooTransform,
  fooFilter,
  type FooConfig
} from '../../src/index';

let config: FooConfig;
let greetConfig: FooConfig;
let processor: (input: string) => string;
let processors: Array<(input: string) => string>;
let greeter: (name: string) => string;
let inputArray: readonly string[] | readonly number[];
let originalArray: readonly string[] | readonly number[];
let result: string | readonly string[] | readonly number[];
let transformer: (value: any) => any;
let predicate: (value: any) => boolean;

// Foo Processing steps
Given('I have access to the foo processing functions', function () {
  // Functions are available through imports
});

Given('I have a config with prefix {string}', function (prefix: string) {
  config = { prefix };
});

Given('I have a config with prefix {string} and suffix {string}', function (prefix: string, suffix: string) {
  config = { prefix, suffix };
});

When('I process the input {string}', function (input: string) {
  processor = fooProcess(config);
  result = processor(input);
});

When('I create processors with this config multiple times', function () {
  processors = [];
  for (let i = 0; i < 5; i++) {
    processors.push(fooProcess(config));
  }
  processor = processors[0];
});

Then('the result should be {string}', function (expectedResult: string) {
  expect(result).toBe(expectedResult);
});

Then('all processors should behave identically', function () {
  const testInput = 'test';
  const firstResult = processors[0](testInput);
  for (const proc of processors) {
    expect(proc(testInput)).toBe(firstResult);
  }
});

Then('processing {string} should always return {string}', function (input: string, expectedOutput: string) {
  expect(processor(input)).toBe(expectedOutput);
});

// Foo Greeting steps
Given('I have access to the foo greeting functions', function () {
  // Functions are available through imports
});

Given('I have a greeting config with prefix {string}', function (prefix: string) {
  greetConfig = { prefix };
});

When('I greet {string}', function (name: string) {
  greeter = fooGreet(greetConfig);
  result = greeter(name);
});

Then('the result should contain the shared greeting format', function () {
  expect(typeof result).toBe('string');
  expect(result as string).toMatch(/Hello, .+!|Error: Name cannot be empty/);
});

Then('the result should start with {string}', function (prefix: string) {
  expect((result as string).startsWith(prefix)).toBe(true);
});

// Data Operations steps
Given('I have access to the foo data operation functions', function () {
  // Functions are available through imports
});

Given('I have an array {string}', function (arrayString: string) {
  const parsed = JSON.parse(arrayString);
  inputArray = parsed as readonly string[] | readonly number[];
  originalArray = [...inputArray];
});

Given('I have a number array {string}', function (arrayString: string) {
  const parsed = JSON.parse(arrayString);
  inputArray = parsed as readonly number[];
  originalArray = [...inputArray];
});

Given('I have a string array {string}', function (arrayString: string) {
  const parsed = JSON.parse(arrayString);
  inputArray = parsed as readonly string[];
  originalArray = [...inputArray];
});

Given('I have an empty array', function () {
  inputArray = [];
  originalArray = [];
});

When('I transform it with uppercase function', function () {
  transformer = (item: string) => item.toUpperCase();
  result = fooTransform(inputArray as readonly string[], transformer);
});

When('I transform it with a function that adds {string}', function (suffix: string) {
  transformer = (item: string) => item + suffix;
  result = fooTransform(inputArray as readonly string[], transformer);
});

When('I filter it for even numbers', function () {
  predicate = (n: number) => n % 2 === 0;
  result = fooFilter(inputArray as readonly number[], predicate);
});

When('I filter it for items containing {string}', function (searchText: string) {
  predicate = (s: string) => s.includes(searchText);
  result = fooFilter(inputArray as readonly string[], predicate);
});

When('I transform and filter the array', function () {
  // Transform first
  const transformed = fooTransform(inputArray as readonly string[], (item: string) => item.toUpperCase());
  // Then filter
  result = fooFilter(transformed, (item: string) => item.length > 3);
});

When('I transform it with any function', function () {
  transformer = (item: any) => item + '_transformed';
  result = fooTransform(inputArray as readonly any[], transformer);
});

When('I filter it with any predicate', function () {
  predicate = () => true;
  result = fooFilter(inputArray as readonly any[], predicate);
});

Then('the result should be {string}', function (expectedArray: string) {
  const expected = JSON.parse(expectedArray);
  expect(result).toEqual(expected);
});

Then('the original array should remain unchanged', function () {
  expect(inputArray).toEqual(originalArray);
});

Then('the functions should return new arrays', function () {
  expect(result).not.toBe(inputArray);
});

Then('the result should be an empty array', function () {
  expect(result).toEqual([]);
});