import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { fooProcess, fooGreet, fooTransform, fooFilter } from '../../src/index';
import type { CommonWorld } from '@ts-template/cucumber-shared';

// Extend the CommonWorld interface for package-specific state
interface FooWorld extends CommonWorld {
    config?: any;
    greetConfig?: any;
    processor?: any;
    processors?: any[];
    greeter?: any;
    transformer?: any;
    predicate?: any;
}

// Foo Processing steps
// Using shared "I have access to the {word} {word} functions" step from cucumber-shared

Given('I have a config with prefix {string}', function (this: FooWorld, prefix: string) {
    this.config = { prefix };
});

Given('I have a config with prefix {string} and suffix {string}', function (this: FooWorld, prefix: string, suffix: string) {
    this.config = { prefix, suffix };
});

When('I process the input {string}', function (this: FooWorld, input: string) {
    this.processor = fooProcess(this.config);
    this.result = this.processor(input);
});

When('I create processors with this config multiple times', function (this: FooWorld) {
    this.processors = [];
    for (let i = 0; i < 5; i++) {
        this.processors.push(fooProcess(this.config));
    }
    this.processor = this.processors[0];
});

// Using shared "Then('the result should be {string}')" step from cucumber-shared

Then('all processors should behave identically', function (this: FooWorld) {
    const testInput = 'test';
    const firstResult = this.processors![0](testInput);
    for (const proc of this.processors!) {
        assert.equal(proc(testInput), firstResult);
    }
});

Then('processing {string} should always return {string}', function (this: FooWorld, input: string, expectedOutput: string) {
    assert.equal(this.processor(input), expectedOutput);
});

// Foo Greeting steps
// Using shared "I have access to the {word} {word} functions" step from cucumber-shared

Given('I have a greeting config with prefix {string}', function (this: FooWorld, prefix: string) {
    this.greetConfig = { prefix };
});

When('I greet {string}', function (this: FooWorld, name: string) {
    this.greeter = fooGreet(this.greetConfig);
    this.result = this.greeter(name);
});

Then('the result should contain the shared greeting format', function (this: FooWorld) {
    assert.equal(typeof this.result, 'string');
    assert.match(this.result, /Hello, .+!|Error: Name cannot be empty/);
});

// Using shared "Then('the result should start with {string}')" step from cucumber-shared

// Data Operations steps
// Using shared "I have access to the {word} {word} {word} functions" step from cucumber-shared

// Using shared "Given('I have an array {string}')" step from cucumber-shared
// The shared step sets this.inputArray and this.originalArray

// Using shared "Given('I have a number array {string}')" step from cucumber-shared

// Using shared "Given('I have a string array {string}')" step from cucumber-shared

// Using shared "Given('I have an empty array')" step from cucumber-shared

When('I transform it with uppercase function', function (this: FooWorld) {
    this.transformer = (item: any) => item.toUpperCase();
    this.result = fooTransform(this.inputArray!, this.transformer);
});

When('I transform it with a function that adds {string}', function (this: FooWorld, suffix: string) {
    this.transformer = (item: any) => item + suffix;
    this.result = fooTransform(this.inputArray!, this.transformer);
});

When('I filter it for even numbers', function (this: FooWorld) {
    this.predicate = (n: number) => n % 2 === 0;
    this.result = fooFilter(this.inputArray!, this.predicate);
});

When('I filter it for items containing {string}', function (this: FooWorld, searchText: string) {
    this.predicate = (s: any) => s.includes(searchText);
    this.result = fooFilter(this.inputArray!, this.predicate);
});

When('I transform and filter the array', function (this: FooWorld) {
    // Transform first
    const transformed = fooTransform(this.inputArray!, (item: any) => item.toUpperCase());
    // Then filter
    this.result = fooFilter(transformed, (item: any) => item.length > 3);
});

When('I transform it with any function', function (this: FooWorld) {
    this.transformer = (item: any) => item + '_transformed';
    this.result = fooTransform(this.inputArray!, this.transformer);
});

When('I filter it with any predicate', function (this: FooWorld) {
    this.predicate = () => true;
    this.result = fooFilter(this.inputArray!, this.predicate);
});

// Using shared "Then('the array result should be {string}')" step from cucumber-shared

// Using shared "Then('the original array should remain unchanged')" step from cucumber-shared

// Using shared "Then('the functions should return new arrays')" step from cucumber-shared

// Using shared "Then('the result should be an empty array')" step from cucumber-shared