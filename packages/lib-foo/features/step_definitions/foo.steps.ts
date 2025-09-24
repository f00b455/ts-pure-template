import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { fooProcess, fooGreet, fooTransform, fooFilter } from '../../src/index';
// Note: Common steps are now imported from cucumber-shared package
// The following steps are package-specific and remain here

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

// Package-specific Foo Processing steps
// Note: "I have access to" and "config with prefix" steps are now in shared package

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

// Note: "the result should be" step is now in shared package

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
// Note: "I have access to" step is now in shared package

Given('I have a greeting config with prefix {string}', function (prefix: string) {
    greetConfig = { prefix };
});

When('I greet {string}', function (name: string) {
    greeter = fooGreet(greetConfig);
    result = greeter(name);
});

// Note: "result should contain" and "result should start with" steps are now in shared package

// Data Operations steps
// Note: Array initialization steps are now in shared package

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

// Note: Array assertion steps are now in shared package