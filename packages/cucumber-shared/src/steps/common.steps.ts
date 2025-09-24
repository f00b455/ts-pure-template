import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';

// Generic "I have access to" step that can be used by any module
Given('I have access to the {word} functions', function (moduleName: string) {
    // Generic implementation - functions are available through imports
    // This step primarily serves as documentation that the module is available
});

Given('I have access to the {word} {word} functions', function (moduleType: string, moduleName: string) {
    // Generic implementation for compound module names
    // e.g., "shared greet functions", "foo processing functions"
});

Given('I have access to the {word} {word}', function (moduleType: string, moduleName: string) {
    // Generic implementation for simple access steps
    // e.g., "shared formatDate function"
});

// Common result assertion that handles both strings and arrays
Then('the result should be {string}', function (expectedResult: string) {
    // Intelligently handle both array and string results
    const result = (this as any).result;

    if (Array.isArray(result)) {
        const expected = JSON.parse(expectedResult);
        assert.deepEqual(result, expected);
    } else {
        assert.equal(result, expectedResult);
    }
});

// Common state management steps
When('I call it multiple times', function () {
    const func = (this as any).currentFunction;
    const args = (this as any).currentArgs || [];
    const results: any[] = [];

    for (let i = 0; i < 5; i++) {
        results.push(func(...args));
    }

    (this as any).results = results;
    (this as any).result = results[0];
});

Then('all results should be identical', function () {
    const results = (this as any).results;
    const firstResult = results[0];

    if (firstResult !== undefined) {
        for (const res of results) {
            assert.deepEqual(res, firstResult);
        }
    }
});

// Common array result step
Then('the array result should be {string}', function (expectedArray: string) {
    const result = (this as any).result;
    const expected = JSON.parse(expectedArray);
    assert.deepEqual(result, expected);
});

// Empty array assertion
Then('the result should be an empty array', function () {
    const result = (this as any).result;
    assert.deepEqual(result, []);
});

// Type checking steps
Then('the result should be a string', function () {
    const result = (this as any).result;
    assert.equal(typeof result, 'string');
});

Then('the result should be an array', function () {
    const result = (this as any).result;
    assert.ok(Array.isArray(result));
});

Then('the result should be a number', function () {
    const result = (this as any).result;
    assert.equal(typeof result, 'number');
});

Then('the result should be an object', function () {
    const result = (this as any).result;
    assert.equal(typeof result, 'object');
    assert.ok(result !== null);
});