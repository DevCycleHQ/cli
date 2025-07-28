# DevCycle MCP Cloudflare Worker

This package contains the Cloudflare Worker implementation of the DevCycle MCP (Model Context Protocol) server. It provides the same DevCycle feature flag management tools as the local CLI but runs as a remote service accessible via SSE (Server-Sent Events).

## Architecture

- **Authentication**: OAuth integration with DevCycle/Auth0
- **Transport**: Server-Sent Events (SSE) via MCP protocol
- **Tools**: All DevCycle CLI MCP tools (features, variables, environments, etc.)
- **State**: Durable Objects for session management

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with Workers enabled
2. **Wrangler CLI**: Install the Cloudflare Workers CLI tool
   ```bash
   npm install -g wrangler
   ```
3. **DevCycle Auth0 App**: Configure OAuth application credentials

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment

Create a KV namespace for OAuth session storage:

```bash
wrangler kv:namespace create OAUTH_KV
```

Update `wrangler.toml` with the returned namespace ID.

### 3. Set Secrets

Configure your Auth0 credentials as Worker secrets:

```bash
wrangler secret put AUTH0_CLIENT_ID
wrangler secret put AUTH0_CLIENT_SECRET
```

### 4. Update Configuration

Edit `wrangler.toml` to set:
- `AUTH0_DOMAIN`: Your Auth0 domain
- Other environment variables as needed

## Development

### Local Development

Start the development server:

```bash
yarn dev
```

This will start the Worker at `http://localhost:8787` with:
- `/sse` - MCP Server-Sent Events endpoint
- `/authorize` - OAuth authorization endpoint
- `/callback` - OAuth callback endpoint
- `/health` - Health check endpoint

### Testing with MCP Clients

#### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "devcycle": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```

#### AI Playground

Use the remote MCP connection with your Worker URL.

## Deployment

### Production Deployment

Deploy to Cloudflare Workers:

```bash
yarn deploy
```

### Environment-Specific Deployments

For different environments, you can override the worker name:

```bash
wrangler deploy --name devcycle-mcp-server-staging
```

## Usage

### Authentication Flow

1. User connects to the MCP server via supported client
2. Client is redirected to OAuth authorization endpoint
3. User authenticates with DevCycle/Auth0
4. JWT claims contain user context (org_id, project_key, etc.)
5. MCP tools use OAuth tokens for DevCycle API calls

### Available Tools

All DevCycle CLI MCP tools are available:

- **Features**: List, create, update, delete feature flags
- **Variables**: Manage feature variables
- **Environments**: List and manage environments
- **Targeting**: Configure feature targeting rules
- **Overrides**: Manage self-targeting overrides
- **Projects**: List and select projects
- **Results**: View feature analytics

### Debug Tools

- `whoami` - Get current user context and authentication status

## Configuration

### Environment Variables

Set in `wrangler.toml` under `[vars]`:

- `NODE_ENV`: Environment (production/development)
- `API_BASE_URL`: DevCycle API base URL
- `AUTH0_DOMAIN`: Auth0 domain
- `AUTH0_AUDIENCE`: Auth0 API audience
- `AUTH0_SCOPE`: OAuth scopes

### Secrets

Set via `wrangler secret put`:

- `AUTH0_CLIENT_ID`: Auth0 application client ID
- `AUTH0_CLIENT_SECRET`: Auth0 application client secret

## Monitoring

### Observability

The Worker has observability enabled in `wrangler.toml` for monitoring via Cloudflare Analytics.

### Logs

View logs during development:

```bash
wrangler tail
```

### Health Check

Monitor service health:

```bash
curl https://your-worker.your-subdomain.workers.dev/health
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify Auth0 configuration and secrets
2. **Project Access**: Ensure JWT claims contain `org_id` and `project_key`
3. **Tool Failures**: Check DevCycle API credentials and permissions

### Debug Information

Use the `whoami` tool to inspect:
- User authentication status
- JWT claims content
- Project context
- Token validity

## Development Scripts

```bash
# Start local development
yarn dev

# Build TypeScript
yarn build

# Deploy to Cloudflare
yarn deploy

# Type checking
yarn type-check

# Generate Cloudflare types
yarn cf-typegen
```

## Architecture Notes

- **Shared Code**: Worker imports tools from main CLI package
- **Authentication**: OAuth-based vs API key-based for local CLI
- **Transport**: SSE vs stdio for communication
- **State**: Durable Objects vs local file system 