import { Tool } from '@modelcontextprotocol/sdk/types.js'
import {
    DevCycleApiClient,
    fetchFeatures,
    createFeature,
    enableTargeting,
    disableTargeting,
} from '../utils/api'
import {
    ListFeaturesArgsSchema,
    CreateFeatureArgsSchema,
    EnableTargetingArgsSchema,
    DisableTargetingArgsSchema,
} from '../types'
import { ToolHandler } from '../server'

export const featureToolDefinitions: Tool[] = [
    {
        name: 'list_features',
        description: 'List features in the current project',
        inputSchema: {
            type: 'object',
            properties: {
                search: {
                    type: 'string',
                    description: 'Search query to filter features',
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
        name: 'create_feature',
        description: 'Create a new feature flag (supports interactive mode)',
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
                    enum: ['release', 'experiment', 'permission', 'ops'],
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
        name: 'enable_targeting',
        description: 'Enable targeting for a feature in an environment',
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
        description: 'Disable targeting for a feature in an environment',
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
]

export const featureToolHandlers: Record<string, ToolHandler> = {
    list_features: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListFeaturesArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'listFeatures',
            validatedArgs,
            async (authToken, projectKey) => {
                const query = {
                    search: validatedArgs.search,
                    page: validatedArgs.page,
                    perPage: validatedArgs.per_page,
                }
                return await fetchFeatures(authToken, projectKey, query)
            },
        )
    },
    create_feature: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateFeatureArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'createFeature',
            validatedArgs,
            async (authToken, projectKey) => {
                if (validatedArgs.interactive) {
                    throw new Error(
                        'Interactive mode not yet supported in MCP. Please provide explicit parameters: key, name, description, type',
                    )
                }

                if (!validatedArgs.key || !validatedArgs.name) {
                    throw new Error(
                        'Feature key and name are required when not using interactive mode',
                    )
                }

                const featureData = {
                    key: validatedArgs.key,
                    name: validatedArgs.name,
                    description: validatedArgs.description || '',
                    type: validatedArgs.type || 'release',
                }

                return await createFeature(authToken, projectKey, featureData)
            },
        )
    },
    enable_targeting: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = EnableTargetingArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'enableTargeting',
            validatedArgs,
            async (authToken, projectKey) => {
                return await enableTargeting(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.environment_key,
                )
            },
        )
    },
    disable_targeting: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = DisableTargetingArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'disableTargeting',
            validatedArgs,
            async (authToken, projectKey) => {
                return await disableTargeting(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.environment_key,
                )
            },
        )
    },
}
