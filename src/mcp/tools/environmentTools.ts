import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { handleZodiosValidationErrors } from '../utils/api'
import {
    fetchEnvironments,
    fetchEnvironmentByKey,
    createEnvironment,
    updateEnvironment,
} from '../../api/environments'
import {
    GetSdkKeysArgsSchema,
    ListEnvironmentsArgsSchema,
    CreateEnvironmentArgsSchema,
    UpdateEnvironmentArgsSchema,
} from '../types'
import {
    DASHBOARD_LINK_PROPERTY,
    ENVIRONMENT_KEY_PROPERTY,
} from './commonSchemas'

import { ToolHandler } from '../server'
import { DevCycleApiClient } from '../utils/api'

// Helper function to generate environment dashboard links
const generateEnvironmentDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
): string => {
    if (!projectKey) {
        throw new Error(
            'Project key is required for environment dashboard link',
        )
    }
    return `https://app.devcycle.com/o/${orgId}/settings/p/${projectKey}/environments`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

// Reusable schema components
const ENVIRONMENT_COLOR_PROPERTY = {
    type: 'string' as const,
    description: 'Color used to represent this environment in the UI',
}

const ENVIRONMENT_TYPE_PROPERTY = {
    type: 'string' as const,
    enum: [
        'development',
        'staging',
        'production',
        'disaster_recovery',
    ] as const,
}

const ENVIRONMENT_COMMON_PROPERTIES = {
    key: ENVIRONMENT_KEY_PROPERTY,
    name: {
        type: 'string' as const,
    },
    description: {
        type: 'string' as const,
    },
    color: ENVIRONMENT_COLOR_PROPERTY,
    type: ENVIRONMENT_TYPE_PROPERTY,
    settings: {
        type: 'object' as const,
        properties: {
            appIconUri: {
                type: 'string' as const,
                description: 'URI for the app icon',
            },
        },
    },
}

const ENVIRONMENT_PAGINATION_PROPERTIES = {
    search: {
        type: 'string' as const,
        description: 'Search query to filter results (minimum 3 characters)',
        minLength: 3,
    },
    page: {
        type: 'number' as const,
        description: 'Page number (default: 1)',
        minimum: 1,
    },
    perPage: {
        type: 'number' as const,
        description: 'Number of items per page (default: 100, max: 1000)',
        minimum: 1,
        maximum: 1000,
    },
    sortBy: {
        type: 'string' as const,
        enum: [
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ] as const,
        description: 'Field to sort by',
    },
    sortOrder: {
        type: 'string' as const,
        enum: ['asc', 'desc'] as const,
        description: 'Sort order (default: desc)',
    },
    createdBy: {
        type: 'string' as const,
        description: 'Filter by user who created the environment',
    },
}

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

// Shared SDK key properties
const SDK_KEY_PROPERTIES = {
    mobile: {
        type: 'string' as const,
        description: 'Mobile SDK key for client-side mobile applications',
    },
    server: {
        type: 'string' as const,
        description: 'Server SDK key for server-side applications',
    },
    client: {
        type: 'string' as const,
        description: 'Client SDK key for client-side web applications',
    },
}

// Output schema components
const SDK_KEYS_OBJECT_SCHEMA = {
    type: 'object' as const,
    properties: SDK_KEY_PROPERTIES,
    required: ['mobile', 'server', 'client'],
}

const ENVIRONMENT_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'A DevCycle environment configuration',
    properties: {
        ...ENVIRONMENT_COMMON_PROPERTIES,
        _id: {
            type: 'string' as const,
            description: 'Unique identifier for the environment',
        },
        sdkKeys: SDK_KEYS_OBJECT_SCHEMA,
        createdAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the environment was created',
        },
        updatedAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the environment was last updated',
        },
    },
    required: [
        '_id',
        'key',
        'name',
        'type',
        'sdkKeys',
        'createdAt',
        'updatedAt',
    ],
}

// Complete output schema definitions
const ENVIRONMENT_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: ENVIRONMENT_OBJECT_SCHEMA,
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const environmentToolDefinitions: Tool[] = [
    {
        name: 'list_environments',
        description:
            'List environments in the current project. Include dashboard link in the response.',
        annotations: {
            title: 'List Environments',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: ENVIRONMENT_PAGINATION_PROPERTIES,
        },
        outputSchema: {
            type: 'object' as const,
            description:
                'Response containing a list of environments and dashboard link',
            properties: {
                result: {
                    type: 'array' as const,
                    description: 'Array of environment objects in the project',
                    items: ENVIRONMENT_OBJECT_SCHEMA,
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'get_sdk_keys',
        description:
            'Get SDK keys for an environment. Include dashboard link in the response.',
        annotations: {
            title: 'Get SDK Keys',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                environmentKey: ENVIRONMENT_KEY_PROPERTY,
                keyType: {
                    type: 'string' as const,
                    enum: ['mobile', 'server', 'client'] as const,
                    description: 'The type of SDK key to retrieve',
                },
            },
            required: ['environmentKey'],
        },
        outputSchema: {
            type: 'object' as const,
            description: 'Response containing SDK keys and dashboard link',
            properties: {
                result: {
                    type: 'object' as const,
                    description:
                        'SDK keys for the requested environment (filtered by keyType if specified)',
                    properties: SDK_KEY_PROPERTIES,
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'create_environment',
        description:
            'Create a new environment. Include dashboard link in the response.',
        annotations: {
            title: 'Create Environment',
        },
        inputSchema: {
            type: 'object',
            properties: ENVIRONMENT_COMMON_PROPERTIES,
            required: ['name', 'key'],
        },
        outputSchema: ENVIRONMENT_OUTPUT_SCHEMA,
    },
    {
        name: 'update_environment',
        description:
            'Update an existing environment. Include dashboard link in the response.',
        annotations: {
            title: 'Update Environment',
        },
        inputSchema: {
            type: 'object',
            properties: ENVIRONMENT_COMMON_PROPERTIES,
            required: ['key'],
        },
        outputSchema: ENVIRONMENT_OUTPUT_SCHEMA,
    },
]

// Legacy handlers for backward compatibility
export const environmentToolHandlers: Record<string, ToolHandler> = {
    list_environments: async (args: unknown, apiClient) => {
        const validatedArgs = ListEnvironmentsArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'listEnvironments',
            validatedArgs,
            async (authToken: string, projectKey: string | undefined) => {
                if (!projectKey) {
                    throw new Error(
                        'Project key is required for listing environments',
                    )
                }
                return await handleZodiosValidationErrors(
                    () => fetchEnvironments(authToken, projectKey),
                    'listEnvironments',
                )
            },
            generateEnvironmentDashboardLink,
        )
    },
    get_sdk_keys: async (args: unknown, apiClient) => {
        const validatedArgs = GetSdkKeysArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'getSdkKeys',
            validatedArgs,
            async (authToken: string, projectKey: string | undefined) => {
                if (!projectKey) {
                    throw new Error(
                        'Project key is required for getting SDK keys',
                    )
                }
                const environment = await handleZodiosValidationErrors(
                    () =>
                        fetchEnvironmentByKey(
                            authToken,
                            projectKey,
                            validatedArgs.environmentKey,
                        ),
                    'fetchEnvironmentByKey',
                )

                const sdkKeys = environment.sdkKeys

                if (validatedArgs.keyType) {
                    return {
                        [validatedArgs.keyType]: sdkKeys[validatedArgs.keyType],
                    }
                } else {
                    return {
                        mobile: sdkKeys.mobile,
                        server: sdkKeys.server,
                        client: sdkKeys.client,
                    }
                }
            },
            generateEnvironmentDashboardLink,
        )
    },
    create_environment: async (args: unknown, apiClient) => {
        const validatedArgs = CreateEnvironmentArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'createEnvironment',
            validatedArgs,
            async (authToken: string, projectKey: string | undefined) => {
                if (!projectKey) {
                    throw new Error(
                        'Project key is required for creating environments',
                    )
                }
                return await handleZodiosValidationErrors(
                    () =>
                        createEnvironment(authToken, projectKey, validatedArgs),
                    'createEnvironment',
                )
            },
            generateEnvironmentDashboardLink,
        )
    },
    update_environment: async (args: unknown, apiClient) => {
        const validatedArgs = UpdateEnvironmentArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateEnvironment',
            validatedArgs,
            async (authToken: string, projectKey: string | undefined) => {
                if (!projectKey) {
                    throw new Error(
                        'Project key is required for updating environments',
                    )
                }
                const { key, ...updateParams } = validatedArgs
                return await handleZodiosValidationErrors(
                    () =>
                        updateEnvironment(
                            authToken,
                            projectKey,
                            key,
                            updateParams,
                        ),
                    'updateEnvironment',
                )
            },
            generateEnvironmentDashboardLink,
        )
    },
}
