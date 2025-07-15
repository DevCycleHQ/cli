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

                    // Enhanced error categorization and messages
                    let errorMessage = 'Unknown error'
                    let errorType = 'UNKNOWN_ERROR'
                    let suggestions: string[] = []

                    if (error instanceof Error) {
                        errorMessage = error.message

                        // Categorize common error types
                        // Check for Zodios schema validation errors first
                        if (
                            error.message.includes(
                                'Zodios: Invalid response',
                            ) ||
                            error.message.includes('invalid_type') ||
                            error.message.includes('Expected object, received')
                        ) {
                            errorType = 'SCHEMA_VALIDATION_ERROR'
                            suggestions = [
                                'The API response format has changed or is unexpected',
                                'This may be a temporary API issue - try again in a moment',
                                'Contact DevCycle support if the issue persists',
                            ]
                        } else if (
                            error.message.includes('401') ||
                            error.message.includes('Unauthorized')
                        ) {
                            errorType = 'AUTHENTICATION_ERROR'
                            suggestions = [
                                'Run "dvc login sso" to re-authenticate the devcycle cli',
                                'Verify your API credentials are correct',
                                'Check if your token has expired',
                            ]
                        } else if (
                            error.message.includes('403') ||
                            error.message.includes('Forbidden')
                        ) {
                            errorType = 'PERMISSION_ERROR'
                            suggestions = [
                                'Verify your account has permissions for this operation',
                                'Check if you have access to the selected project',
                                'Contact your DevCycle admin for permissions',
                            ]
                        } else if (
                            error.message.includes('404') ||
                            error.message.includes('Not Found')
                        ) {
                            errorType = 'RESOURCE_NOT_FOUND'
                            suggestions = [
                                'Verify the resource key/ID is correct',
                                'Check if the resource exists in the selected project',
                                "Ensure you're in the correct environment",
                            ]
                        } else if (
                            error.message.includes('400') ||
                            error.message.includes('Bad Request')
                        ) {
                            errorType = 'VALIDATION_ERROR'
                            suggestions = [
                                'Check the provided parameters are valid',
                                'Verify required fields are not missing',
                                'Review parameter format and constraints',
                            ]
                        } else if (
                            error.message.includes('429') ||
                            error.message.includes('rate limit')
                        ) {
                            errorType = 'RATE_LIMIT_ERROR'
                            suggestions = [
                                'Wait a moment before trying again',
                                'Consider reducing the frequency of requests',
                            ]
                        } else if (
                            error.message.includes('ENOTFOUND') ||
                            error.message.includes('network')
                        ) {
                            errorType = 'NETWORK_ERROR'
                            suggestions = [
                                'Check your internet connection',
                                'Verify firewall settings allow DevCycle API access',
                                'Try again in a few moments',
                            ]
                        } else if (
                            error.message.includes('project') &&
                            error.message.includes('not found')
                        ) {
                            errorType = 'PROJECT_ERROR'
                            suggestions = [
                                'Run "dvc projects select" to choose a valid project',
                                'Verify the project key is correct',
                                'Check if you have access to this project',
                            ]
                        }
                    } else if (error && typeof error === 'string') {
                        errorMessage = error
                    } else if (error && typeof error === 'object') {
                        errorMessage = JSON.stringify(error)
                    }

                    // Return enhanced error response
                    const errorResponse = {
                        error: true,
                        type: errorType,
                        message: errorMessage,
                        tool: name,
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
            },
        )
    }

    private setupErrorHandling() {
        this.server.onerror = (error: Error) => {
            console.error('MCP Server Error:', error)
        }
    }
}
