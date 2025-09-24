import { Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';

// String assertions
Then('the result should start with {string}', function (prefix: string) {
    const result = (this as any).result;
    assert.ok(result.startsWith(prefix), `Expected result to start with "${prefix}" but got "${result}"`);
});

Then('the result should end with {string}', function (suffix: string) {
    const result = (this as any).result;
    assert.ok(result.endsWith(suffix), `Expected result to end with "${suffix}" but got "${result}"`);
});

Then('the result should contain {string}', function (substring: string) {
    const result = (this as any).result;
    assert.ok(result.includes(substring), `Expected result to contain "${substring}" but got "${result}"`);
});

Then('the result should match pattern {string}', function (pattern: string) {
    const result = (this as any).result;
    const regex = new RegExp(pattern);
    assert.match(result, regex, `Expected result to match pattern "${pattern}" but got "${result}"`);
});

// Numeric assertions
Then('the result should be greater than {int}', function (value: number) {
    const result = (this as any).result;
    assert.ok(result > value, `Expected ${result} to be greater than ${value}`);
});

Then('the result should be less than {int}', function (value: number) {
    const result = (this as any).result;
    assert.ok(result < value, `Expected ${result} to be less than ${value}`);
});

Then('the result should be between {int} and {int}', function (min: number, max: number) {
    const result = (this as any).result;
    assert.ok(result >= min && result <= max, `Expected ${result} to be between ${min} and ${max}`);
});

// Array assertions
Then('the result should have {int} items', function (count: number) {
    const result = (this as any).result;
    assert.equal(result.length, count, `Expected ${count} items but got ${result.length}`);
});

Then('the result should include {string}', function (item: string) {
    const result = (this as any).result;
    const parsedItem = item.includes('[') || item.includes('{') ? JSON.parse(item) : item;
    assert.ok(result.includes(parsedItem), `Expected array to include ${item}`);
});

Then('the result should not be empty', function () {
    const result = (this as any).result;
    if (Array.isArray(result)) {
        assert.ok(result.length > 0, 'Expected array not to be empty');
    } else if (typeof result === 'string') {
        assert.ok(result.length > 0, 'Expected string not to be empty');
    } else if (typeof result === 'object' && result !== null) {
        assert.ok(Object.keys(result).length > 0, 'Expected object not to be empty');
    }
});

// Boolean assertions
Then('the result should be true', function () {
    const result = (this as any).result;
    assert.strictEqual(result, true);
});

Then('the result should be false', function () {
    const result = (this as any).result;
    assert.strictEqual(result, false);
});

Then('the result should be truthy', function () {
    const result = (this as any).result;
    assert.ok(result);
});

Then('the result should be falsy', function () {
    const result = (this as any).result;
    assert.ok(!result);
});

// Null/undefined assertions
Then('the result should be null', function () {
    const result = (this as any).result;
    assert.strictEqual(result, null);
});

Then('the result should be undefined', function () {
    const result = (this as any).result;
    assert.strictEqual(result, undefined);
});

Then('the result should be defined', function () {
    const result = (this as any).result;
    assert.notEqual(result, undefined);
});