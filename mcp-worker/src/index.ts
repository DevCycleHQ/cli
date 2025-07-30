import OAuthProvider from '@cloudflare/workers-oauth-provider'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'
import { createAuthApp, createTokenExchangeCallback } from './auth'
import { WorkerApiClient } from './apiClient'
import { z } from 'zod'

// Import register functions from the modernized CLI modules
import { registerProjectTools } from '../../src/mcp/tools/projectTools'
import { registerCustomPropertiesTools } from '../../src/mcp/tools/customPropertiesTools'
import { registerEnvironmentTools } from '../../src/mcp/tools/environmentTools'
import { registerVariableTools } from '../../src/mcp/tools/variableTools'
import { registerFeatureTools } from '../../src/mcp/tools/featureTools'
import { registerSelfTargetingTools } from '../../src/mcp/tools/selfTargetingTools'
import { registerResultsTools } from '../../src/mcp/tools/resultsTools'

// Import types
import { DevCycleMCPServerInstance } from '../../src/mcp/server'

import { registerProjectSelectionTools } from './projectSelectionTools'
import type { UserProps } from './types'

/**
 * State interface for DevCycle MCP Server
 */
type DevCycleMCPState = {
    selectedProjectKey?: string
}

/**
 * DevCycle MCP Server for Cloudflare Workers
 *
 * This class extends McpAgent to provide DevCycle feature flag management
 * through the Model Context Protocol over Server-Sent Events (SSE).
 * It integrates OAuth authentication, tool registry, and Worker-specific API client.
 */
export class DevCycleMCP extends McpAgent<Env, DevCycleMCPState, UserProps> {
    server = new McpServer({
        name: 'DevCycle MCP Remote Server',
        version: '1.0.0',
    })

    // Worker-specific API client that uses OAuth tokens
    private apiClient: WorkerApiClient

    // Initial state for the MCP agent
    initialState: DevCycleMCPState = {
        selectedProjectKey: undefined,
    }

    /**
     * Initialize the MCP server with tools and handlers
     */
    async init() {
        console.log('Initializing DevCycle MCP Worker...')
        console.log('State during init:', {
            hasState: !!this.state,
            stateType: typeof this.state,
            stateKeys: this.state ? Object.keys(this.state) : 'no state',
            initialState: this.initialState,
        })

        // Initialize the Worker-specific API client with OAuth tokens and state management
        this.apiClient = new WorkerApiClient(
            this.props,
            this.env,
            this, // Pass the McpAgent instance for state management
        )

        console.log('Initializing DevCycle MCP Worker', {
            userId: this.apiClient.getUserId(),
            orgId: this.apiClient.getOrgId(),
            hasProject: await this.apiClient.hasProjectKey(),
        })

        // Create an adapter to make the worker's McpServer compatible with the CLI registration pattern
        const serverAdapter: DevCycleMCPServerInstance = {
            registerToolWithErrorHandling: (
                name: string,
                config: {
                    description: string
                    annotations?: any
                    inputSchema?: any
                    outputSchema?: any
                },
                handler: (args: any) => Promise<any>,
            ) => {
                this.server.registerTool(
                    name,
                    {
                        description: config.description,
                        annotations: config.annotations,
                        inputSchema: config.inputSchema || {},
                    },
                    async (args: any) => {
                        try {
                            const result = await handler(args)
                            return {
                                content: [
                                    {
                                        type: 'text' as const,
                                        text: JSON.stringify(result, null, 2),
                                    },
                                ],
                            }
                        } catch (error) {
                            return {
                                content: [
                                    {
                                        type: 'text' as const,
                                        text: JSON.stringify(
                                            {
                                                error:
                                                    error instanceof Error
                                                        ? error.message
                                                        : String(error),
                                                tool: name,
                                                args,
                                            },
                                            null,
                                            2,
                                        ),
                                    },
                                ],
                            }
                        }
                    },
                )
            },
        }

        // Register all CLI tools using the shared registration functions
        registerProjectTools(serverAdapter, this.apiClient)
        registerCustomPropertiesTools(serverAdapter, this.apiClient)
        registerEnvironmentTools(serverAdapter, this.apiClient)
        registerVariableTools(serverAdapter, this.apiClient)
        registerFeatureTools(serverAdapter, this.apiClient)
        registerSelfTargetingTools(serverAdapter, this.apiClient)
        registerResultsTools(serverAdapter, this.apiClient)

        // Register worker-specific project selection tools using the modern pattern
        registerProjectSelectionTools(serverAdapter, this.apiClient)

        console.log('✅ All CLI tools registered successfully in worker')

        // Project selection tools are now registered via registerProjectSelectionTools() above

        this.server.tool(
            'whoami',
            'Get the current DevCycle user details and context',
            {},
            async () => {
                try {
                    const userContext = await this.apiClient.getUserContext()
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify(
                                    {
                                        message:
                                            'DevCycle MCP Server - User Context',
                                        context: userContext,
                                        selectedProjectKey:
                                            this.state.selectedProjectKey,
                                    },
                                    null,
                                    2,
                                ),
                            },
                        ],
                    }
                } catch (error) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: `Error retrieving user context: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                    }
                }
            },
        )

        console.log('✅ DevCycle MCP Worker initialization completed')
    }

    /**
     * Called when state updates (e.g., when project selection changes)
     */
    onStateUpdate(state: DevCycleMCPState) {
        console.log('DevCycle MCP State updated: ', state)
    }
}

// Export a fetch handler that creates the OAuth provider with proper env access
export default {
    fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext,
    ): Promise<Response> {
        // Initialize the Hono app with non-OAuth routes only
        const app = createAuthApp()

        // Create OAuth provider with env access
        const provider = new OAuthProvider({
            apiHandler: DevCycleMCP.mount('/sse') as any,
            apiRoute: '/sse',
            authorizeEndpoint: '/authorize',
            clientRegistrationEndpoint: '/signup',
            defaultHandler: app as any,
            tokenEndpoint: '/token',
            tokenExchangeCallback: createTokenExchangeCallback(env),
        })

        return provider.fetch(request, env, ctx)
    },
}
