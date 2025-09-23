Feature: Greeting API
  As a user
  I want to get a greeting message
  So that I can verify the API is working

  Scenario: Get default greeting
    When I request a greeting without a name
    Then I should receive "Hello, World!"

  Scenario: Get personalized greeting
    When I request a greeting with name "TypeScript"
    Then I should receive "Hello, TypeScript!"