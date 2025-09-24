# Issue: #14
# URL: https://github.com/f00b455/ts-pure-template/issues/14
@pkg(cli) @issue-14
Feature: Hello-World-CLI
  As a user of the Hello-World-CLI
  I want to get a colorful output via hello-cli --name <Name>
  So that I can see the tool is running and says "Hello" with spinner and progress bar

  Background:
    Given I have the hello-cli command available

  @happy-path
  Scenario: Default greeting without name parameter
    When I run hello-cli without parameters
    Then I should see a spinner for 5 seconds
    And I should see a progress bar running for 3 seconds
    And I should see a colorful greeting for "World"
    And the greeting should use fooGreet function from lib-foo

  @happy-path
  Scenario: Custom greeting with name parameter
    When I run hello-cli with --name "Alice"
    Then I should see a spinner for 5 seconds
    And I should see a progress bar running for 3 seconds
    And I should see a colorful greeting for "Alice"
    And the greeting should contain "Greetings Alice!"

  @error-handling
  Scenario: Error handling with clear message
    When an error occurs during execution
    Then I should see a clear error message in color
    And the process should exit with code 1