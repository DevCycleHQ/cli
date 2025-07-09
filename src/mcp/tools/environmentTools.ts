import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import {
    fetchEnvironments,
    fetchEnvironmentByKey,
    createEnvironment,
    updateEnvironment,
} from '../../api/environments'
import {
    ListEnvironmentsArgsSchema,
    GetSdkKeysArgsSchema,
    CreateEnvironmentArgsSchema,
    UpdateEnvironmentArgsSchema,
} from '../types'
import { ToolHandler } from '../server'

export const environmentToolDefinitions: Tool[] = [
    {
        name: 'list_environments',
        description: 'List environments in the current project',
        inputSchema: {
            type: 'object',
            properties: {
                search: { type: 'string', description: 'Search query to filter environments' },
                page: { type: 'number', description: 'Page number (default: 1)' },
                perPage: { type: 'number', description: 'Number of items per page (default: 100, max: 1000)' },
            },
        },
    },
    {
        name: 'get_sdk_keys',
        description: 'Get SDK keys for an environment',
        inputSchema: {
            type: 'object',
            properties: {
                environmentKey: { type: 'string', description: 'Environment key' },
                keyType: { type: 'string', enum: ['mobile', 'server', 'client'], description: 'SDK key type' },
            },
            required: ['environmentKey'],
        },
    },
    {
        name: 'create_environment',
        description: 'Create a new environment',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Environment name' },
                key: { type: 'string', description: 'Environment key' },
                description: { type: 'string', description: 'Environment description' },
                type: { type: 'string', enum: ['development', 'staging', 'production', 'disaster_recovery'], description: 'Environment type' },
            },
            required: ['name', 'key', 'type'],
        },
    },
    {
        name: 'update_environment',
        description: 'Update an existing environment',
        inputSchema: {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Environment key' },
                name: { type: 'string', description: 'Environment name' },
                description: { type: 'string', description: 'Environment description' },
                type: { type: 'string', enum: ['development', 'staging', 'production', 'disaster_recovery'], description: 'Environment type' },
            },
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
                    return { [validatedArgs.keyType]: sdkKeys[validatedArgs.keyType] }
                }
                return sdkKeys
            },
        )
    },
    create_environment: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateEnvironmentArgsSchema.parse(args)
        return await apiClient.executeWithLogging(
            'createEnvironment',
            validatedArgs,
            async (authToken, projectKey) => {
                return await createEnvironment(authToken, projectKey, validatedArgs)
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
                return await updateEnvironment(authToken, projectKey, key, updateParams)
            },
        )
    },
}