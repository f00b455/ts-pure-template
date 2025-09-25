# Issue: #24
# URL: https://github.com/f00b455/ts-pure-template/issues/24
@pkg(mcp-lib-foo) @issue-24
Feature: Network Transport for MCP lib-foo Server
  As a developer working with MCP lib-foo
  I want to use network transport (HTTP/WebSocket) instead of just stdio transport
  So that I can integrate the MCP server with web applications and remote clients

  Background:
    Given the MCP lib-foo server is available

  @transport-http
  Scenario: Starting server with HTTP transport
    Given the environment variable "MCP_TRANSPORT" is set to "http"
    And the environment variable "MCP_PORT" is set to "3000"
    And the environment variable "MCP_HOST" is set to "0.0.0.0"
    When the MCP server is started
    Then the server should listen on HTTP port 3000
    And the server should accept HTTP POST requests at "/mcp"
    And the health check endpoint "/health" should return status "healthy"

  @transport-websocket
  Scenario: Starting server with WebSocket transport
    Given the environment variable "MCP_TRANSPORT" is set to "websocket"
    And the environment variable "MCP_PORT" is set to "3001"
    When the MCP server is started
    Then the server should listen for WebSocket connections on port 3001
    And the server should accept WebSocket connections
    And the server should handle bidirectional WebSocket communication

  @transport-stdio
  Scenario: Starting server with default stdio transport
    Given no transport environment variable is set
    When the MCP server is started
    Then the server should use stdio transport by default
    And the server should read from standard input
    And the server should write to standard output

  @transport-cors
  Scenario: HTTP transport with CORS enabled
    Given the environment variable "MCP_TRANSPORT" is set to "http"
    And the environment variable "MCP_CORS" is set to "true"
    When the MCP server is started
    Then the server should include CORS headers in responses
    And the server should handle OPTIONS preflight requests

  @transport-health
  Scenario: Health check endpoint for HTTP transport
    Given the MCP server is running with HTTP transport
    When a GET request is made to "/health"
    Then the response status should be 200
    And the response should contain:
      | field     | value        |
      | status    | healthy      |
      | transport | http         |
      | server    | mcp-lib-foo  |
      | version   | 0.0.0        |

  @transport-configuration
  Scenario: Server configuration via environment variables
    Given the following environment variables are set:
      | variable         | value        |
      | MCP_TRANSPORT    | http         |
      | MCP_PORT        | 4000         |
      | MCP_HOST        | 127.0.0.1    |
      | MCP_CORS        | false        |
      | MCP_HEALTH_PATH | /status      |
    When the MCP server is started
    Then the server should listen on "127.0.0.1:4000"
    And the health check should be available at "/status"
    And CORS should be disabled

  @transport-fallback
  Scenario: Fallback to stdio when invalid transport specified
    Given the environment variable "MCP_TRANSPORT" is set to "invalid"
    When the MCP server is started
    Then the server should fall back to stdio transport
    And a warning should be logged about invalid transport type

  @docker-http
  Scenario: Running HTTP transport in Docker
    Given a Docker container with the mcp-lib-foo image
    And the container has environment variable "MCP_TRANSPORT" set to "http"
    When the container is started
    Then the container should expose port 3000
    And the health check should pass within 30 seconds
    And the server should be accessible from host machine

  @docker-websocket
  Scenario: Running WebSocket transport in Docker
    Given a Docker container with the mcp-lib-foo image
    And the container has environment variable "MCP_TRANSPORT" set to "websocket"
    When the container is started
    Then the container should expose port 3000
    And WebSocket connections should be accepted
    And the server should maintain persistent connections