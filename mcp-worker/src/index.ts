/**
 * DevCycle MCP Cloudflare Worker Entry Point
 *
 * This file re-exports the worker implementation from the main CLI package
 * to maintain a clean separation between the worker package and the main package
 * while allowing shared code and tooling.
 */

// Re-export the configured Cloudflare Worker from the main package
export { default } from '@devcycle/cli/dist/mcp/worker/index.js'

// Export types that might be useful for external consumers
export type {
    UserProps,
    Env,
    DevCycleJWTClaims,
} from '@devcycle/cli/dist/mcp/worker/types.js'

export { DevCycleMCP } from '@devcycle/cli/dist/mcp/worker/index.js'
