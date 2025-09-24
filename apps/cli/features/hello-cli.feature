# Issue: #14
# URL: https://github.com/f00b455/ts-pure-template/issues/14
@pkg(cli) @issue-14
Feature: Hello-World-CLI
  Als Nutzer:in einer Hello-World-CLI
  möchte ich per hello-cli --name <Name> eine farbenfrohe Ausgabe erhalten,
  damit ich sofort sehe, dass das Tool läuft und „Hello" sagt

  Background:
    Given the hello-cli is installed and available

  @happy-path
  Scenario: Default greeting without name parameter
    When I run "hello-cli" without any arguments
    Then I should see a spinner for about 5 seconds
    And I should see a progress bar running for about 3 seconds
    And I should see a colorful greeting for "World" in a box
    And the greeting should contain "Hello, World!"
    And the exit code should be 0

  @happy-path
  Scenario: Custom greeting with name parameter
    When I run "hello-cli --name Alice"
    Then I should see a spinner for about 5 seconds
    And I should see a progress bar running for about 3 seconds
    And I should see a colorful greeting for "Alice" in a box
    And the greeting should contain "Hello, Alice!"
    And the exit code should be 0

  @error-handling
  Scenario: Empty name parameter shows default
    When I run "hello-cli --name ''"
    Then I should see a spinner for about 5 seconds
    And I should see a progress bar running for about 3 seconds
    And I should see an error message for empty name
    And the exit code should be 0

  @cli-ergonomics
  Scenario: Help command shows usage information
    When I run "hello-cli --help"
    Then I should see usage information
    And the output should mention the --name option
    And the exit code should be 0