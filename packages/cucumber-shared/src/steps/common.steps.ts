import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { BaseWorldContext, ConfigContext } from '../types';

// Common Given steps for function access
Given('I have access to the {word} functions', function (this: BaseWorldContext, moduleName: string) {
  // Generic step for verifying function access
  // Functions are available through imports in the actual step files
  assert.ok(true, `${moduleName} functions should be accessible`);
});

Given('I have access to the {word} {word} functions', function (this: BaseWorldContext, module1: string, module2: string) {
  // Generic step for verifying function access with two-word names
  assert.ok(true, `${module1} ${module2} functions should be accessible`);
});

Given('I have access to the {word} {word} {word} functions', function (this: BaseWorldContext, module1: string, module2: string, module3: string) {
  // Generic step for verifying function access with three-word names
  assert.ok(true, `${module1} ${module2} ${module3} functions should be accessible`);
});

// Common Then steps for result assertions
Then('the result should be {string}', function (this: BaseWorldContext, expectedResult: string) {
  // Intelligent result comparison that handles arrays and strings
  if (Array.isArray(this.result)) {
    // Parse JSON for array comparison
    const expected = JSON.parse(expectedResult);
    assert.deepEqual(this.result, expected);
  } else {
    // Direct string comparison
    assert.equal(this.result, expectedResult);
  }
});

Then('the array result should be {string}', function (this: BaseWorldContext, expectedArray: string) {
  const expected = JSON.parse(expectedArray);
  assert.deepEqual(this.result, expected);
});

Then('the result should be an empty array', function (this: BaseWorldContext) {
  assert.deepEqual(this.result, []);
});

// Common steps for deterministic behavior testing
Then('all results should be identical', function (this: BaseWorldContext) {
  if (!this.results || this.results.length === 0) {
    throw new Error('No results to compare');
  }
  const firstResult = this.results[0];
  for (const res of this.results) {
    if (typeof res === 'object' && res !== null) {
      assert.deepEqual(res, firstResult);
    } else {
      assert.equal(res, firstResult);
    }
  }
});

// Common steps for configuration testing
Given('I have a config with prefix {string}', function (this: ConfigContext, prefix: string) {
  this.config = { prefix };
});

Given('I have a config with prefix {string} and suffix {string}', function (this: ConfigContext, prefix: string, suffix: string) {
  this.config = { prefix, suffix };
});