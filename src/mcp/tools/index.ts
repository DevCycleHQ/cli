/**
 * Central tool registration module for DevCycle MCP tools
 */
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { registerProjectTools } from './projectTools'
import { registerFeatureTools } from './featureTools'
import { registerResultsTools } from './resultsTools'
import { registerSelfTargetingTools } from './selfTargetingTools'
import { registerVariableTools } from './variableTools'
import { registerLocalProjectTools } from './localProjectTools'
import { DevCycleApiClient } from '../utils/api'
import { registerInstallTools } from './installTools'

/**
 * Register all DevCycle MCP tools with a server instance
 */
export function registerAllToolsWithServer(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    // Register local project selection tools first for local MCP
    // We detect local MCP by checking if the apiClient is an instance of DevCycleApiClient
    if (apiClient instanceof DevCycleApiClient) {
        const auth = apiClient.getAuth()
        registerLocalProjectTools(serverInstance, apiClient, auth)
    }

    registerInstallTools(serverInstance)
    registerProjectTools(serverInstance, apiClient)
    registerFeatureTools(serverInstance, apiClient)
    registerResultsTools(serverInstance, apiClient)
    registerSelfTargetingTools(serverInstance, apiClient)
    registerVariableTools(serverInstance, apiClient)
}

export type { IDevCycleApiClient } from '../api/interface'
export type { DevCycleMCPServerInstance } from '../server'
