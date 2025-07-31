# DevCycle MCP Cloudflare Worker - Internal Documentation

This package contains the DevCycle MCP (Model Context Protocol) server implementation that runs on Cloudflare Workers. It provides the same feature flag management tools as the local CLI MCP server but runs as a hosted service accessible via SSE (Server-Sent Events) at `mcp.devcycle.com`.

## Overview for DevCycle Team

This Worker enables DevCycle users to manage feature flags through AI assistants like Claude. It's a hosted alternative to the local CLI MCP server, providing:

- **OAuth-based authentication** instead of API keys
- **Zero installation** for end users (just config)
- **Automatic updates** when we ship new features
- **Better security** through user-scoped tokens

**Production URL**: `https://mcp.devcycle.com`  
**Staging URL**: `https://devcycle-mcp-server-staging.devcycle.workers.dev`

## Architecture

- **Base Class**: Extends `McpAgent` from the `agents` package for MCP protocol handling
- **Main Class**: `DevCycleMCP` - Manages tool registration and state
- **Authentication**: OAuth 2.0 flow with Auth0 integration and consent screen
- **Transport**: Both SSE (`/sse`) and standard HTTP (`/mcp`) endpoints for MCP protocol  
- **API Client**: `WorkerApiClient` - OAuth-based API client with state management
- **State Management**: Durable Objects for session and project selection persistence
- **Tool Registration**: Shared tools from CLI with Worker-specific adaptations

## Production Configuration

The MCP Worker is deployed to Cloudflare Workers on the `devcycle.com` zone at `mcp.devcycle.com`.

### Infrastructure

- **Worker Name**: `devcycle-mcp-server`
- **Production URL**: `https://mcp.devcycle.com`
- **Zone**: `devcycle.com`
- **Route Pattern**: `mcp.devcycle.com/*`

### Storage

- **KV Namespace**: `OAUTH_KV` - Stores OAuth session data
- **Durable Objects**: `DevCycleMCP` class - Maintains per-session state including project selection

### Secrets (Configured in Cloudflare Dashboard)

- `AUTH0_CLIENT_ID`: DevCycle's Auth0 application client ID
- `AUTH0_CLIENT_SECRET`: DevCycle's Auth0 application client secret

## Local Development

### Prerequisites

- Node.js and Yarn installed
- Access to DevCycle's Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### Running Locally

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start the development server:

   ```bash
   yarn dev
   ```

This starts the Worker at `http://localhost:8787` with the following endpoints:

- `/sse` - MCP Server-Sent Events endpoint
- `/mcp` - Standard HTTP MCP endpoint (request/response)
- `/oauth/authorize` - OAuth authorization endpoint  
- `/oauth/callback` - OAuth callback endpoint
- `/oauth/consent` - Consent confirmation endpoint
- `/health` - Health check endpoint

### Testing the Worker

For local testing with Claude Desktop, configure:

```json
{
  "mcpServers": {
    "devcycle-local": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```

For production testing, use `https://mcp.devcycle.com/sse`.

## End User Setup

### Claude Desktop Configuration

Users should add this to their Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "devcycle": {
      "command": "npx",
      "args": [
        "mcp-client-cli",
        "sse",
        "https://mcp.devcycle.com/sse"
      ]
    }
  }
}
```

### User Onboarding Flow

1. User adds the configuration above
2. Restarts Claude Desktop
3. On first connection, they'll be redirected to authenticate
4. After auth, they need to select a project with `select_project`
5. They can then use all DevCycle tools

## Deployment

### Production Deployment

The production worker is deployed via:

```bash
yarn deploy
```

This deploys to the `devcycle-mcp-server` worker with route `mcp.devcycle.com/*`.

**Important**: Production deployments should be done through the CI/CD pipeline, not manually.

## How It Works

### Authentication Flow

The Worker uses OAuth 2.0 flow integrated with DevCycle's Auth0 tenant:

1. **Initial Connection**: AI client (Claude, Cursor, etc.) connects to the MCP server via SSE or HTTP
2. **Consent Screen**: Users see a DevCycle-branded consent screen showing:
   - DevCycle logo and branding
   - Requested permissions (profile, email, API access)
   - Option to approve or deny access
3. **Auth0 Authentication**: Users authenticate via DevCycle's Auth0 tenant
4. **Token Exchange**: Worker exchanges authorization code for OAuth tokens
5. **JWT Claims**: The ID token contains DevCycle-specific claims:
   - `org_id`: User's DevCycle organization ID
   - `project_key`: Default project (if user has one configured)
   - `email`: User's email address
   - `name`: User's display name
6. **API Access**: MCP Worker uses the access token for DevCycle API calls on behalf of the user

### Available Tools

All standard DevCycle CLI MCP tools are available through the Worker:

#### Project Management

- `select_project` - Select active project for subsequent operations
- `list_projects` - List all projects in organization
- `get_current_project` - Get currently selected project

#### Feature Management

- `list_features` - List features with filtering
- `create_feature` - Create new feature flag
- `update_feature` - Update feature configuration
- `update_feature_status` - Change feature status
- `delete_feature` - Delete feature flag
- `fetch_feature_variations` - Get feature variations
- `create_feature_variation` - Add new variation
- `update_feature_variation` - Update variation
- `enable_feature_targeting` - Enable feature targeting for feature
- `disable_feature_targeting` - Disable feature targeting
- `list_feature_targeting` - View feature targeting rules
- `update_feature_targeting` - Update feature targeting configuration

#### Variable Management

- `list_variables` - List variables with filtering
- `create_variable` - Create new variable
- `update_variable` - Update variable configuration
- `delete_variable` - Delete variable

#### Environment Management

- `list_environments` - List all environments
- `get_sdk_keys` - Get SDK keys for environment

#### Targeting & Overrides

- `get_self_targeting_identity` - Get current identity for testing
- `update_self_targeting_identity` - Set identity for testing
- `list_self_targeting_overrides` - List overrides
- `set_self_targeting_override` - Set override
- `clear_feature_self_targeting_overrides` - Clear specific overrides

#### Analytics

- `get_feature_total_evaluations` - Get feature usage metrics
- `get_project_total_evaluations` - Get project-wide metrics
- `get_feature_audit_log_history` - View change history
