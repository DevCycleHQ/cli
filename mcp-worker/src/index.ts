import OAuthProvider from '@cloudflare/workers-oauth-provider'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'
import { createAuthApp, tokenExchangeCallback } from './auth'
import { WorkerApiClient } from './apiClient'
import { MCPToolRegistry, registerAllTools } from '../../src/mcp/tools'
import {
    projectSelectionToolDefinitions,
    projectSelectionToolHandlers,
} from './projectSelectionTools'
import type { UserProps, Env } from './types'

/**
 * DevCycle MCP Server for Cloudflare Workers
 *
 * This class extends McpAgent to provide DevCycle feature flag management
 * through the Model Context Protocol over Server-Sent Events (SSE).
 * It integrates OAuth authentication, tool registry, and Worker-specific API client.
 */
export class DevCycleMCP extends McpAgent<
    Env,
    Record<string, never>,
    UserProps
> {
    server = new McpServer({
        name: 'DevCycle CLI MCP Server',
        version: '1.0.0',
    })

    // Tool registry containing all DevCycle MCP tools
    private registry = new MCPToolRegistry()

    // Worker-specific API client that uses OAuth tokens
    private apiClient: WorkerApiClient

    /**
     * Initialize the MCP server with tools and handlers
     */
    async init() {
        // Initialize the Worker-specific API client with OAuth tokens and Durable Object storage
        this.apiClient = new WorkerApiClient(
            this.props,
            this.env,
            this.state.storage,
        )

        console.log('Initializing DevCycle MCP Worker', {
            userId: this.apiClient.getUserId(),
            orgId: this.apiClient.getOrgId(),
            hasProject: await this.apiClient.hasProjectKey(),
        })

        // Register all shared tools from the shared registry
        registerAllTools(this.registry)

        // Register Worker-specific project selection tools
        const projectSelectionTools = projectSelectionToolDefinitions.map(
            (toolDef) => ({
                name: toolDef.name,
                description: toolDef.description || '',
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

        // Useful for debugging. This will show the current user's claims and the Auth0 tokens.
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
                                type: 'text',
                                text: JSON.stringify(
                                    {
                                        message:
                                            'DevCycle MCP Server - User Context',
                                        context: userContext,
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
                                type: 'text',
                                text: `Error retrieving user context: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                    }
                }
            },
        )

        // Dynamically create MCP protocol handlers for each registered tool
        for (const tool of this.registry.getAll()) {
            // @ts-expect-error MCP SDK type compatibility issues with tool registration
            this.server.tool(
                tool.name,
                tool.description,
                tool.inputSchema,
                async (args: any) => {
                    try {
                        console.log(`Executing tool: ${tool.name}`, {
                            args,
                            userId: this.apiClient.getUserId(),
                        })

                        // Execute tool with Worker-specific API client that uses OAuth tokens
                        const result = await this.registry.execute(
                            tool.name,
                            args,
                            this.apiClient,
                        )

                        // Format response according to MCP protocol expectations
                        // Check if result has dashboardLink (from executeWithDashboardLink)
                        let responseText: string
                        if (
                            result &&
                            typeof result === 'object' &&
                            'result' in result &&
                            'dashboardLink' in result
                        ) {
                            responseText = JSON.stringify(
                                {
                                    data: result.result,
                                    dashboardLink: result.dashboardLink,
                                },
                                null,
                                2,
                            )
                        } else {
                            responseText = JSON.stringify(result, null, 2)
                        }

                        console.log(`Tool ${tool.name} completed successfully`)

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: responseText,
                                },
                            ],
                        }
                    } catch (error) {
                        console.error(`Tool ${tool.name} error:`, {
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                            args,
                            userId: this.apiClient.getUserId(),
                        })

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(
                                        {
                                            error:
                                                error instanceof Error
                                                    ? error.message
                                                    : String(error),
                                            tool: tool.name,
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
        }

        console.log('DevCycle MCP Worker initialization completed')
    }
}

// Initialize the Hono app with non-OAuth routes only
// Let the OAuth Provider handle OAuth routes (/authorize, /callback, etc.) automatically
const app = createAuthApp()

export default new OAuthProvider({
    apiHandler: DevCycleMCP.mount('/sse'),
    apiRoute: '/sse',
    authorizeEndpoint: '/authorize',
    clientRegistrationEndpoint: '/signup',
    defaultHandler: app as any,
    tokenEndpoint: '/token',
    tokenExchangeCallback,
})
