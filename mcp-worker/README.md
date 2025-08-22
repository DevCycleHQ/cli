# DevCycle MCP Cloudflare Worker

This package provides the DevCycle MCP (Model Context Protocol) server as a hosted Cloudflare Worker service. It enables AI assistants like Claude to manage DevCycle feature flags through OAuth authentication.

## Key Features

- **OAuth Authentication**: Secure Auth0 integration with user consent flow
- **Zero Installation**: Configure once in AI assistant, no local setup required
- **Auto-Updates**: Always use the latest features without manual updates
- **State Persistence**: Durable Objects maintain session and project selection

**Production**: `https://mcp.devcycle.com`  
**Staging**: `https://devcycle-mcp-server-staging.devcycle.workers.dev`

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

### Setup

```bash
# Install dependencies
yarn install

# Start development server (runs on http://localhost:8787)
yarn dev
```

### Available Endpoints

- `/sse` - MCP Server-Sent Events endpoint
- `/mcp` - Standard HTTP MCP endpoint
- `/oauth/*` - OAuth flow endpoints (authorize, callback, consent)
- `/health` - Health check endpoint

### Testing with Claude Desktop

```json
{
  "mcpServers": {
    "devcycle-local": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:8787/mcp"]
    }
  }
}
```

### User Flow

1. Configure AI assistant with endpoint
2. Authenticate via OAuth on first connection
3. Select project with `select_project` tool
4. Use DevCycle feature flag tools

## Deployment

### Production Deployment

The production worker is deployed via:

```bash
yarn deploy
```

This deploys to the `devcycle-mcp-server` worker with route `mcp.devcycle.com/*`.

**Important**: Production deployments should be done through the CI/CD pipeline, not manually.

## Authentication

The Worker uses OAuth 2.0 with DevCycle's Auth0 tenant. On first connection:

1. User sees DevCycle consent screen with requested permissions
2. Authenticates via Auth0
3. Worker receives OAuth tokens with JWT claims:
   - `org_id`: DevCycle organization ID
   - `project_key`: Default project (if configured)
   - `email`: User email
   - `name`: Display name
4. Access token is used for all DevCycle API calls

## Available Tools

All DevCycle CLI MCP tools are available. See [complete reference](../docs/mcp.md#available-tools) for detailed parameters.

**Project**: `select_project`, `list_projects`, `get_current_project`

**Features**: `list_features`, `create_feature`, `update_feature`, `update_feature_status`, `delete_feature`, `fetch_feature_variations`, `create_feature_variation`, `update_feature_variation`

**Targeting**: `set_feature_targeting`, `list_feature_targeting`, `update_feature_targeting`

**Variables**: `list_variables`, `create_variable`, `update_variable`, `delete_variable`

**Environments**: `list_environments`, `get_sdk_keys`

**Self-Targeting**: `get_self_targeting_identity`, `update_self_targeting_identity`, `list_self_targeting_overrides`, `set_self_targeting_override`, `clear_feature_self_targeting_overrides`

**Analytics**: `get_feature_total_evaluations`, `get_project_total_evaluations`, `get_feature_audit_log_history`

## Events

When a user completes OAuth on the hosted MCP Worker, the worker emits a single Ably event for first-time installs.

- **Channel**: `${orgId}-mcp-install`
- **Event name**: `mcp-install`
