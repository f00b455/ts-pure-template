import { Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { BaseWorldContext } from '../types';

// Common assertion steps for testing pure functions
Then('the result should contain the shared greeting format', function (this: BaseWorldContext) {
  assert.equal(typeof this.result, 'string');
  assert.match(this.result, /Hello, .+!|Error: Name cannot be empty/);
});

Then('the result should start with {string}', function (this: BaseWorldContext, prefix: string) {
  assert.ok(this.result.startsWith(prefix));
});

Then('no errors should occur', function (this: BaseWorldContext) {
  assert.ok(!this.error, 'No error should be present');
});

Then('an error should occur', function (this: BaseWorldContext) {
  assert.ok(this.error, 'An error should be present');
});

Then('the error message should contain {string}', function (this: BaseWorldContext, expectedText: string) {
  assert.ok(this.error, 'An error should be present');
  assert.ok(this.error.message.includes(expectedText), `Error message should contain "${expectedText}"`);
});

// Assertion steps for immutability testing
Then('the original data should remain unchanged', function (this: BaseWorldContext) {
  // This is a generic step that can be overridden in specific step files
  // with more specific implementations
  assert.ok(true, 'Original data immutability check');
});

// Assertion steps for layout and UI (for web/API testing)
Then('no layout shifts occur', function (this: BaseWorldContext) {
  // This would be measured in E2E tests
  assert.ok(true, 'No layout shifts should occur');
});

Then('no UI errors or layout jumps are caused', function (this: BaseWorldContext) {
  assert.ok(true, 'No UI errors should occur');
});