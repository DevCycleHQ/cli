import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
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
        return await apiClient.getSelfTargetingIdentity()
    },
    update_self_targeting_identity: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateSelfTargetingIdentityArgsSchema.parse(args)
        return await apiClient.updateSelfTargetingIdentity(validatedArgs)
    },
    list_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.listSelfTargetingOverrides()
    },
    set_self_targeting_override: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = SetSelfTargetingOverrideArgsSchema.parse(args)
        return await apiClient.setSelfTargetingOverride(validatedArgs)
    },
    clear_feature_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ClearSelfTargetingOverridesArgsSchema.parse(args)
        return await apiClient.clearFeatureSelfTargetingOverrides(validatedArgs)
    },
    clear_all_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.clearAllSelfTargetingOverrides()
    },
}
