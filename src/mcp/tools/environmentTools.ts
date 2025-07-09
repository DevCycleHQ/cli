import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import {
    fetchEnvironments,
    fetchEnvironmentByKey,
} from '../../api/environments'
import { GetSdkKeysArgsSchema, ListEnvironmentsArgsSchema } from '../types'
import { ToolHandler } from '../server'

export const environmentToolDefinitions: Tool[] = [
    {
        name: 'list_environments',
        description: 'List environments in the current project',
        inputSchema: {
            type: 'object',
            properties: {
                search: {
                    type: 'string',
                    description:
                        'Search query to filter environments (minimum 3 characters)',
                    minLength: 3,
                },
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                    minimum: 1,
                },
                perPage: {
                    type: 'number',
                    description:
                        'Number of items per page (default: 100, max: 1000)',
                    minimum: 1,
                    maximum: 1000,
                },
                sortBy: {
                    type: 'string',
                    description: 'Field to sort by (default: createdAt)',
                    enum: [
                        'createdAt',
                        'updatedAt',
                        'name',
                        'key',
                        'createdBy',
                        'propertyKey',
                    ],
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order (default: desc)',
                },
                createdBy: {
                    type: 'string',
                    description: 'Filter by creator user ID',
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
                environmentKey: {
                    type: 'string',
                    description: 'The key of the environment',
                },
                keyType: {
                    type: 'string',
                    enum: ['mobile', 'server', 'client'],
                    description: 'The type of SDK key to retrieve',
                },
            },
            required: ['environmentKey'],
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
}
