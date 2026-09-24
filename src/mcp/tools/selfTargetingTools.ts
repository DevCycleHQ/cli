import { z } from 'zod'
import {
    handleZodiosValidationErrors,
    MISSING_PROJECT_KEY_ERROR,
} from '../utils/api'
import { fetchUserProfile, updateUserProfile } from '../../api/userProfile'
import {
    fetchProjectOverridesForUser,
    updateOverride,
    deleteFeatureOverrides,
} from '../../api/overrides'
import {
    UpdateSelfTargetingIdentityArgsSchema,
    SetSelfTargetingOverrideArgsSchema,
    ClearSelfTargetingOverridesArgsSchema,
    ProjectScopedArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { dashboardLinks } from '../utils/dashboardLinks'

// Individual handler functions
export async function getSelfTargetingIdentityHandler(
    args: z.infer<typeof ProjectScopedArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'getSelfTargetingIdentity',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () => fetchUserProfile(authToken, projectKey),
                'fetchUserProfile',
            )
        },
        dashboardLinks.organization.profileOverrides,
    )
}

export async function updateSelfTargetingIdentityHandler(
    args: z.infer<typeof UpdateSelfTargetingIdentityArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'updateSelfTargetingIdentity',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateUserProfile(authToken, projectKey, {
                        dvcUserId:
                            typeof args.dvc_user_id === 'string' &&
                            args.dvc_user_id.trim() === ''
                                ? null
                                : args.dvc_user_id,
                    }),
                'updateUserProfile',
            )
        },
        dashboardLinks.organization.profileOverrides,
    )
}

export async function listSelfTargetingOverridesHandler(
    args: z.infer<typeof ProjectScopedArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listSelfTargetingOverrides',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () => fetchProjectOverridesForUser(authToken, projectKey),
                'fetchProjectOverridesForUser',
            )
        },
        dashboardLinks.organization.profileOverrides,
    )
}

export async function setSelfTargetingOverrideHandler(
    args: z.infer<typeof SetSelfTargetingOverrideArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'setSelfTargetingOverride',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateOverride(authToken, projectKey, args.feature_key, {
                        environment: args.environment_key,
                        variation: args.variation_key,
                    }),
                'updateOverride',
            )
        },
        dashboardLinks.organization.profileOverrides,
    )
}

export async function clearFeatureSelfTargetingOverridesHandler(
    args: z.infer<typeof ClearSelfTargetingOverridesArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'clearFeatureSelfTargetingOverrides',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            await handleZodiosValidationErrors(
                () =>
                    deleteFeatureOverrides(
                        authToken,
                        projectKey,
                        args.feature_key,
                        args.environment_key,
                    ),
                'deleteFeatureOverrides',
            )

            return {
                message: `Cleared override for feature '${args.feature_key}' in environment '${args.environment_key}'`,
            }
        },
        dashboardLinks.organization.profileOverrides,
    )
}

/**
 * Register self-targeting tools with the MCP server using the new direct registration pattern
 */
export function registerSelfTargetingTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'get_self_targeting_identity',
        {
            description: [
                'Get current DevCycle identity for self-targeting yourself into a feature.',
                'Your applications user_id used to identify yourself with the DevCycle SDK needs to match for self-targeting to work.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Get Self-Targeting Identity',
                readOnlyHint: true,
            },
            inputSchema: ProjectScopedArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs = ProjectScopedArgsSchema.parse(args)
            return await getSelfTargetingIdentityHandler(
                validatedArgs,
                apiClient,
            )
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_self_targeting_identity',
        {
            description: [
                'Update DevCycle identity for self-targeting yourself into a feature.',
                'Your applications user_id used to identify yourself with the DevCycle SDK needs to match for self-targeting to work.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Update Self-Targeting Identity',
            },
            inputSchema: UpdateSelfTargetingIdentityArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs =
                UpdateSelfTargetingIdentityArgsSchema.parse(args)
            return await updateSelfTargetingIdentityHandler(
                validatedArgs,
                apiClient,
            )
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'list_self_targeting_overrides',
        {
            description: [
                'List all self-targeting overrides for the current project.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'List Self-Targeting Overrides',
                readOnlyHint: true,
            },
            inputSchema: ProjectScopedArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs = ProjectScopedArgsSchema.parse(args)
            return await listSelfTargetingOverridesHandler(
                validatedArgs,
                apiClient,
            )
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'set_self_targeting_override',
        {
            description: [
                'Set a self-targeting override for a feature variation.',
                '⚠️ IMPORTANT: Always confirm with the user before setting overrides for production environments (environments where type = "production").',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Set Self-Targeting Override For Feature/Environment',
                destructiveHint: true,
            },
            inputSchema: SetSelfTargetingOverrideArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs = SetSelfTargetingOverrideArgsSchema.parse(args)
            return await setSelfTargetingOverrideHandler(
                validatedArgs,
                apiClient,
            )
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'clear_feature_self_targeting_overrides',
        {
            description: [
                'Clear self-targeting overrides for a specific feature/environment.',
                '⚠️ IMPORTANT: Always confirm with the user before clearing overrides for production environments (environments where type = "production").',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Clear Self-Targeting Override For Feature/Environment',
                destructiveHint: true,
            },
            inputSchema: ClearSelfTargetingOverridesArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs =
                ClearSelfTargetingOverridesArgsSchema.parse(args)
            return await clearFeatureSelfTargetingOverridesHandler(
                validatedArgs,
                apiClient,
            )
        },
    )
}
