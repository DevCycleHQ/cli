import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import { fetchUserProfile, updateUserProfile } from '../../api/userProfile'
import {
    fetchProjectOverridesForUser,
    updateOverride,
    deleteFeatureOverrides,
    deleteAllProjectOverrides,
} from '../../api/overrides'
import {
    UpdateSelfTargetingIdentityArgsSchema,
    SetSelfTargetingOverrideArgsSchema,
    ClearSelfTargetingOverridesArgsSchema,
} from '../types'
import { ToolHandler } from '../server'

// Helper functions to generate dashboard links
const generateSelfTargetingDashboardLink = (orgId: string): string => {
    return `https://app.devcycle.com/o/${orgId}/settings/profile-overrides`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const FEATURE_KEY_PROPERTY = {
    type: 'string' as const,
    description: 'The key of the feature',
}

const ENVIRONMENT_KEY_PROPERTY = {
    type: 'string' as const,
    description: 'The key of the environment',
}

const VARIATION_KEY_PROPERTY = {
    type: 'string' as const,
    description: 'The key of the variation to serve',
}

const DVC_USER_ID_PROPERTY = {
    type: 'string' as const,
    description:
        'DevCycle User ID for self-targeting (use null or empty string to clear)',
}

const OVERRIDE_COMMON_PROPERTIES = {
    feature_key: FEATURE_KEY_PROPERTY,
    environment_key: ENVIRONMENT_KEY_PROPERTY,
    variation_key: VARIATION_KEY_PROPERTY,
}

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

const USER_PROFILE_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'DevCycle user profile for self-targeting',
    properties: {
        dvcUserId: {
            type: 'string' as const,
            description: 'DevCycle User ID for self-targeting',
        },
    },
}

const OVERRIDE_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'A self-targeting override configuration',
    properties: {
        feature: {
            type: 'string' as const,
            description: 'Feature key',
        },
        environment: {
            type: 'string' as const,
            description: 'Environment key',
        },
        variation: {
            type: 'string' as const,
            description: 'Variation key',
        },
    },
    required: ['feature', 'environment', 'variation'],
}

const MESSAGE_RESPONSE_SCHEMA = {
    type: 'object' as const,
    description: 'Simple message response',
    properties: {
        message: {
            type: 'string' as const,
            description: 'Response message',
        },
    },
    required: ['message'],
}

const DASHBOARD_LINK_PROPERTY = {
    type: 'string' as const,
    format: 'uri' as const,
    description:
        'URL to view and manage self-targeting in the DevCycle dashboard',
}

// Complete output schema definitions
const GET_SELF_TARGETING_IDENTITY_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: USER_PROFILE_OBJECT_SCHEMA,
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

const UPDATE_SELF_TARGETING_IDENTITY_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: USER_PROFILE_OBJECT_SCHEMA,
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

const LIST_SELF_TARGETING_OVERRIDES_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: {
            type: 'array' as const,
            description: 'Array of self-targeting override objects',
            items: OVERRIDE_OBJECT_SCHEMA,
        },
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

const SET_SELF_TARGETING_OVERRIDE_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: OVERRIDE_OBJECT_SCHEMA,
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

const CLEAR_OVERRIDES_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: MESSAGE_RESPONSE_SCHEMA,
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const selfTargetingToolDefinitions: Tool[] = [
    {
        name: 'get_self_targeting_identity',
        description:
            'Get current DevCycle identity for self-targeting. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        outputSchema: GET_SELF_TARGETING_IDENTITY_OUTPUT_SCHEMA,
    },
    {
        name: 'update_self_targeting_identity',
        description:
            'Update DevCycle identity for self-targeting and overrides. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: {
                dvc_user_id: DVC_USER_ID_PROPERTY,
            },
            required: ['dvc_user_id'],
        },
        outputSchema: UPDATE_SELF_TARGETING_IDENTITY_OUTPUT_SCHEMA,
    },
    {
        name: 'list_self_targeting_overrides',
        description:
            'List all self-targeting overrides for the current project. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        outputSchema: LIST_SELF_TARGETING_OVERRIDES_OUTPUT_SCHEMA,
    },
    {
        name: 'set_self_targeting_override',
        description:
            'Set a self-targeting override for a feature variation. ⚠️ IMPORTANT: Always confirm with the user before setting overrides for production environments (environments where type = "production"). Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: OVERRIDE_COMMON_PROPERTIES,
            required: ['feature_key', 'environment_key', 'variation_key'],
        },
        outputSchema: SET_SELF_TARGETING_OVERRIDE_OUTPUT_SCHEMA,
    },
    {
        name: 'clear_feature_self_targeting_overrides',
        description:
            'Clear self-targeting overrides for a specific feature/environment. ⚠️ IMPORTANT: Always confirm with the user before clearing overrides for production environments (environments where type = "production"). Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                environment_key: ENVIRONMENT_KEY_PROPERTY,
            },
            required: ['feature_key', 'environment_key'],
        },
        outputSchema: CLEAR_OVERRIDES_OUTPUT_SCHEMA,
    },
    {
        name: 'clear_all_self_targeting_overrides',
        description:
            'Clear all self-targeting overrides for the current project. ⚠️ IMPORTANT: Always confirm with the user before clearing all overrides as it can clear production environments (environments where type = "production"). Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        outputSchema: CLEAR_OVERRIDES_OUTPUT_SCHEMA,
    },
]

export const selfTargetingToolHandlers: Record<string, ToolHandler> = {
    get_self_targeting_identity: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithDashboardLink(
            'getSelfTargetingIdentity',
            null,
            async (authToken, projectKey) => {
                return await fetchUserProfile(authToken, projectKey)
            },
            generateSelfTargetingDashboardLink,
        )
    },
    update_self_targeting_identity: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateSelfTargetingIdentityArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateSelfTargetingIdentity',
            validatedArgs,
            async (authToken, projectKey) => {
                return await updateUserProfile(authToken, projectKey, {
                    dvcUserId: validatedArgs.dvc_user_id,
                })
            },
            generateSelfTargetingDashboardLink,
        )
    },
    list_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithDashboardLink(
            'listSelfTargetingOverrides',
            null,
            async (authToken, projectKey) => {
                return await fetchProjectOverridesForUser(authToken, projectKey)
            },
            generateSelfTargetingDashboardLink,
        )
    },
    set_self_targeting_override: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = SetSelfTargetingOverrideArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
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
            generateSelfTargetingDashboardLink,
        )
    },
    clear_feature_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ClearSelfTargetingOverridesArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
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
            generateSelfTargetingDashboardLink,
        )
    },
    clear_all_self_targeting_overrides: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithDashboardLink(
            'clearAllSelfTargetingOverrides',
            null,
            async (authToken, projectKey) => {
                await deleteAllProjectOverrides(authToken, projectKey)
                return { message: 'Cleared all overrides for the project' }
            },
            generateSelfTargetingDashboardLink,
        )
    },
}
