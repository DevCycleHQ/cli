import { Tool } from '@modelcontextprotocol/sdk/types.js'
import {
    DevCycleApiClient,
    fetchUserProfile,
    updateUserProfile,
    fetchProjectOverridesForUser,
    updateOverride,
    deleteFeatureOverrides,
    deleteAllProjectOverrides,
} from '../utils/api'
import {
    UpdateSelfTargetingIdentityArgsSchema,
    SetSelfTargetingOverrideArgsSchema,
    ClearSelfTargetingOverridesArgsSchema,
} from '../types'
import { ToolHandler } from '../server'

export const selfTargetingToolDefinitions: Tool[] = [
    {
        name: 'get_self_targeting_identity',
        description: 'Get current DevCycle identity for self-targeting',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'update_self_targeting_identity',
        description:
            'Update DevCycle identity for self-targeting and overrides',
        inputSchema: {
            type: 'object',
            properties: {
                dvc_user_id: {
                    type: 'string',
                    description:
                        'DevCycle User ID for self-targeting (use null or empty string to clear)',
                },
            },
            required: ['dvc_user_id'],
        },
    },
    {
        name: 'list_self_targeting_overrides',
        description:
            'List all self-targeting overrides for the current project',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'set_self_targeting_override',
        description: 'Set a self-targeting override for a feature variation',
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
                variation_key: {
                    type: 'string',
                    description: 'The key of the variation to serve',
                },
            },
            required: ['feature_key', 'environment_key', 'variation_key'],
        },
    },
    {
        name: 'clear_feature_self_targeting_overrides',
        description:
            'Clear self-targeting overrides for a specific feature/environment',
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
        name: 'clear_all_self_targeting_overrides',
        description:
            'Clear all self-targeting overrides for the current project',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
]

export const selfTargetingToolHandlers: Record<string, ToolHandler> = {
    get_self_targeting_identity: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithLogging(
            'getSelfTargetingIdentity',
            null,
            async (authToken, projectKey) => {
                return await fetchUserProfile(authToken, projectKey)
            },
        )
    },
    update_self_targeting_identity: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateSelfTargetingIdentityArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'updateSelfTargetingIdentity',
            validatedArgs,
            async (authToken, projectKey) => {
                return await updateUserProfile(authToken, projectKey, {
                    dvcUserId: validatedArgs.dvc_user_id,
                })
            },
        )
    },
    list_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithLogging(
            'listSelfTargetingOverrides',
            null,
            async (authToken, projectKey) => {
                return await fetchProjectOverridesForUser(authToken, projectKey)
            },
        )
    },
    set_self_targeting_override: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = SetSelfTargetingOverrideArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'setSelfTargetingOverride',
            validatedArgs,
            async (authToken, projectKey) => {
                return await updateOverride(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    {
                        environment: validatedArgs.environment_key,
                        variation: validatedArgs.variation_key,
                    },
                )
            },
        )
    },
    clear_feature_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ClearSelfTargetingOverridesArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'clearFeatureSelfTargetingOverrides',
            validatedArgs,
            async (authToken, projectKey) => {
                await deleteFeatureOverrides(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.environment_key,
                )

                return {
                    message: `Cleared override for feature '${validatedArgs.feature_key}' in environment '${validatedArgs.environment_key}'`,
                }
            },
        )
    },
    clear_all_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithLogging(
            'clearAllSelfTargetingOverrides',
            null,
            async (authToken, projectKey) => {
                await deleteAllProjectOverrides(authToken, projectKey)
                return { message: 'Cleared all overrides for the project' }
            },
        )
    },
}
