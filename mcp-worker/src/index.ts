import OAuthProvider from '@cloudflare/workers-oauth-provider'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'
import { createAuthApp, tokenExchangeCallback } from './auth'
import { WorkerApiClient } from './apiClient'
import { MCPToolRegistry, registerAllTools } from '../../src/mcp/tools'
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
        console.log('Initializing DevCycle MCP Worker', {
            userId: this.getUserId(),
            orgId: this.getOrgId(),
            hasProject: this.hasProjectKey(),
        })

        // Initialize the Worker-specific API client with OAuth tokens
        this.apiClient = new WorkerApiClient(this.props, this.env)

        // Register all tools from the shared registry
        registerAllTools(this.registry)

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
                    const userContext = this.apiClient.getUserContext()
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
                            userId: this.getUserId(),
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

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: responseText,
                                },
                            ],
                        }
                    } catch (error) {
                        console.error(`Tool execution error: ${tool.name}`, {
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                            args,
                            userId: this.getUserId(),
                        })

                        // Standardized error handling across all tools
                        const errorMessage =
                            error instanceof Error
                                ? error.message
                                : String(error)
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `The call to ${tool.name} failed: ${errorMessage}`,
                                },
                            ],
                        }
                    }
                },
            )
        }

        console.log('DevCycle MCP Worker initialization completed')
    }

    /**
     * Get user ID from claims for logging
     */
    private getUserId(): string {
        const claims = this.props.claims as any
        return claims?.sub || claims?.email || 'unknown'
    }

    /**
     * Get organization ID from claims
     */
    private getOrgId(): string {
        return (this.props.claims as any)?.org_id || 'unknown'
    }

    /**
     * Check if user has project key available
     */
    private hasProjectKey(): boolean {
        try {
            this.apiClient.getUserContext()
            return true
        } catch {
            return false
        }
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
