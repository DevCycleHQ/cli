import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'
import Writer from '../ui/writer'
import {
    ListFeaturesArgsSchema,
    ListVariablesArgsSchema,
    GetSdkKeysArgsSchema,
    EnableTargetingArgsSchema,
    DisableTargetingArgsSchema,
    CreateFeatureArgsSchema,
    type ListFeaturesArgs,
    type ListVariablesArgs,
    type GetSdkKeysArgs,
    type EnableTargetingArgs,
    type DisableTargetingArgs,
    type CreateFeatureArgs,
    ListProjectsArgsSchema,
} from './types'

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
                                        'Number of items per page (default: 100, max: 1000)',
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
                                        'Number of items per page (default: 100, max: 1000)',
                                },
                            },
                        },
                    },
                    {
                        name: 'list_environments',
                        description: 'List environments in the current project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                search: {
                                    type: 'string',
                                    description:
                                        'Search query to filter environments',
                                },
                                page: {
                                    type: 'number',
                                    description: 'Page number (default: 1)',
                                },
                                per_page: {
                                    type: 'number',
                                    description:
                                        'Number of items per page (default: 100)',
                                },
                                sort_by: {
                                    type: 'string',
                                    description:
                                        'Field to sort by (default: createdAt)',
                                },
                                sort_order: {
                                    type: 'string',
                                    enum: ['asc', 'desc'],
                                    description: 'Sort order (default: desc)',
                                },
                                created_by: {
                                    type: 'string',
                                    description: 'Filter by creator user ID',
                                },
                            },
                        },
                    },
                    {
                        name: 'list_projects',
                        description:
                            'List all projects in the current organization',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                sort_by: {
                                    type: 'string',
                                    enum: [
                                        'createdAt',
                                        'updatedAt',
                                        'name',
                                        'key',
                                        'createdBy',
                                        'propertyKey',
                                    ],
                                    description:
                                        'Field to sort by (default: createdAt)',
                                },
                                sort_order: {
                                    type: 'string',
                                    enum: ['asc', 'desc'],
                                    description: 'Sort order (default: desc)',
                                },
                                search: {
                                    type: 'string',
                                    description:
                                        'Search query to filter projects (minimum 3 characters)',
                                },
                                created_by: {
                                    type: 'string',
                                    description: 'Filter by creator user ID',
                                },
                                page: {
                                    type: 'number',
                                    description: 'Page number (default: 1)',
                                },
                                per_page: {
                                    type: 'number',
                                    description:
                                        'Number of items per page (default: 100, max: 1000)',
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
                    {
                        name: 'get_current_project',
                        description: 'Get the currently selected project',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                ],
            }
        })

        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const { name, arguments: args } = request.params

                try {
                    let result
                    switch (name) {
                        case 'list_features': {
                            const validatedArgs =
                                ListFeaturesArgsSchema.parse(args)
                            result = await this.executeApiCall(
                                () =>
                                    this.apiClient.listFeatures(validatedArgs),
                                'listing features',
                            )
                            break
                        }
                        case 'list_variables': {
                            const validatedArgs =
                                ListVariablesArgsSchema.parse(args)
                            result = await this.executeApiCall(
                                () =>
                                    this.apiClient.listVariables(validatedArgs),
                                'listing variables',
                            )
                            break
                        }
                        case 'list_environments': {
                            result = await this.executeApiCall(
                                () => this.apiClient.listEnvironments(),
                                'listing environments',
                            )
                            break
                        }
                        case 'list_projects': {
                            const validatedArgs =
                                ListProjectsArgsSchema.parse(args)
                            result = await this.executeApiCall(
                                () =>
                                    this.apiClient.listProjects(validatedArgs),
                                'listing projects',
                            )
                            break
                        }
                        case 'get_sdk_keys': {
                            const validatedArgs =
                                GetSdkKeysArgsSchema.parse(args)
                            result = await this.executeApiCall(
                                () => this.apiClient.getSdkKeys(validatedArgs),
                                'getting SDK keys',
                            )
                            break
                        }
                        case 'enable_targeting': {
                            const validatedArgs =
                                EnableTargetingArgsSchema.parse(args)
                            result = await this.executeApiCall(
                                () =>
                                    this.apiClient.enableTargeting(
                                        validatedArgs,
                                    ),
                                'enabling targeting',
                            )
                            break
                        }
                        case 'disable_targeting': {
                            const validatedArgs =
                                DisableTargetingArgsSchema.parse(args)
                            result = await this.executeApiCall(
                                () =>
                                    this.apiClient.disableTargeting(
                                        validatedArgs,
                                    ),
                                'disabling targeting',
                            )
                            break
                        }
                        case 'create_feature': {
                            const validatedArgs =
                                CreateFeatureArgsSchema.parse(args)
                            result = await this.executeApiCall(
                                () =>
                                    this.apiClient.createFeature(validatedArgs),
                                'creating feature',
                            )
                            break
                        }
                        case 'get_current_project': {
                            result = await this.executeApiCall(
                                () => this.apiClient.getCurrentProject(),
                                'getting current project',
                            )
                            break
                        }
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

    // Generic helper method for tool responses
    private async executeApiCall<T>(
        apiCall: () => Promise<T>,
        errorContext: string,
    ) {
        try {
            const result = await apiCall()
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            }
        } catch (error) {
            console.error(`Error ${errorContext}:`, error)
            throw error
        }
    }
}
