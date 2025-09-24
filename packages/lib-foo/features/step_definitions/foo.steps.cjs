const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

let fooLib;

// Data operations context
let inputArray = [];
let originalArray = [];
let result = null;

// Processing context
let config = null;
let processor = null;
let processors = [];

// Data Operations Steps
Given('I have access to the foo data operation functions', async function () {
  // Dynamic import for ES module
  fooLib = await import('../../dist/src/index.js');
  assert(typeof fooLib.fooTransform === 'function');
  assert(typeof fooLib.fooFilter === 'function');
});

Given('I have an array {string}', function (arrayString) {
  inputArray = JSON.parse(arrayString);
  originalArray = [...inputArray]; // Keep copy of original
});

Given('I have a number array {string}', function (arrayString) {
  inputArray = JSON.parse(arrayString);
  originalArray = [...inputArray];
});

Given('I have a string array {string}', function (arrayString) {
  inputArray = JSON.parse(arrayString);
  originalArray = [...inputArray];
});

Given('I have an empty array', function () {
  inputArray = [];
  originalArray = [];
});

When('I transform it with uppercase function', function () {
  result = fooLib.fooTransform(inputArray, (str) => str.toUpperCase());
});

When('I transform it with a function that adds {string}', function (suffix) {
  result = fooLib.fooTransform(inputArray, (str) => str + suffix);
});

When('I filter it for even numbers', function () {
  result = fooLib.fooFilter(inputArray, (num) => num % 2 === 0);
});

When('I filter it for items containing {string}', function (searchText) {
  result = fooLib.fooFilter(inputArray, (str) => str.includes(searchText));
});

When('I transform and filter the array', function () {
  // Transform to uppercase
  const transformed = fooLib.fooTransform(inputArray, (str) => str.toUpperCase());
  // Filter for items longer than 4 characters
  result = fooLib.fooFilter(transformed, (str) => str.length > 4);
});

When('I transform it with any function', function () {
  result = fooLib.fooTransform(inputArray, (x) => x);
});

When('I filter it with any predicate', function () {
  result = fooLib.fooFilter(inputArray, () => true);
});

Then('the result should be {string}', function (expectedString) {
  const expected = JSON.parse(expectedString);
  assert.deepEqual(result, expected);
});

Then('the original array should remain unchanged', function () {
  assert.deepEqual(inputArray, originalArray, 'Original array was modified');
});

Then('the functions should return new arrays', function () {
  assert.notEqual(result, inputArray, 'Function returned the same array reference');
});

Then('the result should be an empty array', function () {
  assert(Array.isArray(result));
  assert.equal(result.length, 0);
});

// Processing Steps
Given('I have access to the foo processing functions', async function () {
  if (!fooLib) {
    fooLib = await import('../../dist/src/index.js');
  }
  assert(typeof fooLib.fooProcess === 'function');
  assert(typeof fooLib.createFooProcessor === 'function');
});

Given('I have a config with prefix {string}', function (prefix) {
  config = { prefix };
});

Given('I have a config with prefix {string} and suffix {string}', function (prefix, suffix) {
  config = { prefix, suffix };
});

When('I create a processor with this config', function () {
  if (!config) throw new Error('Config not set');
  processor = fooLib.createFooProcessor(config);
});

When('I process the input {string}', function (input) {
  if (!processor) throw new Error('Processor not created');
  result = processor.process(input);
});

When('I create processors with this config multiple times', function () {
  if (!config) throw new Error('Config not set');
  processors = [
    fooLib.createFooProcessor(config),
    fooLib.createFooProcessor(config),
    fooLib.createFooProcessor(config)
  ];
});

Then('all processors should behave identically', function () {
  assert(processors.length >= 2, 'Need at least 2 processors to compare');

  const testInput = 'test';
  const results = processors.map(p => p.process(testInput));

  // All results should be identical
  const firstResult = results[0];
  results.forEach((result, index) => {
    assert.equal(result, firstResult, `Processor ${index} returned different result`);
  });
});

Then('processing {string} should always return {string}', function (input, expected) {
  processors.forEach((proc, index) => {
    const result = proc.process(input);
    assert.equal(result, expected, `Processor ${index} returned unexpected result`);
  });
});