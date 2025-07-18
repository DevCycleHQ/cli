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

// Environment variable to control output schema inclusion
const ENABLE_OUTPUT_SCHEMAS = process.env.ENABLE_OUTPUT_SCHEMAS === 'true'
if (ENABLE_OUTPUT_SCHEMAS) {
    console.error('DevCycle MCP Server - Output Schemas: ENABLED')
}

const ENABLE_DVC_MCP_DEBUG = process.env.ENABLE_DVC_MCP_DEBUG === 'true'

// Tool handler function type
export type ToolHandler = (
    args: unknown,
    apiClient: DevCycleApiClient,
) => Promise<any>

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

// Combine all tool definitions
const allToolDefinitions: Tool[] = processToolDefinitions([
    ...featureToolDefinitions,
    ...environmentToolDefinitions,
    ...projectToolDefinitions,
    ...variableToolDefinitions,
    ...selfTargetingToolDefinitions,
])

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

    private handleToolError(error: unknown, toolName: string) {
        console.error(`Error in tool handler ${toolName}:`, error)

        let errorMessage = 'Unknown error'
        let errorType = 'UNKNOWN_ERROR'
        let suggestions: string[] = []

        if (error instanceof Error) {
            errorMessage = error.message
            errorType = this.categorizeError(error.message)
            suggestions = this.getErrorSuggestions(errorType)
        } else if (error && typeof error === 'string') {
            errorMessage = error
        } else if (error && typeof error === 'object') {
            errorMessage = JSON.stringify(error)
        }

        const errorResponse = {
            error: true,
            type: errorType,
            message: errorMessage,
            tool: toolName,
            suggestions,
            timestamp: new Date().toISOString(),
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(errorResponse, null, 2),
                },
            ],
        }
    }

    private categorizeError(errorMessage: string): string {
        const lowerMessage = errorMessage.toLowerCase()

        switch (true) {
            case lowerMessage.includes('zodios: invalid response') ||
                lowerMessage.includes('invalid_type') ||
                lowerMessage.includes('expected object, received'):
                return 'SCHEMA_VALIDATION_ERROR'

            case lowerMessage.includes('401') ||
                lowerMessage.includes('unauthorized'):
                return 'AUTHENTICATION_ERROR'

            case lowerMessage.includes('403') ||
                lowerMessage.includes('forbidden'):
                return 'PERMISSION_ERROR'

            case lowerMessage.includes('404') ||
                lowerMessage.includes('not found'):
                return 'RESOURCE_NOT_FOUND'

            case lowerMessage.includes('400') ||
                lowerMessage.includes('bad request'):
                return 'VALIDATION_ERROR'

            case lowerMessage.includes('429') ||
                lowerMessage.includes('rate limit'):
                return 'RATE_LIMIT_ERROR'

            case lowerMessage.includes('enotfound') ||
                lowerMessage.includes('network'):
                return 'NETWORK_ERROR'

            case lowerMessage.includes('project') &&
                lowerMessage.includes('not found'):
                return 'PROJECT_ERROR'

            default:
                return 'UNKNOWN_ERROR'
        }
    }

    private getErrorSuggestions(errorType: string): string[] {
        switch (errorType) {
            case 'SCHEMA_VALIDATION_ERROR':
                return [
                    'The API response format has changed or is unexpected',
                    'This may be a temporary API issue - try again in a moment',
                    'Contact DevCycle support if the issue persists',
                ]

            case 'AUTHENTICATION_ERROR':
                return [
                    'Run "dvc login sso" to re-authenticate the devcycle cli',
                    'Verify your API credentials are correct',
                    'Check if your token has expired',
                ]

            case 'PERMISSION_ERROR':
                return [
                    'Verify your account has permissions for this operation',
                    'Check if you have access to the selected project',
                    'Contact your DevCycle admin for permissions',
                ]

            case 'RESOURCE_NOT_FOUND':
                return [
                    'Verify the resource key/ID is correct',
                    'Check if the resource exists in the selected project',
                    "Ensure you're in the correct environment",
                ]

            case 'VALIDATION_ERROR':
                return [
                    'Check the provided parameters are valid',
                    'Verify required fields are not missing',
                    'Review parameter format and constraints',
                ]

            case 'RATE_LIMIT_ERROR':
                return [
                    'Wait a moment before trying again',
                    'Consider reducing the frequency of requests',
                ]

            case 'NETWORK_ERROR':
                return [
                    'Check your internet connection',
                    'Verify firewall settings allow DevCycle API access',
                    'Try again in a few moments',
                ]

            case 'PROJECT_ERROR':
                return [
                    'Run "dvc projects select" to choose a valid project',
                    'Verify the project key is correct',
                    'Check if you have access to this project',
                ]

            default:
                return []
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

                    // Return structured content only if output schemas are enabled
                    if (ENABLE_OUTPUT_SCHEMAS) {
                        // Check if tool has output schema
                        const toolDef = allToolDefinitions.find(
                            (tool) => tool.name === name,
                        )

                        if (toolDef?.outputSchema) {
                            // For tools with output schemas, return structured JSON content
                            const mcpResult = {
                                content: [
                                    {
                                        type: 'json',
                                        json: result,
                                    },
                                ],
                            }
                            if (ENABLE_DVC_MCP_DEBUG) {
                                console.error(
                                    `MCP ${name} structured JSON result:`,
                                    JSON.stringify(mcpResult, null, 2),
                                )
                            }
                            return mcpResult
                        }
                    }

                    // Default: return as text content (for disabled schemas or tools without schemas)
                    const mcpResult = {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }
                    if (ENABLE_DVC_MCP_DEBUG) {
                        console.error(
                            `MCP ${name} text result:`,
                            JSON.stringify(mcpResult, null, 2),
                        )
                    }
                    return mcpResult
                } catch (error) {
                    return this.handleToolError(error, name)
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
