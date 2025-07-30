/**
 * Central tool registration module for DevCycle MCP tools
 *
 * This module provides registration functions for all MCP tools.
 *
 * MIGRATION STATUS:
 * ✅ projectTools - Migrated to new direct registration pattern
 * ✅ customPropertiesTools - Migrated to new direct registration pattern
 * ✅ environmentTools - Migrated to new direct registration pattern
 * ✅ variableTools - Migrated to new direct registration pattern
 * ✅ featureTools - Migrated to new direct registration pattern
 * ✅ selfTargetingTools - Migrated to new direct registration pattern
 * ✅ resultsTools - Migrated to new direct registration pattern
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { MCPToolRegistry, MCPToolDefinition } from './registry'
import { ToolHandler } from '../server'
import { IDevCycleApiClient } from '../api/interface'

// All tools have been migrated to the new pattern! 🎉

// Import new registration functions (using modern pattern)
import { registerProjectTools } from './projectTools'
import { registerCustomPropertiesTools } from './customPropertiesTools'
import { registerEnvironmentTools } from './environmentTools'
import { registerFeatureTools } from './featureTools'
import { registerResultsTools } from './resultsTools'
import { registerSelfTargetingTools } from './selfTargetingTools'
import { registerVariableTools } from './variableTools'

/**
 * Type guard to ensure the API client implements IDevCycleApiClient interface
 * Accepts both DevCycleApiClient (CLI) and WorkerApiClient (Worker) implementations
 */
function isDevCycleApiClient(
    apiClient: IDevCycleApiClient,
): apiClient is IDevCycleApiClient {
    return (
        apiClient &&
        typeof apiClient.executeWithLogging === 'function' &&
        typeof apiClient.executeWithDashboardLink === 'function'
    )
}

/**
 * Generic helper to convert legacy tool definitions and handlers to MCPToolDefinitions
 */
function createToolDefinitions(
    toolDefinitions: Tool[],
    toolHandlers: Record<string, ToolHandler>,
): MCPToolDefinition[] {
    return toolDefinitions.map((toolDef) => ({
        name: toolDef.name,
        description: toolDef.description || '',
        inputSchema: toolDef.inputSchema,
        outputSchema: toolDef.outputSchema,
        handler: async (args: unknown, apiClient: IDevCycleApiClient) => {
            // Ensure the API client is the expected concrete type
            if (!isDevCycleApiClient(apiClient)) {
                throw new Error(
                    `Expected DevCycleApiClient instance for tool ${toolDef.name}`,
                )
            }

            const legacyHandler = toolHandlers[toolDef.name]
            return await legacyHandler(args, apiClient)
        },
    }))
}

/**
 * Register all DevCycle MCP tools with a server instance
 * This function handles both legacy and modern registration patterns
 */
export function registerAllToolsWithServer(
    serverInstance: any, // DevCycleMCPServerInstance
    apiClient: IDevCycleApiClient,
): void {
    // Register modern pattern tools (migrated)
    registerProjectTools(serverInstance, apiClient)
    registerCustomPropertiesTools(serverInstance, apiClient)
    registerEnvironmentTools(serverInstance, apiClient)
    registerFeatureTools(serverInstance, apiClient)
    registerResultsTools(serverInstance, apiClient)
    registerSelfTargetingTools(serverInstance, apiClient)
    registerVariableTools(serverInstance, apiClient)

    // 🎉 ALL TOOLS SUCCESSFULLY MIGRATED TO NEW PATTERN!
}

/**
 * Legacy function - No longer needed as all tools have been migrated! 🎉
 * Keeping this stub for backwards compatibility if anything imports it.
 */
export function registerAllTools(registry: MCPToolRegistry): void {
    // All tools have been migrated to the new direct registration pattern
    // This function is no longer needed but kept for backwards compatibility
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
