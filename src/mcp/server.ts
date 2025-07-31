import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Tool, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'
import { IDevCycleApiClient } from './api/interface'
import Writer from '../ui/writer'
import { registerFeatureTools } from './tools/featureTools'
import { registerEnvironmentTools } from './tools/environmentTools'
import { registerVariableTools } from './tools/variableTools'
import { registerSelfTargetingTools } from './tools/selfTargetingTools'
import { registerResultsTools } from './tools/resultsTools'
import { registerProjectTools } from './tools/projectTools'
import { registerCustomPropertiesTools } from './tools/customPropertiesTools'
import { handleToolError } from './utils/errorHandling'

// Environment variable to control output schema inclusion
const ENABLE_OUTPUT_SCHEMAS = process.env.ENABLE_OUTPUT_SCHEMAS === 'true'
if (ENABLE_OUTPUT_SCHEMAS) {
    console.error('DevCycle MCP Server - Output Schemas: ENABLED')
}

// Tool handler function type
export type ToolHandler = (
    args: unknown,
    apiClient: IDevCycleApiClient,
) => Promise<any>

// Type for the server instance with our helper method
export type DevCycleMCPServerInstance = {
    registerToolWithErrorHandling: (
        name: string,
        config: {
            description: string
            annotations?: any
            inputSchema?: any
            outputSchema?: any
        },
        handler: (args: any) => Promise<any>,
    ) => void
}

// Function to conditionally remove outputSchema from tool definitions
const processToolDefinitions = (tools: Tool[]): Tool[] => {
    if (ENABLE_OUTPUT_SCHEMAS) {
        return tools
    }

    // Remove outputSchema from all tools when disabled
    return tools.map((tool) => {
        const { outputSchema, ...toolWithoutSchema } = tool
        return toolWithoutSchema
    })
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
            this.setupToolHandlers()
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
            inputSchema?: any
            outputSchema?: any
            annotations?: ToolAnnotations
        },
        handler: (args: any) => Promise<any>,
    ) {
        this.server.registerTool(name, config, async (args: any) => {
            try {
                const result = await handler(args)

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                } as any
            } catch (error) {
                return handleToolError(error, name)
            }
        })
    }

    private setupToolHandlers() {
        // Register project tools using the new direct registration pattern
        registerProjectTools(this, this.apiClient)
        registerCustomPropertiesTools(this, this.apiClient)
        registerEnvironmentTools(this, this.apiClient)
        registerFeatureTools(this, this.apiClient)
        registerResultsTools(this, this.apiClient)
        registerSelfTargetingTools(this, this.apiClient)
        registerVariableTools(this, this.apiClient)
    }
}
