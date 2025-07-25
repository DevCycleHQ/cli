# DevCycle MCP Cloudflare Worker Implementation Plan

## Overview

This document outlines the plan to create a Cloudflare Worker-based MCP server that hosts the DevCycle CLI's MCP tools, following the architecture of the `mcp.devcycle.com` example. The server will support both local installation and remote access via SSE (Server-Sent Events).

## Architecture Overview

### Key Components

1. **Cloudflare Worker MCP Server** - Remote server hosting all MCP tools
2. **OAuth Provider Integration** - Using `@cloudflare/workers-oauth-provider` for authentication
3. **SSE Transport** - Server-Sent Events for MCP communication
4. **Durable Objects** - For maintaining MCP session state
5. **Dual Access Mode** - Tools accessible both locally and remotely

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Claude Desktop / AI Client                    │
├─────────────────────────────────────────────────────────────────────┤
│                              mcp-remote proxy                         │
└───────────────────────┬─────────────────────────┬───────────────────┘
                        │                         │
                        │ SSE Connection          │ Local Installation
                        │                         │
┌───────────────────────▼────────────┐   ┌───────▼───────────────────┐
│   Cloudflare Worker MCP Server     │   │  Local MCP Server (stdio)  │
│                                    │   │                           │
│  ┌─────────────────────────────┐  │   │  ┌────────────────────┐  │
│  │   OAuth Authentication      │  │   │  │   Local Auth      │  │
│  │   (Auth0/DevCycle SSO)      │  │   │  │   (CLI Config)     │  │
│  └─────────────────────────────┘  │   │  └────────────────────┘  │
│                                    │   │                           │
│  ┌─────────────────────────────┐  │   │  ┌────────────────────┐  │
│  │     MCP Tool Registry       │  │   │  │  MCP Tool Registry │  │
│  │  (Features, Variables, etc) │  │   │  │   (Same Tools)     │  │
│  └─────────────────────────────┘  │   │  └────────────────────┘  │
│                                    │   │                           │
│  ┌─────────────────────────────┐  │   │  ┌────────────────────┐  │
│  │    DevCycle API Client      │  │   │  │ DevCycle API Client│  │
│  │    (HTTP with Auth Token)   │  │   │  │  (HTTP with Keys)  │  │
│  └─────────────────────────────┘  │   │  └────────────────────┘  │
└────────────────────────────────────┘   └───────────────────────────┘
                        │                         │
                        └─────────────┬───────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   DevCycle API          │
                         │  (api.devcycle.com)     │
                         └─────────────────────────┘
```

## Implementation Structure

### Directory Structure

```
cli/
├── src/
│   └── mcp/
│       ├── index.ts                  # Existing local MCP server (stdio)
│       ├── server.ts                 # Existing MCP server class
│       ├── tools/                    # Existing tool implementations
│       └── worker/                   # NEW: Cloudflare Worker implementation
│           ├── index.ts              # Worker entry point
│           ├── auth.ts               # OAuth authentication
│           ├── mcp-server.ts         # Worker MCP server class
│           ├── api-client.ts         # Worker-specific API client
│           └── types.ts              # Worker-specific types
├── mcp-worker/                       # NEW: Separate package for CF Worker
│   ├── package.json
│   ├── wrangler.toml
│   ├── tsconfig.json
│   └── src/
│       └── index.ts                  # Re-exports from main package
└── docs/
    └── mcp/
        └── cloudflare-deployment.md  # Deployment instructions
```

## Phase 1: Refactor for Dual-Mode Support

### 1.1 Extract Core Tool Logic

Currently, the MCP tools are tightly coupled to the local server implementation in `src/mcp/server.ts`, making it impossible to reuse them in a Cloudflare Worker environment. By extracting the core tool logic into a registry pattern, we can share the same tool implementations between both the stdio-based local server and the SSE-based Worker server, ensuring consistency and reducing code duplication.

Create a tool registry that can be used by both local and remote implementations:

```typescript
// src/mcp/tools/registry.ts
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: unknown, client: DevCycleApiClient) => Promise<any>;
}

export class MCPToolRegistry {
  private tools = new Map<string, MCPToolDefinition>();
  
  register(tool: MCPToolDefinition): void {
    this.tools.set(tool.name, tool);
  }
  
  getAll(): MCPToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  execute(name: string, args: unknown, client: DevCycleApiClient): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.handler(args, client);
  }
}
```

### 1.2 Create Abstracted API Client Interface

The current `DevCycleApiClient` in `src/mcp/utils/api.ts` depends on the local `DevCycleAuth` class which uses file system operations and environment variables that aren't available in Cloudflare Workers. By creating an interface abstraction, we can implement different authentication strategies: the local client will continue using API keys and config files, while the Worker client will use OAuth tokens from the JWT claims passed through the authentication flow.

```typescript
// src/mcp/api/interface.ts
export interface IDevCycleApiClient {
  executeWithLogging<T>(
    operationName: string,
    args: any,
    operation: (authToken: string, projectKey: string) => Promise<T>
  ): Promise<T>;
  
  executeWithDashboardLink<T>(
    operationName: string,
    args: any,
    operation: (authToken: string, projectKey: string) => Promise<T>,
    dashboardLink: (orgId: string, projectKey: string, result: T) => string
  ): Promise<{ result: T; dashboardLink: string }>;
}
```

### 1.3 Refactor Existing Tools

Currently, each tool file exports separate handler functions and tool definitions that are directly imported and registered in `server.ts`. This tight coupling prevents the tools from being used in different contexts. By refactoring to use a registration function pattern, tools become portable modules that can be registered with any MCP server implementation, whether it's running locally or in a Cloudflare Worker.

Update all tool files to use the registry pattern:

```typescript
// src/mcp/tools/featureTools.ts
export function registerFeatureTools(registry: MCPToolRegistry) {
  registry.register({
    name: 'list_features',
    description: 'List features in the current project',
    inputSchema: { /* ... */ },
    handler: async (args, apiClient) => {
      // Existing implementation
    }
  });
  // ... register other feature tools
}
```

## Phase 2: Cloudflare Worker Implementation

### 2.1 Worker Entry Point

The Worker entry point needs to integrate multiple systems: the MCP SDK's `McpAgent` for handling the protocol, Cloudflare's OAuth provider for authentication, and Hono for HTTP routing. Unlike the local implementation which uses stdio transport, the Worker uses SSE (Server-Sent Events) to communicate with clients through the `mcp-remote` proxy. The `DevCycleMCP` class extends `McpAgent` with Durable Objects support to maintain session state across requests, which is essential for the stateless Worker environment.

```typescript
// src/mcp/worker/index.ts
import OAuthProvider, { type OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Hono } from "hono";
import { authorize, callback, confirmConsent, tokenExchangeCallback } from "./auth";
import { MCPToolRegistry } from "../tools/registry";
import { WorkerApiClient } from "./api-client";
import { registerAllTools } from "../tools";

export class DevCycleMCP extends McpAgent<Env, Record<string, never>, UserProps> {
  server = new McpServer({
    name: "DevCycle CLI MCP Server",
    version: "1.0.0",
  });
  
  private registry = new MCPToolRegistry();
  private apiClient: WorkerApiClient;
  
  async init() {
    // Initialize the Worker-specific API client with OAuth tokens
    this.apiClient = new WorkerApiClient(this.props, this.env);
    
    // Register all tools from the shared registry - same tools as local implementation
    registerAllTools(this.registry);
    
    // Dynamically create MCP protocol handlers for each registered tool
    for (const tool of this.registry.getAll()) {
      this.server.tool(
        tool.name,
        tool.description,
        tool.inputSchema,
        async (args) => {
          try {
            // Execute tool with Worker-specific API client that uses OAuth tokens
            const result = await this.registry.execute(
              tool.name, 
              args, 
              this.apiClient
            );
            // Format response according to MCP protocol expectations
            return {
              content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
              }]
            };
          } catch (error) {
            // Standardized error handling across all tools
            return {
              content: [{
                type: "text",
                text: `Error: ${error.message}`
              }]
            };
          }
        }
      );
    }
  }
}

// Initialize Hono app with OAuth routes for handling the authentication flow
const app = new Hono<{ Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers } }>();
app.get("/authorize", authorize);  // Initiates OAuth flow with DevCycle
app.post("/authorize/consent", confirmConsent);  // Handles user consent
app.get("/callback", callback);  // Receives OAuth callback with tokens
app.get("/health", (c) => c.json({ status: "ok" }));  // Health check endpoint

// Configure the OAuth provider with MCP SSE endpoint
export default new OAuthProvider({
  apiHandler: DevCycleMCP.mount("/sse"),  // MCP protocol over Server-Sent Events
  apiRoute: "/sse",
  authorizeEndpoint: "/authorize",
  clientRegistrationEndpoint: "/signup",
  defaultHandler: app,
  tokenEndpoint: "/token",
  tokenExchangeCallback,  // Converts OAuth tokens to UserProps
});
```

### 2.2 Worker-Specific API Client

The Worker API client differs significantly from the local implementation because it receives authentication through OAuth tokens in the JWT claims rather than API keys. The project context, which locally comes from config files or environment variables, must be extracted from either the JWT claims (where it can be embedded during the OAuth flow) or fallback to Worker environment variables. This client implements the same `IDevCycleApiClient` interface but with Worker-specific authentication and configuration strategies, ensuring tool compatibility while adapting to the serverless environment constraints.

```typescript
// src/mcp/worker/api-client.ts
import type { UserProps } from "./types";
import { IDevCycleApiClient } from "../api/interface";

export class WorkerApiClient implements IDevCycleApiClient {
  constructor(
    private props: UserProps,
    private env: Env
  ) {}
  
  async executeWithLogging<T>(
    operationName: string,
    args: any,
    operation: (authToken: string, projectKey: string) => Promise<T>
  ): Promise<T> {
    // Extract project from JWT claims or environment
    const projectKey = this.getProjectKey();
    const authToken = this.props.tokenSet.accessToken;
    
    console.log(`Worker MCP ${operationName}:`, args);
    
    try {
      return await operation(authToken, projectKey);
    } catch (error) {
      console.error(`Worker MCP ${operationName} error:`, error);
      throw error;
    }
  }
  
  private getProjectKey(): string {
    // Try from JWT claims first - this allows user-specific project context
    if (this.props.claims?.project_key) {
      return this.props.claims.project_key as string;
    }
    // Fall back to environment variable for single-project deployments
    if (this.env.DEFAULT_PROJECT_KEY) {
      return this.env.DEFAULT_PROJECT_KEY;
    }
    throw new Error("No project key found in claims or environment");
  }
  
  private getOrgId(): string {
    // Extract from JWT claims
    if (this.props.claims?.org_id) {
      return this.props.claims.org_id as string;
    }
    throw new Error("No organization ID found in claims");
  }
  
  async executeWithDashboardLink<T>(/* ... */) {
    // Similar implementation with dashboard link generation
  }
}
```

### 2.3 Authentication Implementation

The authentication implementation handles the OAuth token exchange callback, which is triggered after users authenticate with DevCycle's Auth0 provider. This function extracts user information from the ID token's JWT claims and packages it into the `UserProps` structure that gets passed to the MCP agent. The TTL (time-to-live) setting ensures that sessions are refreshed periodically, maintaining security while providing a smooth user experience. This approach allows the Worker to operate with the same DevCycle API permissions as the authenticated user, respecting organizational boundaries and access controls.

```typescript
// src/mcp/worker/auth.ts
import type { TokenExchangeCallbackOptions, TokenExchangeCallbackResult } from "@cloudflare/workers-oauth-provider";
import * as oauth from "oauth4webapi";
import type { UserProps } from "./types";

export async function tokenExchangeCallback(
  options: TokenExchangeCallbackOptions<Env>
): Promise<TokenExchangeCallbackResult<UserProps>> {
  const { tokenSet, userInfo } = options;
  
  // Extract user information from ID token - includes org_id, project_key, permissions
  const claims = parseJWT(tokenSet.id_token);
  
  return {
    props: {
      claims,  // JWT claims contain user context and permissions
      tokenSet: {
        accessToken: tokenSet.access_token,  // Used for DevCycle API calls
        idToken: tokenSet.id_token,  // Contains user identity
        refreshToken: tokenSet.refresh_token || "",  // For token renewal
      },
    },
    ttl: 3600, // 1 hour - balances security with user experience
  };
}
```

## Phase 3: Deployment Configuration

### 3.1 Wrangler Configuration

```toml
# mcp-worker/wrangler.toml
name = "devcycle-mcp-server"
main = "src/index.ts"
compatibility_date = "2025-03-10"
compatibility_flags = ["nodejs_compat"]

[migrations]
new_sqlite_classes = ["DevCycleMCP"]
tag = "v1"

[durable_objects]
bindings = [
  { class_name = "DevCycleMCP", name = "MCP_OBJECT" }
]

[kv_namespaces]
binding = "OAUTH_KV"
id = "YOUR_KV_NAMESPACE_ID"

[vars]
NODE_ENV = "production"
API_BASE_URL = "https://api.devcycle.com"
AUTH0_DOMAIN = "auth.devcycle.com"
AUTH0_AUDIENCE = "https://api.devcycle.com/"
AUTH0_SCOPE = "openid profile email offline_access"
# AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET should be set as secrets

[ai]
binding = "AI"

[observability]
enabled = true
```

### 3.2 Package Configuration

```json
// mcp-worker/package.json
{
  "name": "@devcycle/mcp-worker",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "build": "tsc"
  },
  "dependencies": {
    "@cloudflare/workers-oauth-provider": "^0.0.5",
    "@devcycle/cli": "file:../",
    "@modelcontextprotocol/sdk": "^1.13.1",
    "agents": "^0.0.100",
    "hono": "^4.8.4",
    "oauth4webapi": "^3.5.5"
  }
}
```

## Phase 4: Build System Updates

### 4.1 Shared Code Compilation

Update the main CLI build to create a separate bundle for shared MCP code:

```json
// package.json
{
  "scripts": {
    "build:mcp-shared": "tsc --project tsconfig.mcp.json",
    "build:worker": "cd mcp-worker && npm run build",
    "deploy:worker": "cd mcp-worker && npm run deploy"
  }
}
```

### 4.2 TypeScript Configuration

```json
// tsconfig.mcp.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/mcp-shared",
    "declaration": true,
    "declarationMap": true
  },
  "include": [
    "src/mcp/tools/**/*",
    "src/mcp/api/interface.ts",
    "src/api/**/*"
  ]
}
```

## Phase 5: Testing Strategy

### 5.1 Unit Tests

- Test tool handlers in isolation
- Mock API client for both local and worker implementations
- Test authentication flows

### 5.2 Integration Tests

```typescript
// test/mcp-worker/integration.test.ts
describe('MCP Worker Integration', () => {
  let worker: UnstableDevWorker;
  
  beforeAll(async () => {
    worker = await unstable_dev("mcp-worker/src/index.ts", {
      experimental: { disableExperimentalWarning: true },
    });
  });
  
  afterAll(async () => {
    await worker.stop();
  });
  
  it('should list features via SSE', async () => {
    // Test SSE connection and tool execution
  });
});
```

### 5.3 E2E Tests

- Deploy to preview environment
- Test with actual Claude Desktop/AI Playground
- Verify OAuth flow

## Phase 6: Documentation

### 6.1 Deployment Guide

```markdown
# Deploying DevCycle MCP Server to Cloudflare

## Prerequisites
- Cloudflare account
- Wrangler CLI installed
- DevCycle OAuth application credentials

## Deployment Steps

1. Clone the repository
2. Install dependencies: `yarn install`
3. Create KV namespace: `wrangler kv:namespace create OAUTH_KV`
4. Set secrets:
   ```bash
   wrangler secret put AUTH0_CLIENT_ID
   wrangler secret put AUTH0_CLIENT_SECRET
   ```
5. Deploy: `yarn deploy:worker`

## Connecting Clients

### Claude Desktop
```json
{
  "mcpServers": {
    "devcycle": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://devcycle-mcp.your-account.workers.dev/sse"
      ]
    }
  }
}
```

### Local Development
```bash
# Use local MCP server
dvc mcp

# Or connect to remote
npx mcp-remote http://localhost:8787/sse
```
```

## Phase 7: Monitoring and Operations

### 7.1 Logging and Metrics

- Implement structured logging
- Track tool usage metrics
- Monitor OAuth success rates
- Alert on errors

### 7.2 Security Considerations

- Validate all input parameters
- Implement rate limiting
- Secure token storage
- CORS configuration for web clients

## Phase 8: Future Enhancements

### 8.1 Advanced Features

- WebSocket support for real-time updates
- Batch operations for multiple tools
- Caching layer for frequently accessed data
- Multi-tenant support

### 8.2 Performance Optimizations

- Edge caching for read operations
- Connection pooling for API calls
- Lazy loading of tool implementations

## Timeline

- **Week 1-2**: Phase 1 - Refactor for dual-mode support
- **Week 3-4**: Phase 2 - Cloudflare Worker implementation
- **Week 5**: Phase 3-4 - Deployment and build system
- **Week 6**: Phase 5 - Testing
- **Week 7**: Phase 6-7 - Documentation and monitoring
- **Week 8**: Buffer and refinements

## Success Criteria

1. All existing MCP tools work in both local and remote modes
2. OAuth authentication works seamlessly
3. Performance is acceptable (< 500ms latency for most operations)
4. Zero downtime deployment process
5. Comprehensive documentation for users and developers 