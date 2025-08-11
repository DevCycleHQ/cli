import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import type { ZodRawShape } from 'zod'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'
import { IDevCycleApiClient } from './api/interface'
import Writer from '../ui/writer'
import { handleToolError } from './utils/errorHandling'
import { registerAllToolsWithServer } from './tools'

// Environment variable to control output schema inclusion
const ENABLE_OUTPUT_SCHEMAS = process.env.ENABLE_OUTPUT_SCHEMAS === 'true'
if (ENABLE_OUTPUT_SCHEMAS) {
    console.error('DevCycle MCP Server - Output Schemas: ENABLED')
}

// Tool handler function type
export type ToolHandler = (
    args: unknown,
    apiClient: IDevCycleApiClient,
) => Promise<unknown>

// Type for the server instance with our helper method
export type DevCycleMCPServerInstance = {
    registerToolWithErrorHandling: (
        name: string,
        config: {
            description: string
            annotations?: ToolAnnotations
            inputSchema?: ZodRawShape
            outputSchema?: ZodRawShape
        },
        handler: (args: unknown) => Promise<unknown>,
    ) => void
}

export class DevCycleMCPServer {
    private auth: DevCycleAuth
    private apiClient: DevCycleApiClient
    private writer: Writer

    constructor(private server: McpServer) {
        this.writer = new Writer()
        this.writer.headless = true // Always headless for MCP
        this.auth = new DevCycleAuth()
        this.apiClient = new DevCycleApiClient(this.auth)
    }

    async initialize() {
        try {
            await this.setupAuth()
            registerAllToolsWithServer(this, this.apiClient)
        } catch (error) {
            console.error('Failed to initialize MCP server:', error)
            throw error
        }
    }

    private async setupAuth() {
        try {
            await this.auth.initialize()
        } catch (error) {
            console.error('Failed to initialize authentication:', error)
            throw error
        }
    }

    // Helper method to register tools with automatic error handling
    registerToolWithErrorHandling(
        name: string,
        config: {
            description: string
            inputSchema?: ZodRawShape
            outputSchema?: ZodRawShape
            annotations?: ToolAnnotations
        },
        handler: (args: unknown) => Promise<unknown>,
    ) {
        this.server.registerTool(
            name,
            {
                description: config.description,
                annotations: config.annotations,
                inputSchema: config.inputSchema,
            },
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
    }
}
