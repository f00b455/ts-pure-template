"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const index_js_1 = require("../../src/index.js");
const assert_1 = __importDefault(require("assert"));
// Data operations context
let inputArray = [];
let originalArray = [];
let result = null;
// Processing context
let config = null;
let processor = null;
let processors = [];
// Data Operations Steps
(0, cucumber_1.Given)('I have access to the foo data operation functions', function () {
    // Functions are available via imports - no setup needed
    (0, assert_1.default)(typeof index_js_1.fooTransform === 'function');
    (0, assert_1.default)(typeof index_js_1.fooFilter === 'function');
});
(0, cucumber_1.Given)('I have an array {string}', function (arrayString) {
    inputArray = JSON.parse(arrayString);
    originalArray = [...inputArray]; // Keep copy of original
});
(0, cucumber_1.Given)('I have a number array {string}', function (arrayString) {
    inputArray = JSON.parse(arrayString);
    originalArray = [...inputArray];
});
(0, cucumber_1.Given)('I have a string array {string}', function (arrayString) {
    inputArray = JSON.parse(arrayString);
    originalArray = [...inputArray];
});
(0, cucumber_1.Given)('I have an empty array', function () {
    inputArray = [];
    originalArray = [];
});
(0, cucumber_1.When)('I transform it with uppercase function', function () {
    result = (0, index_js_1.fooTransform)(inputArray, (str) => str.toUpperCase());
});
(0, cucumber_1.When)('I transform it with a function that adds {string}', function (suffix) {
    result = (0, index_js_1.fooTransform)(inputArray, (str) => str + suffix);
});
(0, cucumber_1.When)('I filter it for even numbers', function () {
    result = (0, index_js_1.fooFilter)(inputArray, (num) => num % 2 === 0);
});
(0, cucumber_1.When)('I filter it for items containing {string}', function (searchText) {
    result = (0, index_js_1.fooFilter)(inputArray, (str) => str.includes(searchText));
});
(0, cucumber_1.When)('I transform and filter the array', function () {
    // Transform to uppercase
    const transformed = (0, index_js_1.fooTransform)(inputArray, (str) => str.toUpperCase());
    // Filter for items longer than 4 characters
    result = (0, index_js_1.fooFilter)(transformed, (str) => str.length > 4);
});
(0, cucumber_1.When)('I transform it with any function', function () {
    result = (0, index_js_1.fooTransform)(inputArray, (x) => x);
});
(0, cucumber_1.When)('I filter it with any predicate', function () {
    result = (0, index_js_1.fooFilter)(inputArray, () => true);
});
(0, cucumber_1.Then)('the result should be {string}', function (expectedString) {
    const expected = JSON.parse(expectedString);
    assert_1.default.deepEqual(result, expected);
});
(0, cucumber_1.Then)('the original array should remain unchanged', function () {
    assert_1.default.deepEqual(inputArray, originalArray, 'Original array was modified');
});
(0, cucumber_1.Then)('the functions should return new arrays', function () {
    assert_1.default.notEqual(result, inputArray, 'Function returned the same array reference');
});
(0, cucumber_1.Then)('the result should be an empty array', function () {
    (0, assert_1.default)(Array.isArray(result));
    assert_1.default.equal(result.length, 0);
});
// Processing Steps
(0, cucumber_1.Given)('I have access to the foo processing functions', function () {
    (0, assert_1.default)(typeof index_js_1.fooProcess === 'function');
    (0, assert_1.default)(typeof index_js_1.createFooProcessor === 'function');
});
(0, cucumber_1.Given)('I have a config with prefix {string}', function (prefix) {
    config = { prefix };
});
(0, cucumber_1.Given)('I have a config with prefix {string} and suffix {string}', function (prefix, suffix) {
    config = { prefix, suffix };
});
(0, cucumber_1.When)('I create a processor with this config', function () {
    if (!config)
        throw new Error('Config not set');
    processor = (0, index_js_1.createFooProcessor)(config);
});
(0, cucumber_1.When)('I process the input {string}', function (input) {
    if (!processor)
        throw new Error('Processor not created');
    result = processor.process(input);
});
(0, cucumber_1.When)('I create processors with this config multiple times', function () {
    if (!config)
        throw new Error('Config not set');
    processors = [
        (0, index_js_1.createFooProcessor)(config),
        (0, index_js_1.createFooProcessor)(config),
        (0, index_js_1.createFooProcessor)(config)
    ];
});
(0, cucumber_1.Then)('all processors should behave identically', function () {
    (0, assert_1.default)(processors.length >= 2, 'Need at least 2 processors to compare');
    const testInput = 'test';
    const results = processors.map(p => p.process(testInput));
    // All results should be identical
    const firstResult = results[0];
    results.forEach((result, index) => {
        assert_1.default.equal(result, firstResult, `Processor ${index} returned different result`);
    });
});
(0, cucumber_1.Then)('processing {string} should always return {string}', function (input, expected) {
    processors.forEach((proc, index) => {
        const result = proc.process(input);
        assert_1.default.equal(result, expected, `Processor ${index} returned unexpected result`);
    });
});
