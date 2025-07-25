/**
 * Central tool registration module for DevCycle MCP tools
 *
 * This module provides a single entry point for registering all MCP tools
 * and maintains backward compatibility with the existing server implementation.
 */

import { MCPToolRegistry } from './registry'
import { registerProjectTools } from './projectTools'

// TODO: Add imports for other tool modules as they get refactored
// import { registerFeatureTools } from './featureTools'
// import { registerVariableTools } from './variableTools'
// import { registerEnvironmentTools } from './environmentTools'
// import { registerSelfTargetingTools } from './selfTargetingTools'
// import { registerResultsTools } from './resultsTools'
// import { registerCustomPropertiesTools } from './customPropertiesTools'

/**
 * Register all MCP tools with the provided registry
 * This is the main function that should be called by MCP server implementations
 */
export function registerAllTools(registry: MCPToolRegistry): void {
    // Register project tools (already refactored)
    registerProjectTools(registry)

    // TODO: Add other tool registrations as they get refactored
    // registerFeatureTools(registry)
    // registerVariableTools(registry)
    // registerEnvironmentTools(registry)
    // registerSelfTargetingTools(registry)
    // registerResultsTools(registry)
    // registerCustomPropertiesTools(registry)
}

/**
 * Create and return a fully configured MCPToolRegistry with all tools registered
 * This is a convenience function for getting a ready-to-use registry
 */
export function createToolRegistry(): MCPToolRegistry {
    const registry = new MCPToolRegistry()
    registerAllTools(registry)
    return registry
}

// Re-export the registry types and classes for convenience
export { MCPToolRegistry } from './registry'
export type { MCPToolDefinition, ToolRegistrationFunction } from './registry'
export type { IDevCycleApiClient } from '../api/interface'
