/**
 * Central tool registration module for DevCycle MCP tools
 */
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { registerProjectTools } from './projectTools'
import { registerEnvironmentTools } from './environmentTools'
import { registerFeatureTools } from './featureTools'
import { registerResultsTools } from './resultsTools'
import { registerSelfTargetingTools } from './selfTargetingTools'
import { registerVariableTools } from './variableTools'
import { registerLocalProjectTools } from './localProjectTools'
import { DevCycleApiClient } from '../utils/api'

/**
 * Register all DevCycle MCP tools with a server instance
 */
export function registerAllToolsWithServer(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    registerProjectTools(serverInstance, apiClient)
    // registerCustomPropertiesTools(serverInstance, apiClient) // DISABLED: Custom properties tools
    registerEnvironmentTools(serverInstance, apiClient)
    registerFeatureTools(serverInstance, apiClient)
    registerResultsTools(serverInstance, apiClient)
    registerSelfTargetingTools(serverInstance, apiClient)
    registerVariableTools(serverInstance, apiClient)

    // Register local project selection tools only for local MCP (not worker)
    // We detect local MCP by checking if the apiClient is an instance of DevCycleApiClient
    if (apiClient instanceof DevCycleApiClient) {
        const auth = apiClient.getAuth()
        registerLocalProjectTools(serverInstance, apiClient, auth)
    }
}

export type { IDevCycleApiClient } from '../api/interface'
export type { DevCycleMCPServerInstance } from '../server'
