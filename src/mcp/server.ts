import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'
import Writer from '../ui/writer'

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
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'list_features',
                        description: 'List features in the current project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                search: {
                                    type: 'string',
                                    description:
                                        'Search query to filter features',
                                },
                                page: {
                                    type: 'number',
                                    description: 'Page number (default: 1)',
                                },
                                per_page: {
                                    type: 'number',
                                    description:
                                        'Number of items per page (default: 10)',
                                },
                            },
                        },
                    },
                    {
                        name: 'list_variables',
                        description: 'List variables in the current project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                search: {
                                    type: 'string',
                                    description:
                                        'Search query to filter variables',
                                },
                                page: {
                                    type: 'number',
                                    description: 'Page number (default: 1)',
                                },
                                per_page: {
                                    type: 'number',
                                    description:
                                        'Number of items per page (default: 10)',
                                },
                            },
                        },
                    },
                    {
                        name: 'get_sdk_keys',
                        description: 'Get SDK keys for an environment',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                environment_key: {
                                    type: 'string',
                                    description: 'The key of the environment',
                                },
                                key_type: {
                                    type: 'string',
                                    enum: ['mobile', 'server', 'client'],
                                    description:
                                        'The type of SDK key to retrieve',
                                },
                            },
                            required: ['environment_key'],
                        },
                    },
                    {
                        name: 'enable_targeting',
                        description:
                            'Enable targeting for a feature in an environment',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                feature_key: {
                                    type: 'string',
                                    description: 'The key of the feature',
                                },
                                environment_key: {
                                    type: 'string',
                                    description: 'The key of the environment',
                                },
                            },
                            required: ['feature_key', 'environment_key'],
                        },
                    },
                    {
                        name: 'disable_targeting',
                        description:
                            'Disable targeting for a feature in an environment',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                feature_key: {
                                    type: 'string',
                                    description: 'The key of the feature',
                                },
                                environment_key: {
                                    type: 'string',
                                    description: 'The key of the environment',
                                },
                            },
                            required: ['feature_key', 'environment_key'],
                        },
                    },
                    {
                        name: 'create_feature',
                        description:
                            'Create a new feature flag (supports interactive mode)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                key: {
                                    type: 'string',
                                    description: 'Unique feature key',
                                },
                                name: {
                                    type: 'string',
                                    description: 'Human-readable feature name',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Feature description',
                                },
                                type: {
                                    type: 'string',
                                    enum: [
                                        'release',
                                        'experiment',
                                        'permission',
                                        'ops',
                                    ],
                                    description: 'Feature type',
                                },
                                interactive: {
                                    type: 'boolean',
                                    description:
                                        'Use interactive mode to prompt for missing fields',
                                },
                            },
                        },
                    },
                ],
            }
        })

        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request: any) => {
                const { name, arguments: args } = request.params

                try {
                    let result
                    switch (name) {
                        case 'list_features':
                            result = await this.listFeatures(args)
                            break
                        case 'list_variables':
                            result = await this.listVariables(args)
                            break
                        case 'get_sdk_keys':
                            result = await this.getSdkKeys(args)
                            break
                        case 'enable_targeting':
                            result = await this.enableTargeting(args)
                            break
                        case 'disable_targeting':
                            result = await this.disableTargeting(args)
                            break
                        case 'create_feature':
                            result = await this.createFeature(args)
                            break
                        default:
                            throw new Error(`Unknown tool: ${name}`)
                    }

                    return result
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

    // Tool implementations
    private async listFeatures(args: any) {
        try {
            const features = await this.apiClient.listFeatures(args)
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(features, null, 2),
                    },
                ],
            }
        } catch (error) {
            console.error('Error listing features:', error)
            throw error
        }
    }

    private async listVariables(args: any) {
        const variables = await this.apiClient.listVariables(args)
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(variables, null, 2),
                },
            ],
        }
    }

    private async getSdkKeys(args: any) {
        const keys = await this.apiClient.getSdkKeys(
            args.environment_key,
            args.key_type,
        )
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(keys, null, 2),
                },
            ],
        }
    }

    private async enableTargeting(args: any) {
        const result = await this.apiClient.enableTargeting(
            args.feature_key,
            args.environment_key,
        )
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        }
    }

    private async disableTargeting(args: any) {
        const result = await this.apiClient.disableTargeting(
            args.feature_key,
            args.environment_key,
        )
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        }
    }

    private async createFeature(args: any) {
        const result = await this.apiClient.createFeature(args)
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        }
    }
}
