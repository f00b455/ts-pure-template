import { Given, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';

// Array initialization steps
Given('I have an array {string}', function (arrayString: string) {
    const inputArray = JSON.parse(arrayString);
    (this as any).inputArray = inputArray;
    (this as any).originalArray = [...inputArray];
});

Given('I have a number array {string}', function (arrayString: string) {
    const inputArray = JSON.parse(arrayString);
    (this as any).inputArray = inputArray;
    (this as any).originalArray = [...inputArray];
});

Given('I have a string array {string}', function (arrayString: string) {
    const inputArray = JSON.parse(arrayString);
    (this as any).inputArray = inputArray;
    (this as any).originalArray = [...inputArray];
});

Given('I have an empty array', function () {
    (this as any).inputArray = [];
    (this as any).originalArray = [];
});

// Object initialization steps
Given('I have an object {string}', function (objectString: string) {
    const inputObject = JSON.parse(objectString);
    (this as any).inputObject = inputObject;
    (this as any).originalObject = { ...inputObject };
});

Given('I have an empty object', function () {
    (this as any).inputObject = {};
    (this as any).originalObject = {};
});

// Data immutability assertions
Then('the original array should remain unchanged', function () {
    const inputArray = (this as any).inputArray;
    const originalArray = (this as any).originalArray;
    assert.deepEqual(inputArray, originalArray, 'Original array was modified');
});

Then('the original object should remain unchanged', function () {
    const inputObject = (this as any).inputObject;
    const originalObject = (this as any).originalObject;
    assert.deepEqual(inputObject, originalObject, 'Original object was modified');
});

Then('the input should remain unchanged', function () {
    // Generic immutability check
    if ((this as any).originalArray !== undefined) {
        assert.deepEqual((this as any).inputArray, (this as any).originalArray);
    } else if ((this as any).originalObject !== undefined) {
        assert.deepEqual((this as any).inputObject, (this as any).originalObject);
    }
});

// Reference checks
Then('the functions should return new arrays', function () {
    const result = (this as any).result;
    const inputArray = (this as any).inputArray;
    assert.notEqual(result, inputArray, 'Function returned same array reference');
});

Then('the result should be a new array', function () {
    const result = (this as any).result;
    const inputArray = (this as any).inputArray;
    assert.notEqual(result, inputArray, 'Result is not a new array');
});

Then('the result should be a new object', function () {
    const result = (this as any).result;
    const inputObject = (this as any).inputObject;
    assert.notEqual(result, inputObject, 'Result is not a new object');
});

// Data transformation helpers
Given('I have test data {string}', function (dataString: string) {
    const data = JSON.parse(dataString);
    (this as any).testData = data;
});

Then('the transformed result should be {string}', function (expectedString: string) {
    const result = (this as any).result;
    const expected = JSON.parse(expectedString);
    assert.deepEqual(result, expected);
});

// Sorting assertions
Then('the result should be sorted ascending', function () {
    const result = (this as any).result;
    const sorted = [...result].sort((a: any, b: any) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
        return 0;
    });
    assert.deepEqual(result, sorted, 'Result is not sorted ascending');
});

Then('the result should be sorted descending', function () {
    const result = (this as any).result;
    const sorted = [...result].sort((a: any, b: any) => {
        if (typeof a === 'number' && typeof b === 'number') return b - a;
        if (typeof a === 'string' && typeof b === 'string') return b.localeCompare(a);
        return 0;
    });
    assert.deepEqual(result, sorted, 'Result is not sorted descending');
});