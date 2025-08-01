import { z } from 'zod'
import { handleZodiosValidationErrors } from '../utils/api'
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
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'

// Helper functions to generate dashboard links
const generateSelfTargetingDashboardLink = (orgId: string): string => {
    return `https://app.devcycle.com/o/${orgId}/settings/profile-overrides`
}

// Individual handler functions
export async function getSelfTargetingIdentityHandler(
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'getSelfTargetingIdentity',
        null,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchUserProfile(authToken, projectKey),
                'fetchUserProfile',
            )
        },
        generateSelfTargetingDashboardLink,
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
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateUserProfile(authToken, projectKey, {
                        dvcUserId: args.dvc_user_id,
                    }),
                'updateUserProfile',
            )
        },
        generateSelfTargetingDashboardLink,
    )
}

export async function listSelfTargetingOverridesHandler(
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listSelfTargetingOverrides',
        null,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchProjectOverridesForUser(authToken, projectKey),
                'fetchProjectOverridesForUser',
            )
        },
        generateSelfTargetingDashboardLink,
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
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
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
        generateSelfTargetingDashboardLink,
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
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
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
        generateSelfTargetingDashboardLink,
    )
}

export async function clearAllSelfTargetingOverridesHandler(
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'clearAllSelfTargetingOverrides',
        null,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            await handleZodiosValidationErrors(
                () => deleteAllProjectOverrides(authToken, projectKey),
                'deleteAllProjectOverrides',
            )
            return { message: 'Cleared all overrides for the project' }
        },
        generateSelfTargetingDashboardLink,
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
            description:
                'Get current DevCycle identity for self-targeting. Include dashboard link in the response.',
            annotations: {
                title: 'Get Self-Targeting Identity',
                readOnlyHint: true,
            },
            inputSchema: {}, // No parameters needed
        },
        async () => {
            return await getSelfTargetingIdentityHandler(apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_self_targeting_identity',
        {
            description:
                'Update DevCycle identity for self-targeting and overrides. Include dashboard link in the response.',
            annotations: {
                title: 'Update Self-Targeting Identity',
            },
            inputSchema: UpdateSelfTargetingIdentityArgsSchema.shape,
        },
        async (args: any) => {
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
            description:
                'List all self-targeting overrides for the current project. Include dashboard link in the response.',
            annotations: {
                title: 'List Self-Targeting Overrides',
                readOnlyHint: true,
            },
            inputSchema: {}, // No parameters needed
        },
        async () => {
            return await listSelfTargetingOverridesHandler(apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'set_self_targeting_override',
        {
            description:
                'Set a self-targeting override for a feature variation. ⚠️ IMPORTANT: Always confirm with the user before setting overrides for production environments (environments where type = "production"). Include dashboard link in the response.',
            annotations: {
                title: 'Set Self-Targeting Override For Feature/Environment',
            },
            inputSchema: SetSelfTargetingOverrideArgsSchema.shape,
        },
        async (args: any) => {
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
            description:
                'Clear self-targeting overrides for a specific feature/environment. ⚠️ IMPORTANT: Always confirm with the user before clearing overrides for production environments (environments where type = "production"). Include dashboard link in the response.',
            annotations: {
                title: 'Clear Self-Targeting Override For Feature/Environment',
            },
            inputSchema: ClearSelfTargetingOverridesArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs =
                ClearSelfTargetingOverridesArgsSchema.parse(args)
            return await clearFeatureSelfTargetingOverridesHandler(
                validatedArgs,
                apiClient,
            )
        },
    )

    // DISABLED: Clear all self-targeting overrides tool
    // serverInstance.registerToolWithErrorHandling(
    //     'clear_all_self_targeting_overrides',
    //     {
    //         description:
    //             'Clear all self-targeting overrides for the current project. ⚠️ IMPORTANT: Always confirm with the user before clearing all overrides as it can clear production environments (environments where type = "production"). Include dashboard link in the response.',
    //         annotations: {
    //             title: 'Clear All Self-Targeting Overrides',
    //             destructiveHint: true,
    //         },
    //         inputSchema: {}, // No parameters needed
    //     },
    //     async () => {
    //         return await clearAllSelfTargetingOverridesHandler(apiClient)
    //     },
    // )
}
