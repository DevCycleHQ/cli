import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import { GetSdkKeysArgsSchema } from '../types'
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
                    description: 'Search query to filter environments',
                },
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                },
                per_page: {
                    type: 'number',
                    description: 'Number of items per page (default: 100)',
                },
                sort_by: {
                    type: 'string',
                    description: 'Field to sort by (default: createdAt)',
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
                    description: 'The type of SDK key to retrieve',
                },
            },
            required: ['environment_key'],
        },
    },
]

export const environmentToolHandlers: Record<string, ToolHandler> = {
    list_environments: async (args: unknown, apiClient: DevCycleApiClient) => {
        return await apiClient.listEnvironments()
    },
    get_sdk_keys: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = GetSdkKeysArgsSchema.parse(args)
        return await apiClient.getSdkKeys(validatedArgs)
    },
}
