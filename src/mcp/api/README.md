# DevCycle MCP API Abstraction Layer

This directory contains the API abstraction layer that enables the DevCycle MCP tools to work in both local (stdio) and remote (Cloudflare Worker) environments with different authentication strategies.

## Architecture Overview

### Core Interface (`interface.ts`)

The `IDevCycleApiClient` interface provides a unified API for executing DevCycle operations regardless of the underlying authentication and environment context:

```typescript
interface IDevCycleApiClient {
  executeWithLogging<T>(...): Promise<T>
  executeWithDashboardLink<T>(...): Promise<{ result: T; dashboardLink: string }>
}
```

### Local Implementation (`localApiClient.ts`)

- **Authentication**: Uses file system and environment variables via `DevCycleAuth`
- **Context**: Local CLI environment with config files and SSO tokens
- **Usage**: Wraps the existing `DevCycleApiClient` for backward compatibility

```typescript
const auth = new DevCycleAuth()
const localClient = createLocalApiClient(auth)
```

### Worker Implementation (`workerApiClient.ts`)

- **Authentication**: Uses OAuth JWT tokens from Cloudflare Worker context
- **Context**: Stateless Worker environment with JWT claims
- **Usage**: Extracts authentication from request headers/context

```typescript
const jwtClaims = { devcycle_token: 'token', org_id: 'org' }
const workerClient = WorkerApiClientFactory.fromJwtClaims(jwtClaims, 'project-key')
```

## Key Benefits

### 1. **Dual-Mode Operation**
The same tool implementations can run in both local and remote contexts:
- Local: `dvc mcp` (stdio transport)
- Remote: Cloudflare Worker (SSE transport)

### 2. **Authentication Abstraction**
Different authentication strategies without changing tool code:
- Local: API keys, config files, SSO tokens
- Worker: OAuth JWT tokens, session-based auth

### 3. **Type Safety**
Full TypeScript interface compliance ensures consistency across implementations.

### 4. **Future Extensibility**
Easy to add new contexts (e.g., different cloud providers) by implementing the interfaces.

## Usage in Tools

Tools use the interface without knowing the implementation:

```typescript
// In any tool file (e.g., projectTools.ts)
async function handler(args: unknown, apiClient: IDevCycleApiClient) {
  return await apiClient.executeWithDashboardLink(
    'listProjects',
    args,
    async (authToken, projectKey) => {
      return await fetchProjects(authToken, args)
    },
    generateProjectDashboardLink
  )
}
```

## Testing

The abstraction is thoroughly tested with:
- Interface compliance tests
- Authentication context tests
- Error handling validation
- Dashboard link generation

Run tests: `yarn test src/mcp/api/interface.test.ts`

## Migration Path

This abstraction maintains full backward compatibility:
1. Existing local server continues to work unchanged
2. Tools gradually migrate to use the registry pattern
3. Worker implementation can be added without affecting local usage
4. Legacy exports remain available during transition 