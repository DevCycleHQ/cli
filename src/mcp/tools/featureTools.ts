import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import {
    fetchFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
} from '../../api/features'
import {
    fetchVariations,
    createVariation,
    updateVariation,
} from '../../api/variations'
import {
    enableTargeting,
    disableTargeting,
    fetchTargetingForFeature,
    updateFeatureConfigForEnvironment,
} from '../../api/targeting'

import {
    ListFeaturesArgsSchema,
    CreateFeatureArgsSchema,
    UpdateFeatureArgsSchema,
    UpdateFeatureStatusArgsSchema,
    DeleteFeatureArgsSchema,
    EnableTargetingArgsSchema,
    DisableTargetingArgsSchema,
    ListVariationsArgsSchema,
    CreateVariationArgsSchema,
    UpdateVariationArgsSchema,
    ListFeatureTargetingArgsSchema,
    UpdateFeatureTargetingArgsSchema,
} from '../types'
import { ToolHandler } from '../server'

export const featureToolDefinitions: Tool[] = [
    {
        name: 'list_features',
        description: 'List features in the current project',
        inputSchema: {
            type: 'object',
            properties: {
                search: { type: 'string', description: 'Search query to filter features' },
                page: { type: 'number', description: 'Page number (default: 1)' },
                per_page: { type: 'number', description: 'Number of items per page (default: 100, max: 1000)' },
            },
        },
    },
    {
        name: 'create_feature',
        description: 'Create a new feature flag',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Feature name' },
                key: { type: 'string', description: 'Feature key' },
                description: { type: 'string', description: 'Feature description' },
                type: { type: 'string', enum: ['release', 'experiment', 'permission', 'ops'], description: 'Feature type' },
                interactive: { type: 'boolean', description: 'Use interactive mode' },
            },
        },
    },
    {
        name: 'update_feature',
        description: 'Update an existing feature flag',
        inputSchema: {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Feature key' },
                name: { type: 'string', description: 'Feature name' },
                description: { type: 'string', description: 'Feature description' },
                type: { type: 'string', enum: ['release', 'experiment', 'permission', 'ops'], description: 'Feature type' },
            },
            required: ['key'],
        },
    },
    {
        name: 'update_feature_status',
        description: 'Update the status of a feature flag',
        inputSchema: {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Feature key' },
                status: { type: 'string', enum: ['active', 'complete', 'archived'], description: 'Feature status' },
                staticVariation: { type: 'string', description: 'Static variation key for complete status' },
            },
            required: ['key', 'status'],
        },
    },
    {
        name: 'delete_feature',
        description: 'Delete a feature flag',
        inputSchema: {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Feature key' },
            },
            required: ['key'],
        },
    },
    {
        name: 'enable_feature_targeting',
        description: 'Enable targeting for a feature',
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: { type: 'string', description: 'Feature key' },
                environment_key: { type: 'string', description: 'Environment key' },
            },
            required: ['feature_key', 'environment_key'],
        },
    },
    {
        name: 'disable_feature_targeting',
        description: 'Disable targeting for a feature',
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: { type: 'string', description: 'Feature key' },
                environment_key: { type: 'string', description: 'Environment key' },
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
                return await fetchFeatures(authToken, projectKey, validatedArgs)
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
                    throw new Error('Interactive mode not supported in MCP')
                }
                const { interactive, ...featureData } = validatedArgs
                return await createFeature(authToken, projectKey, featureData)
            },
        )
    },
    update_feature: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = UpdateFeatureArgsSchema.parse(args)
        return await apiClient.executeWithLogging(
            'updateFeature',
            validatedArgs,
            async (authToken, projectKey) => {
                const { key, ...updateData } = validatedArgs
                return await updateFeature(authToken, projectKey, key, updateData)
            },
        )
    },
    update_feature_status: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = UpdateFeatureStatusArgsSchema.parse(args)
        return await apiClient.executeWithLogging(
            'updateFeatureStatus',
            validatedArgs,
            async (authToken, projectKey) => {
                const { key, ...statusData } = validatedArgs
                return await updateFeature(authToken, projectKey, key, statusData)
            },
        )
    },
    delete_feature: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = DeleteFeatureArgsSchema.parse(args)
        return await apiClient.executeWithLogging(
            'deleteFeature',
            validatedArgs,
            async (authToken, projectKey) => {
                return await deleteFeature(authToken, projectKey, validatedArgs.key)
            },
        )
    },
    enable_feature_targeting: async (args: unknown, apiClient: DevCycleApiClient) => {
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
    disable_feature_targeting: async (args: unknown, apiClient: DevCycleApiClient) => {
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