# DevCycle MCP Server Documentation

## Overview

The DevCycle MCP (Model Context Protocol) Server enables AI coding assistants like Cursor and Claude to interact directly with DevCycle's feature flag management system. This integration allows developers to manage feature flags, variables, and targeting rules without leaving their coding environment.

DevCycle provides two MCP implementations:

- **Local MCP Server** (`dvc-mcp`): Runs locally using CLI authentication or API keys
- **Remote MCP Server** (`https://mcp.devcycle.com`): Hosted Cloudflare Worker with OAuth authentication

Both implementations share the same underlying tools, schemas, and utilities, ensuring consistent functionality regardless of which option you choose.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Authentication](#authentication)
- [Available Tools](#available-tools)
  - [Feature Management](#feature-management)
  - [Variable Management](#variable-management)
  - [Environment Management](#environment-management)
  - [Project Management](#project-management)
  - [Self-Targeting & Overrides](#self-targeting--overrides)
  - [Results & Analytics](#results--analytics)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Installation & Setup

### Local MCP Server

### Prerequisites

- Node.js 16+ installed
- DevCycle CLI installed globally: `npm install -g @devcycle/cli`
- DevCycle account with API credentials or SSO authentication

### Local Configuration

For Cursor (`.cursor/mcp_settings.json`):

```json
{
  "mcpServers": {
    "devcycle": {
      "command": "dvc-mcp"
    }
  }
}
```

For Claude Desktop:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "devcycle": {
      "command": "dvc-mcp"
    }
  }
}
```

## Remote MCP Server (Cloudflare Worker)

The remote MCP server provides OAuth-based authentication and requires no local installation.

### Remote Configuration

For Cursor (`.cursor/mcp_settings.json`):

```json
{
  "mcpServers": {
    "devcycle": {
      "url": "https://mcp.devcycle.com/mcp"
    }
  }
}
```

For Claude Desktop:

```json
{
  "mcpServers": {
    "devcycle": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.devcycle.com/mcp"
      ]
    }
  }
}
```

For more details about the remote MCP implementation, see the [MCP Worker README](../mcp-worker/README.md).

## Authentication

### Local MCP Server Authentication

The local MCP server supports two authentication methods:

#### 1. Environment Variables (Recommended for CI/CD)

```bash
export DEVCYCLE_CLIENT_ID="your-client-id"
export DEVCYCLE_CLIENT_SECRET="your-client-secret"
export DEVCYCLE_PROJECT_KEY="your-project-key"
```

#### 2. CLI Authentication (Recommended for local development)

```bash
# Authenticate via SSO
dvc login sso

# Select your project
dvc projects select
```

### Remote MCP Server Authentication

The remote MCP server uses OAuth 2.0 authentication:

- Users authenticate through DevCycle's Auth0 tenant
- No API keys or local credentials needed
- Project selection is handled through the `select_project` tool

## Available Tools

All tools listed below are available in both the local and remote MCP implementations. They share the same schemas, validation, and behavior.

### Warning Symbols

- **⚠️** - This tool can affect production environments. The AI will confirm with you before executing.
- **⚠️⚠️** - This tool performs destructive operations (deletions). The AI will require explicit confirmation before executing.

### Feature Management

#### `list_features`

List all features in the current project with optional search and pagination.

**Parameters:**

- `search` (optional): Search query to filter features
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 100, max: 1000)

#### `create_feature` ⚠️

Create a new feature flag.

**Parameters:**

- `key`: Unique feature key (pattern: `^[a-z0-9-_.]+$`)
- `name`: Human-readable name (max 100 chars)
- `description` (optional): Feature description (max 1000 chars)
- `type` (optional): Feature type (`release`, `experiment`, `permission`, `ops`)
- `tags` (optional): Array of tags for organization
- `variations` (optional): Array of variations with key, name, and variables
- `configurations` (optional): Environment-specific configurations
- `sdkVisibility` (optional): SDK visibility settings

#### `update_feature` ⚠️

Update an existing feature flag.

**Parameters:**

- `key`: Feature key to update
- `name` (optional): New name
- `description` (optional): New description
- `type` (optional): New type
- `tags` (optional): New tags
- `variations` (optional): Updated variations

#### `update_feature_status` ⚠️

Update the status of a feature flag.

**Parameters:**

- `key`: Feature key
- `status`: New status (`active`, `complete`, `archived`)
- `staticVariation` (optional): Variation to serve if status is `complete`

#### `delete_feature` ⚠️⚠️

Delete a feature flag from ALL environments.

**Parameters:**

- `key`: Feature key to delete

#### `fetch_feature_variations`

Get all variations for a feature.

**Parameters:**

- `feature_key`: Feature key

#### `create_feature_variation`

Create a new variation within a feature.

**Parameters:**

- `feature_key`: Feature key
- `key`: Unique variation key
- `name`: Variation name
- `variables` (optional): Variable values for this variation

#### `update_feature_variation`

Update an existing variation by key. ⚠️ WARNING: Updating a feature variation may affect production environments.

**Parameters:**

- `feature_key`: Feature key
- `variation_key`: Variation to update
- `_id` (optional): MongoDB ID for the variation
- `key` (optional): New variation key
- `name` (optional): New variation name
- `variables` (optional): Updated variable values

#### `set_feature_targeting` ⚠️

Set targeting status (enable or disable) for a feature in an environment.

**Parameters:**

- `feature_key`: Feature key
- `environment_key`: Environment key
- `enabled`: Boolean - true to enable targeting, false to disable

#### `list_feature_targeting`

List targeting rules for a feature.

**Parameters:**

- `feature_key`: Feature key
- `environment_key` (optional): Specific environment (returns all if omitted)

#### `update_feature_targeting` ⚠️

Update targeting rules for a feature in an environment.

**Parameters:**

- `feature_key`: Feature key
- `environment_key`: Environment key
- `status` (optional): Targeting status (`active`, `inactive`, `archived`)
- `targets` (optional): Array of targeting rules with audience filters and distributions

#### `get_feature_audit_log_history`

Get feature flag audit log history from DevCycle. Returns audit log entities matching the DevCycle API schema with date, a0_user, and changes fields.

**Parameters:**

- `feature_key`: Feature key
- `page` (optional): Page number for pagination (default: 1)
- `perPage` (optional): Number of items per page (default: 100, max: 1000)
- `sortBy` (optional): Field to sort by (`createdAt`, `updatedAt`, `action`, `user`) (default: `createdAt`)
- `sortOrder` (optional): Sort order (`asc`, `desc`) (default: `desc`)
- `startDate` (optional): Start date for filtering (ISO 8601 format)
- `endDate` (optional): End date for filtering (ISO 8601 format)
- `environment` (optional): Environment key to filter by
- `user` (optional): User ID to filter by
- `action` (optional): Action type to filter by

### Variable Management

#### `list_variables`

List all variables in the current project.

**Parameters:**

- `search` (optional): Search query
- `page` (optional): Page number
- `per_page` (optional): Items per page

#### `create_variable` ⚠️

Create a new variable.

**Parameters:**

- `key`: Unique variable key (pattern: `^[a-z0-9-_.]+$`)
- `type`: Variable type (`String`, `Boolean`, `Number`, `JSON`)
- `name` (optional): Variable name
- `description` (optional): Variable description
- `defaultValue` (optional): Default value
- `_feature` (optional): Associated feature key
- `validationSchema` (optional): Validation rules

#### `update_variable` ⚠️

Update an existing variable.

**Parameters:**

- `key`: Variable key to update
- `name` (optional): New name
- `description` (optional): New description
- `type` (optional): New type
- `validationSchema` (optional): New validation rules

#### `delete_variable` ⚠️⚠️

Delete a variable from ALL environments.

**Parameters:**

- `key`: Variable key to delete

### Environment Management

#### `list_environments`

List all environments in the current project.

**Parameters:**

- `search` (optional): Search query (min 3 chars)
- `page` (optional): Page number
- `perPage` (optional): Items per page
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order (`asc`, `desc`)

#### `get_sdk_keys`

Get SDK keys for an environment.

**Parameters:**

- `environmentKey`: Environment key
- `keyType` (optional): Specific key type (`mobile`, `server`, `client`)

### Project Management

#### `list_projects`

List all projects in the organization.

**Parameters:**

- `search` (optional): Search query
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 100, max: 1000)
- `sortBy` (optional): Sort field (`createdAt`, `updatedAt`, `name`, `key`, `createdBy`)
- `sortOrder` (optional): Sort order (`asc`, `desc`)
- `createdBy` (optional): Filter by creator user ID

#### `get_current_project`

Get details of the currently selected project.

**Parameters:** None

### Self-Targeting & Overrides

#### `get_self_targeting_identity`

Get current DevCycle identity for self-targeting.

**Parameters:** None

#### `update_self_targeting_identity`

Update DevCycle identity for testing.

**Parameters:**

- `dvc_user_id`: DevCycle User ID (use empty string to clear)

#### `list_self_targeting_overrides`

List all active overrides for the current project.

**Parameters:** None

#### `set_self_targeting_override` ⚠️

Set an override to test a specific variation.

**Parameters:**

- `feature_key`: Feature key
- `environment_key`: Environment key
- `variation_key`: Variation to serve

#### `clear_feature_self_targeting_overrides` ⚠️

Clear overrides for a specific feature/environment.

**Parameters:**

- `feature_key`: Feature key
- `environment_key`: Environment key

### Results & Analytics

#### `get_feature_total_evaluations`

Get total variable evaluations per time period for a specific feature.

**Parameters:**

- `featureKey`: Feature key
- `startDate` (optional): Start date as Unix timestamp (milliseconds since epoch)
- `endDate` (optional): End date as Unix timestamp (milliseconds since epoch)
- `platform` (optional): Platform filter for evaluation results
- `variable` (optional): Variable key filter for evaluation results
- `environment` (optional): Environment key to filter results
- `period` (optional): Time aggregation period (`day`, `hour`, `month`)
- `sdkType` (optional): Filter by SDK type (`client`, `server`, `mobile`, `api`)

#### `get_project_total_evaluations`

Get total variable evaluations per time period for the entire project.

**Parameters:**

- `startDate` (optional): Start date as Unix timestamp (milliseconds since epoch)
- `endDate` (optional): End date as Unix timestamp (milliseconds since epoch)
- `platform` (optional): Platform filter for evaluation results
- `variable` (optional): Variable key filter for evaluation results
- `environment` (optional): Environment key to filter results
- `period` (optional): Time aggregation period (`day`, `hour`, `month`)
- `sdkType` (optional): Filter by SDK type (`client`, `server`, `mobile`, `api`)

## Error Handling

The MCP server returns structured error responses:

```json
{
  "error": true,
  "message": "Detailed error message",
  "tool": "tool_name",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Common error scenarios:

- Authentication failures: Check credentials and project configuration
- API rate limits: Implement retry logic in your automation
- Validation errors: Ensure parameters meet requirements (patterns, lengths, etc.)
- Permission errors: Verify your API key has necessary permissions

## Usage Examples

### Creating a Feature Flag

```text
Create a feature flag for the new checkout flow with variations for A/B testing
```

The AI assistant will use:

1. `create_feature` to create the feature
2. `create_feature_variation` to add variations
3. `enable_feature_targeting` to activate in development

### Viewing Analytics

```text
Show me the evaluation metrics for the checkout_flow feature over the last week
```

The AI assistant will use:

1. `get_feature_total_evaluations` with appropriate date range
2. Display the evaluation data grouped by time period

### Managing Overrides for Testing

```text
Set up my identity to test the premium user experience
```

The AI assistant will use:

1. `update_self_targeting_identity` to set your user ID
2. `set_self_targeting_override` to force specific variations

### Analyzing Feature Usage

```text
Show me the recent changes to the checkout_flow feature
```

The AI assistant will use:

1. `get_feature_audit_log_history` to retrieve change history
2. `list_feature_targeting` to show current configuration

## Best Practices

### 1. Production Safety

Tools marked with ⚠️ can affect production environments. The AI will confirm before:

- Creating or updating features/variables
- Enabling/disabling targeting
- Setting overrides in production

Tools marked with ⚠️⚠️ are destructive and require extra confirmation.

### 2. Naming Conventions

- Feature keys: `lowercase_with_underscores` or `kebab-case`
- Variable keys: Follow the same pattern as features
- Must match pattern: `^[a-z0-9-_.]+$`
- Maximum 100 characters

### 3. Environment Management

- Use consistent environment keys across projects
- Common pattern: `development`, `staging`, `production`
- Create environment-specific overrides for testing

### 4. Self-Targeting Best Practices

- Clear overrides after testing
- Use meaningful user IDs for team collaboration
- Document override purposes in team communications

### 5. Audit and Compliance

- Use `get_feature_audit_log_history` for compliance tracking
- Tag features appropriately for organization
- Include descriptions for documentation

## Architecture & Implementation

Both the local and remote MCP servers share:

- **Common Tools**: All tool implementations in `src/mcp/tools/`
- **Schemas & Validation**: Shared Zod schemas for input/output validation
- **API Clients**: Both implement the `IDevCycleApiClient` interface
- **Error Handling**: Consistent error messages and handling across implementations

Key differences:

- **Authentication**: Local uses API keys/CLI auth, Remote uses OAuth 2.0
- **Transport**: Local uses stdio, Remote uses SSE/HTTP
- **State Storage**: Local uses file system, Remote uses Durable Objects

## Development & Local Testing

For local development and testing of the MCP server:

### Running from Source

```bash
# Clone the repository
git clone https://github.com/DevCycleHQ/cli.git
cd cli

# Install dependencies
yarn install

# Build the project
yarn build

# Run the MCP server
node dist/mcp/index.js
```

### Testing with AI Assistants

For local testing, update your AI assistant configuration to point to the local build:

```json
{
  "mcpServers": {
    "devcycle": {
      "command": "node",
      "args": ["/path/to/cli/dist/mcp/index.js"]
    }
  }
}
```

### Debug Logging

The MCP server logs all operations to stderr, which can be viewed in:

- Cursor: Developer Tools console
- Claude Desktop: Log files in the application support directory
