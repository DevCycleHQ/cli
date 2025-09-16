import { z } from 'zod'
import {
    fetchFeatures,
    createFeature,
    updateFeature,
    updateFeatureStatus,
    deleteFeature,
    getFeatureAuditLogHistory,
} from '../../api/features'

import {
    ListFeaturesArgsSchema,
    CreateFeatureArgsSchema,
    UpdateFeatureArgsSchema,
    UpdateFeatureStatusArgsSchema,
    DeleteFeatureArgsSchema,
    GetFeatureAuditLogHistoryArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { handleZodiosValidationErrors } from '../utils/api'
import { dashboardLinks } from '../utils/dashboardLinks'
import { fetchAiPromptsAndRules } from '../utils/github'
import { CleanupFeatureArgsSchema } from '../types'

// Individual handler functions
export async function listFeaturesHandler(
    args: z.infer<typeof ListFeaturesArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listFeatures',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchFeatures(authToken, projectKey, args),
                'listFeatures',
            )
        },
        dashboardLinks.feature.list,
    )
}

export async function createFeatureHandler(
    args: z.infer<typeof CreateFeatureArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    if (!args.key || !args.name) {
        throw new Error('Feature key and name are required')
    }

    return await apiClient.executeWithDashboardLink(
        'createFeature',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => createFeature(authToken, projectKey, args),
                'createFeature',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            dashboardLinks.feature.dashboard(
                orgId,
                projectKey,
                result.key,
                'overview',
            ),
    )
}

export async function updateFeatureHandler(
    args: z.infer<typeof UpdateFeatureArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { key, ...updateData } = args

    return await apiClient.executeWithDashboardLink(
        'updateFeature',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => updateFeature(authToken, projectKey, key, updateData),
                'updateFeature',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            dashboardLinks.feature.dashboard(
                orgId,
                projectKey,
                result.key,
                'manage-feature',
            ),
    )
}

export async function updateFeatureStatusHandler(
    args: z.infer<typeof UpdateFeatureStatusArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { key, ...statusData } = args

    return await apiClient.executeWithDashboardLink(
        'updateFeatureStatus',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateFeatureStatus(authToken, projectKey, key, statusData),
                'updateFeatureStatus',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            dashboardLinks.feature.dashboard(
                orgId,
                projectKey,
                result.key,
                'overview',
            ),
    )
}

export async function deleteFeatureHandler(
    args: z.infer<typeof DeleteFeatureArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'deleteFeature',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            await handleZodiosValidationErrors(
                () => deleteFeature(authToken, projectKey, args.key),
                'deleteFeature',
            )
            return {
                message: `Feature '${args.key}' deleted successfully`,
            }
        },
        dashboardLinks.feature.list,
    )
}

export async function getFeatureAuditLogHistoryHandler(
    args: z.infer<typeof GetFeatureAuditLogHistoryArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'getFeatureAuditLogHistory',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            const { feature_key, ...auditLogOptions } = args
            return await handleZodiosValidationErrors(
                () =>
                    getFeatureAuditLogHistory(
                        authToken,
                        projectKey,
                        feature_key,
                        auditLogOptions,
                    ),
                'getFeatureAuditLogHistory',
            )
        },
        (orgId: string, projectKey: string | undefined) =>
            dashboardLinks.feature.dashboard(
                orgId,
                projectKey,
                args.feature_key,
                'audit-log',
            ),
    )
}

/**
 * Register feature tools with the MCP server using the new direct registration pattern
 */
export function registerFeatureTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'list_features',
        {
            description: [
                'List features in the current project.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'List Feature Flags',
                readOnlyHint: true,
            },
            inputSchema: ListFeaturesArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = ListFeaturesArgsSchema.parse(args)
            return await listFeaturesHandler(validatedArgs, apiClient)
        },
    )

    const featureDescription = [
        'Features are the main logical container for variables and targeting rules, defining what values variables will be served to users across environments.',
        'Features can contain multiple variables, and many variations, defined by the targeting rules to determine how variable values are distributed to users.',
        'Feature configurations determine the targeting rules applied for a user per environment. Configurations that are "active" (on) will serve the feature to configured users.',
        'When turning on/off configurations for a feature, keep existing targeting rules.',
    ]

    serverInstance.registerToolWithErrorHandling(
        'create_feature',
        {
            description: [
                'Create a new DevCycle feature. Include dashboard link in the response.',
                ...featureDescription,
                'If a user is creating a feature, you should follow these steps and ask users for input on these steps:',
                '1. create a variable and associate it with this feature. (default to creating a "boolean" variable with the same key as the feature)',
                '2. create variations for the feature. (default to creating an "on" and "off" variation)',
                '3. set and enable initial targeting for at least the development environment. (default to all users with variation "on", unless otherwise specified). Make sure to name any rules created.',
            ].join('\n'),
            annotations: {
                title: 'Create Feature Flag',
            },
            inputSchema: CreateFeatureArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = CreateFeatureArgsSchema.parse(args)
            return await createFeatureHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_feature',
        {
            description: [
                'Update an existing feature flag.',
                'Consider this a PATCH request to the feature, to update feature configuration, variables, variations, and targeting rules. Be careful to not overwrite existing data with the PATCH request.',
                ...featureDescription,
                '⚠️ IMPORTANT: Changes to feature flags may affect production environments if production environment configurations are "active".',
                'Always confirm with the user before making changes to features that have production environment configurations that are "active".',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Update Feature Flag',
                destructiveHint: true,
            },
            inputSchema: UpdateFeatureArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpdateFeatureArgsSchema.parse(args)
            return await updateFeatureHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_feature_status',
        {
            description: [
                'Update the status of an existing feature.',
                '⚠️ IMPORTANT: Changes to feature status may affect production environments.',
                'Always confirm with the user before making changes to features that are active in production.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Update Feature Flag Status',
                destructiveHint: true,
            },
            inputSchema: UpdateFeatureStatusArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpdateFeatureStatusArgsSchema.parse(args)
            return await updateFeatureStatusHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'delete_feature',
        {
            description: [
                'Delete an existing feature.',
                '⚠️ CRITICAL: Deleting a feature will remove it from ALL environments including production.',
                'ALWAYS confirm with the user before deleting any feature.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Delete Feature',
                destructiveHint: true,
            },
            inputSchema: DeleteFeatureArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = DeleteFeatureArgsSchema.parse(args)
            return await deleteFeatureHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'get_feature_audit_log_history',
        {
            description: [
                'Get feature audit log history from DevCycle.',
                'Returns audit log data for all changes made to a feature / variation / targeting rule ordered by date.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Get Feature Audit Log History',
                readOnlyHint: true,
            },
            inputSchema: GetFeatureAuditLogHistoryArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs =
                GetFeatureAuditLogHistoryArgsSchema.parse(args)
            return await getFeatureAuditLogHistoryHandler(
                validatedArgs,
                apiClient,
            )
        },
    )

    // Cleanup Feature Prompt tool: fetches the cleanup prompt from GitHub
    serverInstance.registerToolWithErrorHandling(
        'cleanup_feature',
        {
            description: [
                'Fetch the DevCycle Feature Cleanup prompt and return its markdown content.',
                'Use this to guide safe cleanup of a completed feature and its variables in codebases.',
                'Includes steps to analyze production state, complete the feature, and remove variables.',
            ].join('\n'),
            annotations: {
                title: 'Cleanup Feature Prompt',
                readOnlyHint: true,
            },
            inputSchema: CleanupFeatureArgsSchema.shape,
        },
        async (args: unknown) => {
            // validate args
            CleanupFeatureArgsSchema.parse(args)
            return await fetchAiPromptsAndRules(
                'clean-up-prompts/clean-up.md',
                'Cleanup prompt not found at clean-up-prompts/clean-up.md.',
            )
        },
    )
}
