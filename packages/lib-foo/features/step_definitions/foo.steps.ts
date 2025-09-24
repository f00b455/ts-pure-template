import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { fooProcess, fooGreet, fooTransform, fooFilter } from '../../src/index';

let config: any;
let greetConfig: any;
let processor: any;
let processors: any[];
let greeter: any;
let inputArray: any[];
let originalArray: any[];
let result: any;
let results: any;
let transformer: any;
let predicate: any;

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
    // For array results, parse JSON; for string results, compare directly
    if (Array.isArray(result)) {
        const expected = JSON.parse(expectedResult);
        assert.deepEqual(result, expected);
    } else {
        assert.equal(result, expectedResult);
    }
});

Then('all processors should behave identically', function () {
    const testInput = 'test';
    const firstResult = processors[0](testInput);
    for (const proc of processors) {
        assert.equal(proc(testInput), firstResult);
    }
});

Then('processing {string} should always return {string}', function (input: string, expectedOutput: string) {
    assert.equal(processor(input), expectedOutput);
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
    assert.equal(typeof result, 'string');
    assert.match(result, /Hello, .+!|Error: Name cannot be empty/);
});

Then('the result should start with {string}', function (prefix: string) {
    assert.ok(result.startsWith(prefix));
});

// Data Operations steps
Given('I have access to the foo data operation functions', function () {
    // Functions are available through imports
});

Given('I have an array {string}', function (arrayString: string) {
    inputArray = JSON.parse(arrayString);
    originalArray = [...inputArray];
});

Given('I have a number array {string}', function (arrayString: string) {
    inputArray = JSON.parse(arrayString);
    originalArray = [...inputArray];
});

Given('I have a string array {string}', function (arrayString: string) {
    inputArray = JSON.parse(arrayString);
    originalArray = [...inputArray];
});

Given('I have an empty array', function () {
    inputArray = [];
    originalArray = [];
});

When('I transform it with uppercase function', function () {
    transformer = (item: any) => item.toUpperCase();
    result = fooTransform(inputArray, transformer);
});

When('I transform it with a function that adds {string}', function (suffix: string) {
    transformer = (item: any) => item + suffix;
    result = fooTransform(inputArray, transformer);
});

When('I filter it for even numbers', function () {
    predicate = (n: number) => n % 2 === 0;
    result = fooFilter(inputArray, predicate);
});

When('I filter it for items containing {string}', function (searchText: string) {
    predicate = (s: any) => s.includes(searchText);
    result = fooFilter(inputArray, predicate);
});

When('I transform and filter the array', function () {
    // Transform first
    const transformed = fooTransform(inputArray, (item: any) => item.toUpperCase());
    // Then filter
    result = fooFilter(transformed, (item: any) => item.length > 3);
});

When('I transform it with any function', function () {
    transformer = (item: any) => item + '_transformed';
    result = fooTransform(inputArray, transformer);
});

When('I filter it with any predicate', function () {
    predicate = () => true;
    result = fooFilter(inputArray, predicate);
});

Then('the array result should be {string}', function (expectedArray: string) {
    const expected = JSON.parse(expectedArray);
    assert.deepEqual(result, expected);
});

Then('the original array should remain unchanged', function () {
    assert.deepEqual(inputArray, originalArray);
});

Then('the functions should return new arrays', function () {
    assert.notEqual(result, inputArray);
});

Then('the result should be an empty array', function () {
    assert.deepEqual(result, []);
});