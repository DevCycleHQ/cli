import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'
import Writer from '../ui/writer'
import {
    featureToolDefinitions,
    featureToolHandlers,
} from './tools/featureTools'
import {
    environmentToolDefinitions,
    environmentToolHandlers,
} from './tools/environmentTools'
import {
    projectToolDefinitions,
    projectToolHandlers,
} from './tools/projectTools'
import {
    variableToolDefinitions,
    variableToolHandlers,
} from './tools/variableTools'
import {
    selfTargetingToolDefinitions,
    selfTargetingToolHandlers,
} from './tools/selfTargetingTools'

// Tool handler function type
export type ToolHandler = (
    args: unknown,
    apiClient: DevCycleApiClient,
) => Promise<any>

// Combine all tool definitions
const allToolDefinitions: Tool[] = [
    ...featureToolDefinitions,
    ...environmentToolDefinitions,
    ...projectToolDefinitions,
    ...variableToolDefinitions,
    ...selfTargetingToolDefinitions,
]

// Combine all tool handlers
const allToolHandlers: Record<string, ToolHandler> = {
    ...featureToolHandlers,
    ...environmentToolHandlers,
    ...projectToolHandlers,
    ...variableToolHandlers,
    ...selfTargetingToolHandlers,
}

export class DevCycleMCPServer {
    private auth: DevCycleAuth
    private apiClient: DevCycleApiClient
    private writer: Writer

    constructor(private server: Server) {
        this.writer = new Writer()
        this.writer.headless = true // Always headless for MCP
        this.auth = new DevCycleAuth()
        this.apiClient = new DevCycleApiClient(this.auth)
    }

    async initialize() {
        try {
            await this.setupAuth()
            this.setupToolHandlers()
            this.setupErrorHandling()
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

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: allToolDefinitions,
        }))

        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const { name, arguments: args } = request.params

                try {
                    const handler = allToolHandlers[name]
                    if (!handler) {
                        throw new Error(`Unknown tool: ${name}`)
                    }

                    const result = await handler(args, this.apiClient)
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }
                } catch (error) {
                    console.error(`Error in tool handler ${name}:`, error)

                    const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error'
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${errorMessage}`,
                            },
                        ],
                    }
                }
            },
        )
    }

    private setupErrorHandling() {
        this.server.onerror = (error: Error) => {
            console.error('MCP Server Error:', error)
        }
    }
}
