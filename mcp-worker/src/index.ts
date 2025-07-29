import OAuthProvider from '@cloudflare/workers-oauth-provider'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'
import { createAuthApp, createTokenExchangeCallback } from './auth'
import { WorkerApiClient } from './apiClient'
import { z } from 'zod'
import { MCPToolRegistry, registerAllTools } from '../../src/mcp/tools'
import {
    projectSelectionToolDefinitions,
    projectSelectionToolHandlers,
} from './projectSelectionTools'
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

    // Tool registry containing all DevCycle MCP tools
    private registry = new MCPToolRegistry()

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

        // Register all shared tools from the shared registry
        registerAllTools(this.registry)

        this.server.registerTool(
            'select_devcycle_project',
            {
                description:
                    'Select a project to use for subsequent MCP operations. Call without parameters to list available projects, or provide {"projectKey": "your-project-key"} to select a specific project. Include dashboard link in the response.',
                annotations: {
                    title: 'Select Project',
                },
                inputSchema: {
                    projectKey: z
                        .string()
                        .optional()
                        .describe(
                            'The project key to select (e.g., "jonathans-project"). If not provided, will list all available projects to choose from.',
                        ),
                },
            },
            async (args: any) => {
                console.log('select_devcycle_project args: ', args)

                const result =
                    await projectSelectionToolHandlers.select_devcycle_project(
                        args,
                        this.apiClient,
                    )

                console.log('select_devcycle_project result: ', result)

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify(result, null, 2),
                        } as any,
                    ],
                }
            },
        )

        // Register Worker-specific project selection tools
        const projectSelectionTools = projectSelectionToolDefinitions.map(
            (toolDef) => ({
                name: toolDef.name,
                description: toolDef.description || '',
                annotations: toolDef.annotations,
                inputSchema: toolDef.inputSchema,
                outputSchema: toolDef.outputSchema,
                handler: async (args: unknown, apiClient: any) => {
                    const legacyHandler =
                        projectSelectionToolHandlers[toolDef.name]
                    return await legacyHandler(args, apiClient)
                },
            }),
        )

        this.registry.registerMany(projectSelectionTools)

        console.log(
            `Registered ${this.registry.size()} MCP tools:`,
            this.registry.getToolNames(),
        )

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
                                        props: this.props, // Include full props for debugging like the example
                                        serverInfo: {
                                            name: 'DevCycle CLI MCP Server',
                                            version: '1.0.0',
                                            environment: this.env.NODE_ENV,
                                            apiBaseUrl: this.env.API_BASE_URL,
                                        },
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

        // Dynamically create MCP protocol handlers for each registered tool
        // for (const tool of this.registry.getAll()) {
        //     console.log('Registering tool:', tool.name)
        //     console.log('Tool description:', tool.description)
        //     console.log('Tool inputSchema:', tool.inputSchema)
        //     console.log('Tool annotations:', tool.annotations)

        //     this.server.registerTool(
        //         tool.name,
        //         {
        //             description: tool.description,
        //             inputSchema: tool.inputSchema,
        //             annotations: tool.annotations,
        //         },
        //         async (extra: any) => {
        //             const args = extra.params.arguments || {}
        //             try {
        //                 console.log(`Executing tool: ${tool.name}`, {
        //                     args,
        //                     userId: this.apiClient.getUserId(),
        //                 })

        //                 // Execute tool with Worker-specific API client that uses OAuth tokens
        //                 const result = await this.registry.execute(
        //                     tool.name,
        //                     args,
        //                     this.apiClient,
        //                 )

        //                 // Format response according to MCP protocol expectations
        //                 // Check if result has dashboardLink (from executeWithDashboardLink)
        //                 let responseText: string
        //                 if (
        //                     result &&
        //                     typeof result === 'object' &&
        //                     'result' in result &&
        //                     'dashboardLink' in result
        //                 ) {
        //                     responseText = JSON.stringify(
        //                         {
        //                             data: result.result,
        //                             dashboardLink: result.dashboardLink,
        //                         },
        //                         null,
        //                         2,
        //                     )
        //                 } else {
        //                     responseText = JSON.stringify(result, null, 2)
        //                 }

        //                 console.log(`Tool ${tool.name} completed successfully`)

        //                 return {
        //                     content: [
        //                         {
        //                             type: 'text' as const,
        //                             text: responseText,
        //                         } as any,
        //                     ],
        //                 }
        //             } catch (error) {
        //                 console.error(`Tool ${tool.name} error:`, {
        //                     error:
        //                         error instanceof Error
        //                             ? error.message
        //                             : String(error),
        //                     args,
        //                     userId: this.apiClient.getUserId(),
        //                 })

        //                 return {
        //                     content: [
        //                         {
        //                             type: 'text' as const,
        //                             text: JSON.stringify(
        //                                 {
        //                                     error:
        //                                         error instanceof Error
        //                                             ? error.message
        //                                             : String(error),
        //                                     tool: tool.name,
        //                                     args,
        //                                 },
        //                                 null,
        //                                 2,
        //                             ),
        //                         } as any,
        //                     ],
        //                 }
        //             }
        //         },
        //     )
        // }

        console.log('DevCycle MCP Worker initialization completed')
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
