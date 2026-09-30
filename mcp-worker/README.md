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
- **Authentication**: OAuth 2.1 (`@cloudflare/workers-oauth-provider`) with Auth0 as the upstream IdP, a consent screen, and CIMD + dynamic client registration
- **Transport**: Streamable HTTP (`/mcp`). The legacy HTTP+SSE endpoint (`/sse`) is deprecated
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

### Notable variables

- `MCP_RESOURCE_URL`: canonical RFC 9728 resource identifier and token audience.
  Must equal the origin clients connect to, or discovery breaks.

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

- `/mcp` - Streamable HTTP MCP endpoint (use this)
- `/sse` - **Deprecated** HTTP+SSE MCP endpoint. Scheduled for removal on
  **2027-04-01**; responses carry `Deprecation: true` and a `Sunset` header
- `/oauth/*` - OAuth flow endpoints (authorize, callback, consent)
- `/health` - Health check endpoint

### Deprecated: the `/sse` transport

HTTP+SSE has been deprecated since MCP revision 2025-03-26 and was formally
reclassified as Deprecated in 2026-07-28 (SEP-2596). `/sse` still works, but:

- it is no longer advertised in `server.json`, so registry-driven clients will
  only ever see `/mcp`
- every response carries `Deprecation: true` and `Sunset: Thu, 01 Apr 2027
  00:00:00 GMT`
- it will be removed after that date

Point clients at `https://mcp.devcycle.com/mcp` instead. Every MCP client that
supports OAuth also supports Streamable HTTP, so no functionality is lost.

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

The Worker is an OAuth 2.1 authorization server and protected resource, backed by
DevCycle's Auth0 tenant as the upstream identity provider. On first connection:

1. User sees DevCycle consent screen with requested permissions
2. Authenticates via Auth0
3. Worker receives OAuth tokens with JWT claims:
   - `org_id`: DevCycle organization ID
   - `project_key`: Default project (if configured)
   - `email`: User email
   - `name`: Display name
4. Access token is used for all DevCycle API calls

### Discovery and client registration

Clients discover authorization through RFC 9728 protected resource metadata:

1. An unauthenticated request to `/mcp` returns `401` with a `WWW-Authenticate`
   challenge naming the metadata document.
2. `/.well-known/oauth-protected-resource` returns the canonical `resource` and
   the authorization server issuer.
3. `/.well-known/oauth-authorization-server` returns the OAuth endpoints.

`MCP_RESOURCE_URL` is that canonical resource, and every access token is bound to
it as its audience (RFC 8707). It is a bare origin rather than `<origin>/mcp`
because the deprecated `/sse` route must also sit under it; once `/sse` is
removed it can narrow to the `/mcp` path.

Clients can obtain a `client_id` two ways:

- **Client ID Metadata Documents** (preferred). The client uses an HTTPS URL it
  controls as its `client_id`, serving a metadata document there. Because the
  domain is verified, the consent screen shows it as the publisher.
- **Dynamic Client Registration** at `/oauth/register`. MCP 2026-07-28 deprecated
  DCR in favour of CIMD, but it stays enabled for clients that need it. A
  DCR client's name is self-asserted, and the consent screen says so.

Enforced per OAuth 2.1 and the MCP authorization spec: S256 PKCE only (`plain` is
refused), no implicit grant, and redirect URIs must be `https` or loopback `http`.

## Available Tools

All DevCycle CLI MCP tools are available. See [complete reference](../docs/mcp.md#available-tools) for detailed parameters.

**Project**: `select_project`, `list_projects`, `get_current_project`

**Features**: `list_features`, `create_feature`, `update_feature`, `update_feature_status`, `delete_feature`

**Targeting**: `set_feature_targeting`, `list_feature_targeting`, `update_feature_targeting`

**Variables**: `list_variables`, `create_variable`, `update_variable`, `delete_variable`

**Environments**: `list_environments`, `get_sdk_keys`

**Self-Targeting**: `get_self_targeting_identity`, `update_self_targeting_identity`, `list_self_targeting_overrides`, `set_self_targeting_override`, `clear_feature_self_targeting_overrides`

**Analytics**: `get_feature_total_evaluations`, `get_project_total_evaluations`, `get_feature_audit_log_history`

## Events

When a user completes OAuth on the hosted MCP Worker, the worker emits a single Ably event for first-time installs.

- **Channel**: `${orgId}-mcp-install`
- **Event name**: `mcp-install`

## MCP Tool Token Counts

Measure how many AI tokens our MCP tool descriptions and schemas consume. Run the measurement script (from repo root):

```bash
yarn install &&
yarn measure:mcp-tokens
```

What it does:

- Uses `gpt-tokenizer` (OpenAI-style) and `@anthropic-ai/tokenizer` (Anthropic) to count tokens in each tool's `description` and `inputSchema`.

Current token totals:

```json
{
  "totals": {
    "anthropic": 10428,
    "openai": 10746
  }
}
```
