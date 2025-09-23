import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { fooProcess, fooGreet, fooTransform, fooFilter } from '../../src/index';
let config;
let greetConfig;
let processor;
let processors;
let greeter;
let inputArray;
let originalArray;
let result;
let results;
let transformer;
let predicate;
// Foo Processing steps
Given('I have access to the foo processing functions', function () {
    // Functions are available through imports
});
Given('I have a config with prefix {string}', function (prefix) {
    config = { prefix };
});
Given('I have a config with prefix {string} and suffix {string}', function (prefix, suffix) {
    config = { prefix, suffix };
});
When('I process the input {string}', function (input) {
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
Then('the result should be {string}', function (expectedResult) {
    expect(result).toBe(expectedResult);
});
Then('all processors should behave identically', function () {
    const testInput = 'test';
    const firstResult = processors[0](testInput);
    for (const proc of processors) {
        expect(proc(testInput)).toBe(firstResult);
    }
});
Then('processing {string} should always return {string}', function (input, expectedOutput) {
    expect(processor(input)).toBe(expectedOutput);
});
// Foo Greeting steps
Given('I have access to the foo greeting functions', function () {
    // Functions are available through imports
});
Given('I have a greeting config with prefix {string}', function (prefix) {
    greetConfig = { prefix };
});
When('I greet {string}', function (name) {
    greeter = fooGreet(greetConfig);
    result = greeter(name);
});
Then('the result should contain the shared greeting format', function () {
    expect(typeof result).toBe('string');
    expect(result).toMatch(/Hello, .+!|Error: Name cannot be empty/);
});
Then('the result should start with {string}', function (prefix) {
    expect(result.startsWith(prefix)).toBe(true);
});
// Data Operations steps
Given('I have access to the foo data operation functions', function () {
    // Functions are available through imports
});
Given('I have an array {string}', function (arrayString) {
    inputArray = JSON.parse(arrayString);
    originalArray = [...inputArray];
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
    transformer = (item) => item.toUpperCase();
    result = fooTransform(inputArray, transformer);
});
When('I transform it with a function that adds {string}', function (suffix) {
    transformer = (item) => item + suffix;
    result = fooTransform(inputArray, transformer);
});
When('I filter it for even numbers', function () {
    predicate = (n) => n % 2 === 0;
    result = fooFilter(inputArray, predicate);
});
When('I filter it for items containing {string}', function (searchText) {
    predicate = (s) => s.includes(searchText);
    result = fooFilter(inputArray, predicate);
});
When('I transform and filter the array', function () {
    // Transform first
    const transformed = fooTransform(inputArray, (item) => item.toUpperCase());
    // Then filter
    result = fooFilter(transformed, (item) => item.length > 3);
});
When('I transform it with any function', function () {
    transformer = (item) => item + '_transformed';
    result = fooTransform(inputArray, transformer);
});
When('I filter it with any predicate', function () {
    predicate = () => true;
    result = fooFilter(inputArray, predicate);
});
Then('the result should be {string}', function (expectedArray) {
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
//# sourceMappingURL=foo.steps.js.map