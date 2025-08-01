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
    SetFeatureTargetingArgsSchema,
    ListVariationsArgsSchema,
    CreateVariationArgsSchema,
    UpdateVariationArgsSchema,
    ListFeatureTargetingArgsSchema,
    UpdateFeatureTargetingArgsSchema,
    GetFeatureAuditLogHistoryArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { handleZodiosValidationErrors } from '../utils/api'

// Helper functions to generate feature dashboard links
const generateFeaturesDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
): string => {
    if (!projectKey) {
        throw new Error(
            'Project key is required for features dashboard link. Please select a project using the selecting a project first.',
        )
    }
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/features`
}

const generateFeatureDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
    featureKey: string,
    page: 'overview' | 'manage-feature' | 'audit-log' = 'overview',
): string => {
    if (!projectKey) {
        throw new Error(
            'Project key is required for feature dashboard link. Please select a project using the selecting a project first.',
        )
    }
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/features/${featureKey}/${page}`
}

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
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchFeatures(authToken, projectKey, args),
                'listFeatures',
            )
        },
        generateFeaturesDashboardLink,
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
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => createFeature(authToken, projectKey, args),
                'createFeature',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            generateFeatureDashboardLink(
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
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => updateFeature(authToken, projectKey, key, updateData),
                'updateFeature',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            generateFeatureDashboardLink(
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
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateFeatureStatus(authToken, projectKey, key, statusData),
                'updateFeatureStatus',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            generateFeatureDashboardLink(
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
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
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
        generateFeaturesDashboardLink,
    )
}

export async function fetchFeatureVariationsHandler(
    args: z.infer<typeof ListVariationsArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'fetchFeatureVariations',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchVariations(authToken, projectKey, args.feature_key),
                'fetchVariations',
            )
        },
        (orgId: string, projectKey: string | undefined) =>
            generateFeatureDashboardLink(
                orgId,
                projectKey,
                args.feature_key,
                'overview',
            ),
    )
}

export async function createFeatureVariationHandler(
    args: z.infer<typeof CreateVariationArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { feature_key, ...variationData } = args

    return await apiClient.executeWithDashboardLink(
        'createFeatureVariation',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    createVariation(
                        authToken,
                        projectKey,
                        feature_key,
                        variationData,
                    ),
                'createVariation',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            generateFeatureDashboardLink(
                orgId,
                projectKey,
                result.key,
                'manage-feature',
            ),
    )
}

export async function updateFeatureVariationHandler(
    args: z.infer<typeof UpdateVariationArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { feature_key, variation_key, ...variationData } = args

    return await apiClient.executeWithDashboardLink(
        'updateFeatureVariation',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateVariation(
                        authToken,
                        projectKey,
                        feature_key,
                        variation_key,
                        variationData,
                    ),
                'updateVariation',
            )
        },
        (orgId: string, projectKey: string | undefined, result: any) =>
            generateFeatureDashboardLink(
                orgId,
                projectKey,
                result.key,
                'manage-feature',
            ),
    )
}

export async function setFeatureTargetingHandler(
    args: z.infer<typeof SetFeatureTargetingArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const operation = args.enabled ? 'enableTargeting' : 'disableTargeting'
    const apiFunction = args.enabled ? enableTargeting : disableTargeting

    return await apiClient.executeWithDashboardLink(
        operation,
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please selecting a project first.',
                )
            }
            await handleZodiosValidationErrors(
                () =>
                    apiFunction(
                        authToken,
                        projectKey,
                        args.feature_key,
                        args.environment_key,
                    ),
                operation,
            )
            const action = args.enabled ? 'enabled' : 'disabled'
            return {
                message: `Targeting ${action} for feature '${args.feature_key}' in environment '${args.environment_key}'`,
            }
        },
        (orgId: string, projectKey: string | undefined) =>
            generateFeatureDashboardLink(
                orgId,
                projectKey,
                args.feature_key,
                'manage-feature',
            ),
    )
}

export async function listFeatureTargetingHandler(
    args: z.infer<typeof ListFeatureTargetingArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listFeatureTargeting',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    fetchTargetingForFeature(
                        authToken,
                        projectKey,
                        args.feature_key,
                        args.environment_key,
                    ),
                'fetchTargetingForFeature',
            )
        },
        (orgId: string, projectKey: string | undefined) =>
            generateFeatureDashboardLink(
                orgId,
                projectKey,
                args.feature_key,
                'manage-feature',
            ),
    )
}

export async function updateFeatureTargetingHandler(
    args: z.infer<typeof UpdateFeatureTargetingArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { feature_key, environment_key, ...configData } = args

    return await apiClient.executeWithDashboardLink(
        'updateFeatureTargeting',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateFeatureConfigForEnvironment(
                        authToken,
                        projectKey,
                        feature_key,
                        environment_key,
                        configData,
                    ),
                'updateFeatureConfigForEnvironment',
            )
        },
        (orgId: string, projectKey: string | undefined) =>
            generateFeatureDashboardLink(
                orgId,
                projectKey,
                args.feature_key,
                'manage-feature',
            ),
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
                    'Project key is required for this operation. Please select a project using the selecting a project first.',
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
            generateFeatureDashboardLink(
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
            description:
                'List features in the current project. Include dashboard link in the response.',
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

    serverInstance.registerToolWithErrorHandling(
        'create_feature',
        {
            description:
                'Create a new feature flag. If a user is creating a feature, you should follow this up by creating a Variable and Variations for the feature and setting the initial targeting for at least the development environment. Include dashboard link in the response.',
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
            description:
                'Update an existing feature flag. ⚠️ IMPORTANT: Changes to feature flags may affect production environments. Always confirm with the user before making changes to features that are active in production. Include dashboard link in the response.',
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
            description:
                'Update the status of an existing feature flag. ⚠️ IMPORTANT: Changes to feature status may affect production environments. Always confirm with the user before making changes to features that are active in production. Include dashboard link in the response.',
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
            description:
                'Delete an existing feature flag. ⚠️ CRITICAL: Deleting a feature flag will remove it from ALL environments including production. ALWAYS confirm with the user before deleting any feature flag. Include dashboard link in the response.',
            annotations: {
                title: 'Delete Feature Flag',
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
        'fetch_feature_variations',
        {
            description:
                'Get a list of variations for a feature. Include dashboard link in the response.',
            annotations: {
                title: 'Get Feature Variations',
                readOnlyHint: true,
            },
            inputSchema: ListVariationsArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = ListVariationsArgsSchema.parse(args)
            return await fetchFeatureVariationsHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'create_feature_variation',
        {
            description:
                'Create a new variation within a feature. Include dashboard link in the response.',
            annotations: {
                title: 'Create Feature Variation',
            },
            inputSchema: CreateVariationArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = CreateVariationArgsSchema.parse(args)
            return await createFeatureVariationHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_feature_variation',
        {
            description:
                'Update an existing variation by key. ⚠️ WARNING: Updating a feature variation may affect production environments. Include dashboard link in the response.',
            annotations: {
                title: 'Update Feature Variation',
                destructiveHint: true,
            },
            inputSchema: UpdateVariationArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpdateVariationArgsSchema.parse(args)
            return await updateFeatureVariationHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'set_feature_targeting',
        {
            description:
                'Set targeting status for a feature in an environment. ⚠️ IMPORTANT: Always confirm with the user before making changes to production environments (environments where type = "production"). Include dashboard link in the response.',
            annotations: {
                title: 'Set Feature Targeting',
                destructiveHint: true,
            },
            inputSchema: SetFeatureTargetingArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = SetFeatureTargetingArgsSchema.parse(args)
            return await setFeatureTargetingHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'list_feature_targeting',
        {
            description:
                'List feature configurations (targeting rules) for a feature. Include dashboard link in the response.',
            annotations: {
                title: 'List Feature Targeting Rules',
                readOnlyHint: true,
            },
            inputSchema: ListFeatureTargetingArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = ListFeatureTargetingArgsSchema.parse(args)
            return await listFeatureTargetingHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_feature_targeting',
        {
            description:
                'Update feature configuration (targeting rules) for a feature in an environment. ⚠️ IMPORTANT: Always confirm with the user before making changes to production environments (environments where type = "production"). Include dashboard link in the response.',
            annotations: {
                title: 'Update Feature Targeting Rules',
                destructiveHint: true,
            },
            inputSchema: UpdateFeatureTargetingArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpdateFeatureTargetingArgsSchema.parse(args)
            return await updateFeatureTargetingHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'get_feature_audit_log_history',
        {
            description:
                'Get feature flag audit log history from DevCycle. Include dashboard link in the response.',
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
}
