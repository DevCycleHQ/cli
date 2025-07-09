import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
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
import { ToolHandler } from '../server'

// Reusable schema components
const ENVIRONMENT_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        "The key of the environment, must be unique and can't be changed after creation",
}

const PAGINATION_PROPERTIES = {
    search: {
        type: 'string' as const,
        description:
            'Search query to filter environments (minimum 3 characters)',
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
        description: 'Field to sort by (default: createdAt)',
        enum: [
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ] as const,
    },
    sortOrder: {
        type: 'string' as const,
        enum: ['asc', 'desc'] as const,
        description: 'Sort order (default: desc)',
    },
    createdBy: {
        type: 'string' as const,
        description: 'Filter by creator user ID',
    },
}

const ENVIRONMENT_COMMON_PROPERTIES = {
    key: ENVIRONMENT_KEY_PROPERTY,
    name: {
        type: 'string' as const,
        description: 'The name of the environment',
    },
    description: {
        type: 'string' as const,
        description: 'The description of the environment',
    },
    color: {
        type: 'string' as const,
        description: 'The color for the environment',
    },
}

export const environmentToolDefinitions: Tool[] = [
    {
        name: 'list_environments',
        description: 'List environments in the current project',
        inputSchema: {
            type: 'object',
            properties: PAGINATION_PROPERTIES,
        },
    },
    {
        name: 'get_sdk_keys',
        description: 'Get SDK keys for an environment',
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
    },
    {
        name: 'create_environment',
        description: 'Create a new environment',
        inputSchema: {
            type: 'object',
            properties: ENVIRONMENT_COMMON_PROPERTIES,
            required: ['name', 'key'],
        },
    },
    {
        name: 'update_environment',
        description: 'Update an existing environment',
        inputSchema: {
            type: 'object',
            properties: ENVIRONMENT_COMMON_PROPERTIES,
            required: ['key'],
        },
    },
]

export const environmentToolHandlers: Record<string, ToolHandler> = {
    list_environments: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListEnvironmentsArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'listEnvironments',
            validatedArgs,
            async (authToken, projectKey) => {
                return await fetchEnvironments(authToken, projectKey)
            },
        )
    },
    get_sdk_keys: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = GetSdkKeysArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'getSdkKeys',
            validatedArgs,
            async (authToken, projectKey) => {
                const environment = await fetchEnvironmentByKey(
                    authToken,
                    projectKey,
                    validatedArgs.environmentKey,
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
        )
    },
    create_environment: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateEnvironmentArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'createEnvironment',
            validatedArgs,
            async (authToken, projectKey) => {
                return await createEnvironment(
                    authToken,
                    projectKey,
                    validatedArgs,
                )
            },
        )
    },
    update_environment: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = UpdateEnvironmentArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'updateEnvironment',
            validatedArgs,
            async (authToken, projectKey) => {
                const { key, ...updateParams } = validatedArgs
                return await updateEnvironment(
                    authToken,
                    projectKey,
                    key,
                    updateParams,
                )
            },
        )
    },
}
