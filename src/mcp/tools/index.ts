/**
 * Central tool registration module for DevCycle MCP tools
 *
 * This module provides a single entry point for registering all MCP tools
 * and maintains backward compatibility with the existing server implementation.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { MCPToolRegistry, MCPToolDefinition } from './registry'
import { ToolHandler } from '../server'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleApiClient } from '../utils/api'

// Import all tool definitions and handlers
import { projectToolDefinitions, projectToolHandlers } from './projectTools'
import { variableToolDefinitions, variableToolHandlers } from './variableTools'
import {
    environmentToolDefinitions,
    environmentToolHandlers,
} from './environmentTools'
import { featureToolDefinitions, featureToolHandlers } from './featureTools'
import {
    selfTargetingToolDefinitions,
    selfTargetingToolHandlers,
} from './selfTargetingTools'
import { resultsToolDefinitions, resultsToolHandlers } from './resultsTools'
import {
    customPropertiesToolDefinitions,
    customPropertiesToolHandlers,
} from './customPropertiesTools'

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
 * Register all MCP tools with the provided registry
 * This is the main function that should be called by MCP server implementations
 */
export function registerAllTools(registry: MCPToolRegistry): void {
    // Register all tools using the generic helper
    registry.registerMany(
        createToolDefinitions(projectToolDefinitions, projectToolHandlers),
    )
    registry.registerMany(
        createToolDefinitions(variableToolDefinitions, variableToolHandlers),
    )
    registry.registerMany(
        createToolDefinitions(
            environmentToolDefinitions,
            environmentToolHandlers,
        ),
    )
    registry.registerMany(
        createToolDefinitions(featureToolDefinitions, featureToolHandlers),
    )
    registry.registerMany(
        createToolDefinitions(
            selfTargetingToolDefinitions,
            selfTargetingToolHandlers,
        ),
    )
    registry.registerMany(
        createToolDefinitions(resultsToolDefinitions, resultsToolHandlers),
    )
    registry.registerMany(
        createToolDefinitions(
            customPropertiesToolDefinitions,
            customPropertiesToolHandlers,
        ),
    )
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
