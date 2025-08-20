import OAuthProvider from '@cloudflare/workers-oauth-provider'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import type { ZodRawShape } from 'zod'
import workerVersion from './version'
import { McpAgent } from 'agents/mcp'
import { createAuthApp, createTokenExchangeCallback } from './auth'
import { WorkerApiClient } from './apiClient'

// Import the centralized registration function from CLI tools
import { registerAllToolsWithServer } from '../../src/mcp/tools/index'

// Import types
import type { DevCycleMCPServerInstance } from '../../src/mcp/server'
import { handleToolError } from '../../src/mcp/utils/errorHandling'

import { registerProjectSelectionTools } from './projectSelectionTools'
import type { UserProps } from './types'

/**
 * State interface for DevCycle MCP Server
 */
type DevCycleMCPState = {
    selectedProjectKey?: string
    clientToken?: string
}

/**
 * DevCycle MCP Server for Cloudflare Workers
 *
 * This class extends McpAgent to provide DevCycle feature flag management
 * through the Model Context Protocol over Server-Sent Events (SSE).
 * It integrates OAuth authentication, tool registry, and Worker-specific API client.
 */
export class DevCycleMCP extends McpAgent<Env, DevCycleMCPState, UserProps> {
    private readonly version = workerVersion
    server = new McpServer({
        name: 'DevCycle MCP Remote Server',
        version: this.version,
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
        // Initialize MCP headers with version once at startup
        WorkerApiClient.initializeMCPHeaders(this.version)

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

        // Check environment variable for output schema support
        const enableOutputSchemas =
            (this.env.ENABLE_OUTPUT_SCHEMAS as string) === 'true'
        if (enableOutputSchemas) {
            console.log('DevCycle MCP Worker - Output Schemas: ENABLED')
        }

        // Create an adapter to make the worker's McpServer compatible with the CLI registration pattern
        const serverAdapter: DevCycleMCPServerInstance = {
            registerToolWithErrorHandling: (
                name: string,
                config: {
                    description: string
                    annotations?: ToolAnnotations
                    inputSchema?: ZodRawShape
                    outputSchema?: ZodRawShape
                },
                handler: (args: unknown) => Promise<unknown>,
            ) => {
                // Conditionally include output schema based on environment variable
                const toolConfig: {
                    description: string
                    annotations?: ToolAnnotations
                    inputSchema?: ZodRawShape
                    outputSchema?: ZodRawShape
                } = {
                    description: config.description,
                    annotations: config.annotations,
                    inputSchema: config.inputSchema,
                }

                if (enableOutputSchemas && config.outputSchema) {
                    toolConfig.outputSchema = config.outputSchema
                }

                this.server.registerTool(
                    name,
                    // TypeScript workaround: The MCP SDK's registerTool has complex generic constraints
                    // that cause "Type instantiation is excessively deep" errors when used with our
                    // adapter pattern. The types are correct at runtime, but TS can't verify them.
                    toolConfig as Parameters<
                        typeof this.server.registerTool
                    >[1],
                    async (args: unknown) => {
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
                            return handleToolError(error, name)
                        }
                    },
                )
            },
        }

        // Register all CLI tools using the centralized registration function
        registerAllToolsWithServer(serverAdapter, this.apiClient)

        // Register worker-specific project selection tools using the modern pattern
        registerProjectSelectionTools(serverAdapter, this.apiClient)

        // Persist optional clientToken from props into MCP state for this session
        if (this.props.clientToken) {
            const preview = String(this.props.clientToken).slice(0, 6)
            console.log('MCP init: persisting clientToken', { preview })
            this.setState({
                ...(this.state || {}),
                clientToken: this.props.clientToken,
            })
        } else {
            console.log('MCP init: no clientToken to persist')
        }

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
            apiHandlers: {
                // @ts-expect-error - type errors with the OAuthProvider
                '/sse': DevCycleMCP.serveSSE('/sse'),
                // @ts-expect-error - type errors with the OAuthProvider
                '/mcp': DevCycleMCP.serve('/mcp'),
            },
            // @ts-expect-error - type erorrs with the OAuthProvider
            defaultHandler: app,
            authorizeEndpoint: '/oauth/authorize',
            tokenEndpoint: '/oauth/token',
            clientRegistrationEndpoint: '/oauth/register',
            tokenExchangeCallback: createTokenExchangeCallback(env),
        })

        return provider.fetch(request, env, ctx)
    },
}
