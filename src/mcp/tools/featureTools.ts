import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
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
    EnableTargetingArgsSchema,
    DisableTargetingArgsSchema,
    ListVariationsArgsSchema,
    CreateVariationArgsSchema,
    UpdateVariationArgsSchema,
    ListFeatureTargetingArgsSchema,
    UpdateFeatureTargetingArgsSchema,
    GetFeatureAuditLogHistoryArgsSchema,
} from '../types'
import { ToolHandler } from '../server'
import {
    DASHBOARD_LINK_PROPERTY,
    MESSAGE_RESPONSE_SCHEMA,
    FEATURE_KEY_PROPERTY,
    ENVIRONMENT_KEY_PROPERTY,
    VARIATION_KEY_PROPERTY,
    TARGET_AUDIENCE_PROPERTY,
} from './commonSchemas'
import { handleZodiosValidationErrors } from '../utils/api'

// Helper function to generate feature dashboard links
const generateFeaturesDashboardLink = (
    orgId: string,
    projectKey: string,
): string => {
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/features`
}

const generateFeatureDashboardLink = (
    orgId: string,
    projectKey: string,
    featureKey: string,
    page: 'overview' | 'manage-feature' | 'audit-log' = 'overview',
): string => {
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/features/${featureKey}/${page}`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const ENVIRONMENT_KEY_OPTIONAL_PROPERTY = {
    type: 'string' as const,
    description: 'Optional environment key to filter by',
}

const FEATURE_NAME_PROPERTY = {
    type: 'string' as const,
    description: 'Human-readable feature name (max 100 characters)',
}

const FEATURE_DESCRIPTION_PROPERTY = {
    type: 'string' as const,
    description: 'Feature description (max 1000 characters)',
}

const FEATURE_TYPE_PROPERTY = {
    type: 'string' as const,
    enum: ['release', 'experiment', 'permission', 'ops'] as const,
    description: 'Feature type',
}

const FEATURE_STATUS_PROPERTY = {
    type: 'string' as const,
    enum: ['active', 'complete', 'archived'] as const,
    description: 'Feature status',
}

const CONTROL_VARIATION_PROPERTY = {
    type: 'string' as const,
    description:
        'The key of the variation that is used as the control variation for Metrics',
}

const FEATURE_PAGINATION_PROPERTIES = {
    page: {
        type: 'number' as const,
        description: 'Page number',
        minimum: 1,
        default: 1,
    },
    perPage: {
        type: 'number' as const,
        description: 'Items per page',
        minimum: 1,
        maximum: 1000,
        default: 100,
    },
    sortBy: {
        type: 'string' as const,
        description: 'Sort field',
        enum: [
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ],
        default: 'createdAt',
    },
    sortOrder: {
        type: 'string' as const,
        description: 'Sort order',
        enum: ['asc', 'desc'],
        default: 'desc',
    },
    search: {
        type: 'string' as const,
        description: 'Search query to filter results',
        minLength: 3,
    },
    createdBy: {
        type: 'string' as const,
        description: 'Filter by creator',
    },
    type: {
        type: 'string' as const,
        description: 'Filter by feature type',
        enum: ['release', 'experiment', 'permission', 'ops'],
    },
    status: {
        type: 'string' as const,
        description: 'Filter by feature status',
        enum: ['active', 'complete', 'archived'],
    },
    staleness: {
        type: 'string' as const,
        description: 'Filter by feature staleness',
        enum: ['all', 'unused', 'released', 'unmodified', 'notStale'],
    },
}

const FEATURE_SETTINGS_PROPERTY = {
    type: 'object' as const,
    description: 'Feature-level settings (all properties required if provided)',
    properties: {
        publicName: {
            type: 'string' as const,
            description: 'Public name for the feature (max 100 characters)',
        },
        publicDescription: {
            type: 'string' as const,
            description:
                'Public description for the feature (max 1000 characters)',
        },
        optInEnabled: {
            type: 'boolean' as const,
            description: 'Whether opt-in is enabled for the feature',
        },
    },
    required: ['publicName', 'publicDescription', 'optInEnabled'] as const,
}

const SDK_VISIBILITY_PROPERTY = {
    type: 'object' as const,
    properties: {
        mobile: {
            type: 'boolean' as const,
        },
        client: {
            type: 'boolean' as const,
        },
        server: {
            type: 'boolean' as const,
        },
    },
    description:
        'SDK Type Visibility Settings for mobile, client, and server SDKs',
    required: ['mobile', 'client', 'server'] as const,
}

const FEATURE_VARIABLES_PROPERTY = {
    type: 'array' as const,
    description:
        'Array of variables to create or reassociate with this feature',
    items: {
        type: 'object' as const,
        description: 'Variable creation or reassociation data',
    },
}

const VARIATION_NAME_PROPERTY = {
    type: 'string' as const,
    description: 'Human-readable variation name (max 100 characters)',
}

const VARIATION_VARIABLES_PROPERTY = {
    type: 'object' as const,
    description:
        'Key-value map of variable keys to their values for this variation (supports string, number, boolean, and object values)',
    additionalProperties: true,
}

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

const FEATURE_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'A DevCycle feature configuration',
    properties: {
        _id: {
            type: 'string' as const,
            description: 'MongoDB ID for the feature',
        },
        key: FEATURE_KEY_PROPERTY,
        name: FEATURE_NAME_PROPERTY,
        description: FEATURE_DESCRIPTION_PROPERTY,
        type: FEATURE_TYPE_PROPERTY,
        status: FEATURE_STATUS_PROPERTY,
        variations: {
            type: 'array' as const,
            description: 'Array of variations for this feature',
        },
        createdAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the feature was created',
        },
        updatedAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the feature was last updated',
        },
    },
    required: [
        '_id',
        'key',
        'name',
        'type',
        'status',
        'createdAt',
        'updatedAt',
    ],
}

const VARIATION_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'A feature variation configuration',
    properties: {
        _id: {
            type: 'string' as const,
            description: 'MongoDB ID for the variation',
        },
        key: VARIATION_KEY_PROPERTY,
        name: {
            type: 'string' as const,
        },
        variables: {
            type: 'object' as const,
            description: 'Variable values for this variation',
        },
    },
    required: ['_id', 'key', 'name'],
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const featureToolDefinitions: Tool[] = [
    {
        name: 'list_features',
        description:
            'List features in the current project. Include dashboard link in the response.',
        annotations: {
            title: 'List Feature Flags',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: FEATURE_PAGINATION_PROPERTIES,
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'array' as const,
                    description: 'Array of feature objects in the project',
                    items: FEATURE_OBJECT_SCHEMA,
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'create_feature',
        description:
            'Create a new feature flag. Include dashboard link in the response.',
        annotations: {
            title: 'Create Feature Flag',
        },
        inputSchema: {
            type: 'object',
            properties: {
                key: FEATURE_KEY_PROPERTY,
                name: FEATURE_NAME_PROPERTY,
                description: FEATURE_DESCRIPTION_PROPERTY,
                type: FEATURE_TYPE_PROPERTY,
                tags: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    description: 'Tags to organize features',
                },
                controlVariation: CONTROL_VARIATION_PROPERTY,
                settings: FEATURE_SETTINGS_PROPERTY,
                sdkVisibility: SDK_VISIBILITY_PROPERTY,
                variables: FEATURE_VARIABLES_PROPERTY,
                variations: {
                    type: 'array',
                    description: 'Array of variations for this feature',
                    items: {
                        type: 'object',
                        description: 'Variation data with key, name, variables',
                    },
                },
                configurations: {
                    type: 'object',
                    description:
                        'Environment-specific configurations (key-value map of environment keys to config)',
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            targets: {
                                type: 'array',
                                description:
                                    'Targeting rules for this environment',
                            },
                            status: FEATURE_STATUS_PROPERTY,
                        },
                    },
                },
            },
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: FEATURE_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'update_feature',
        description:
            'Update an existing feature flag. ⚠️ IMPORTANT: Changes to feature flags may affect production environments. Always confirm with the user before making changes to features that are active in production. Include dashboard link in the response.',
        annotations: {
            title: 'Update Feature Flag',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                key: FEATURE_KEY_PROPERTY,
                name: FEATURE_NAME_PROPERTY,
                description: FEATURE_DESCRIPTION_PROPERTY,
                type: FEATURE_TYPE_PROPERTY,
                tags: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    description: 'Tags to organize Features on the dashboard',
                },
                controlVariation: CONTROL_VARIATION_PROPERTY,
                settings: FEATURE_SETTINGS_PROPERTY,
                sdkVisibility: SDK_VISIBILITY_PROPERTY,
                variables: FEATURE_VARIABLES_PROPERTY,
                variations: {
                    type: 'array',
                    description: 'Array of variations for this feature',
                    items: {
                        type: 'object',
                        description:
                            'Variation data with key, name, variables, and _id',
                    },
                },
            },
            required: ['key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: FEATURE_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'update_feature_status',
        description:
            'Update the status of an existing feature flag. ⚠️ IMPORTANT: Changes to feature status may affect production environments. Always confirm with the user before making changes to features that are active in production. Include dashboard link in the response.',
        annotations: {
            title: 'Update Feature Flag Status',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                key: FEATURE_KEY_PROPERTY,
                status: FEATURE_STATUS_PROPERTY,
                staticVariation: {
                    type: 'string',
                    description:
                        'The variation key or ID to serve if the status is set to complete (optional)',
                },
            },
            required: ['key', 'status'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: FEATURE_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'delete_feature',
        description:
            'Delete an existing feature flag. ⚠️ CRITICAL: Deleting a feature flag will remove it from ALL environments including production. ALWAYS confirm with the user before deleting any feature flag. Include dashboard link in the response.',
        annotations: {
            title: 'Delete Feature Flag',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    description: 'The key of the feature to delete',
                },
            },
            required: ['key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: MESSAGE_RESPONSE_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'fetch_feature_variations',
        description:
            'Get a list of variations for a feature. Include dashboard link in the response.',
        annotations: {
            title: 'Get Feature Variations',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
            },
            required: ['feature_key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'array' as const,
                    description: 'Array of variation objects for the feature',
                    items: VARIATION_OBJECT_SCHEMA,
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'create_feature_variation',
        description:
            'Create a new variation within a feature. Include dashboard link in the response.',
        annotations: {
            title: 'Create Feature Variation',
        },
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                key: VARIATION_KEY_PROPERTY,
                name: VARIATION_NAME_PROPERTY,
                variables: {
                    type: 'object',
                    description:
                        'Optional key-value map of variable keys to their values for this variation (supports string, number, boolean, and object values)',
                    additionalProperties: true,
                },
            },
            required: ['feature_key', 'key', 'name'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: VARIATION_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'update_feature_variation',
        description:
            'Update an existing variation by key. Include dashboard link in the response.',
        annotations: {
            title: 'Update Feature Variation',
        },
        inputSchema: {
            type: 'object',
            properties: {
                _id: {
                    type: 'string',
                    description: 'MongoDB ID for the variation',
                },
                feature_key: FEATURE_KEY_PROPERTY,
                variation_key: VARIATION_KEY_PROPERTY,
                key: VARIATION_KEY_PROPERTY,
                name: VARIATION_NAME_PROPERTY,
                variables: VARIATION_VARIABLES_PROPERTY,
            },
            required: ['feature_key', 'variation_key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: VARIATION_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'enable_feature_targeting',
        description:
            'Enable targeting for a feature in an environment. ⚠️ IMPORTANT: Always confirm with the user before making changes to production environments (environments where type = "production"). Include dashboard link in the response.',
        annotations: {
            title: 'Enable Feature Targeting',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                environment_key: ENVIRONMENT_KEY_PROPERTY,
            },
            required: ['feature_key', 'environment_key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: MESSAGE_RESPONSE_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'disable_feature_targeting',
        description:
            'Disable targeting for a feature in an environment. ⚠️ IMPORTANT: Always confirm with the user before making changes to production environments (environments where type = "production"). Include dashboard link in the response.',
        annotations: {
            title: 'Disable Feature Targeting',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                environment_key: ENVIRONMENT_KEY_PROPERTY,
            },
            required: ['feature_key', 'environment_key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: MESSAGE_RESPONSE_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'list_feature_targeting',
        description:
            'List feature configurations (targeting rules) for a feature. Include dashboard link in the response.',
        annotations: {
            title: 'List Feature Targeting Rules',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                environment_key: ENVIRONMENT_KEY_OPTIONAL_PROPERTY,
            },
            required: ['feature_key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'object' as const,
                    description: 'Feature targeting configuration object',
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'update_feature_targeting',
        description:
            'Update feature configuration (targeting rules) for a feature in an environment. ⚠️ IMPORTANT: Always confirm with the user before making changes to production environments (environments where type = "production"). Include dashboard link in the response.',
        annotations: {
            title: 'Update Feature Targeting Rules',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                environment_key: ENVIRONMENT_KEY_PROPERTY,
                status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'archived'],
                    description: 'The targeting status for the feature',
                },
                targets: {
                    type: 'array',
                    description:
                        'Array of targeting rules/targets for the feature',
                    items: {
                        type: 'object',
                        properties: {
                            _id: {
                                type: 'string',
                                description: 'MongoDB ID for the target',
                            },
                            name: {
                                type: 'string',
                            },
                            audience: TARGET_AUDIENCE_PROPERTY,
                            distribution: {
                                type: 'array',
                                description:
                                    'Variation distribution for the target',
                                items: {
                                    type: 'object',
                                    properties: {
                                        percentage: {
                                            type: 'number',
                                            minimum: 0,
                                            maximum: 1,
                                            description:
                                                'Percentage of traffic for this variation (0-1)',
                                        },
                                        _variation: {
                                            type: 'string',
                                            description: 'Variation ID',
                                        },
                                    },
                                    required: ['percentage', '_variation'],
                                },
                            },
                            rollout: {
                                type: 'object',
                                description: 'Rollout configuration (optional)',
                                properties: {
                                    startPercentage: {
                                        type: 'number',
                                        minimum: 0,
                                        maximum: 1,
                                        description:
                                            'Starting percentage for rollout (optional)',
                                    },
                                    type: {
                                        type: 'string',
                                        enum: [
                                            'schedule',
                                            'gradual',
                                            'stepped',
                                        ],
                                        description: 'Rollout type',
                                    },
                                    startDate: {
                                        type: 'string',
                                        format: 'date-time',
                                        description: 'Rollout start date',
                                    },
                                    stages: {
                                        type: 'array',
                                        description:
                                            'Rollout stages (optional)',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                percentage: {
                                                    type: 'number',
                                                    minimum: 0,
                                                    maximum: 1,
                                                    description:
                                                        'Target percentage for this stage',
                                                },
                                                type: {
                                                    type: 'string',
                                                    enum: [
                                                        'linear',
                                                        'discrete',
                                                    ],
                                                    description: 'Stage type',
                                                },
                                                date: {
                                                    type: 'string',
                                                    format: 'date-time',
                                                    description:
                                                        'Date for this stage',
                                                },
                                            },
                                            required: [
                                                'percentage',
                                                'type',
                                                'date',
                                            ],
                                        },
                                    },
                                },
                                required: ['type', 'startDate'],
                            },
                        },
                        required: ['audience', 'distribution'],
                    },
                },
            },
            required: ['feature_key', 'environment_key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'object' as const,
                    description: 'Updated feature targeting configuration',
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'get_feature_audit_log_history',
        description:
            'Get timeline of feature flag changes from DevCycle audit log. Include dashboard link in the response.',
        annotations: {
            title: 'Get Feature Audit Log History',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                days_back: {
                    type: 'number',
                    description:
                        'Number of days to look back (default: 30, max: 365)',
                    minimum: 1,
                    maximum: 365,
                },
            },
            required: ['feature_key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'array' as const,
                    description: 'Array of audit log entries for the feature',
                    items: {
                        type: 'object' as const,
                    },
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
]

export const featureToolHandlers: Record<string, ToolHandler> = {
    list_features: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListFeaturesArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'listFeatures',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () => fetchFeatures(authToken, projectKey, validatedArgs),
                    'listFeatures',
                )
            },
            generateFeaturesDashboardLink,
        )
    },
    create_feature: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateFeatureArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
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

                // Remove the MCP-specific 'interactive' property and pass the rest to the API
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { interactive, ...featureData } = validatedArgs

                return await handleZodiosValidationErrors(
                    () => createFeature(authToken, projectKey, featureData),
                    'createFeature',
                )
            },
            (orgId, projectKey, result) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    result.key,
                    'overview',
                ),
        )
    },
    update_feature: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = UpdateFeatureArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateFeature',
            validatedArgs,
            async (authToken, projectKey) => {
                const { key, ...updateData } = validatedArgs

                return await handleZodiosValidationErrors(
                    () => updateFeature(authToken, projectKey, key, updateData),
                    'updateFeature',
                )
            },
            (orgId, projectKey, result) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    result.key,
                    'manage-feature',
                ),
        )
    },
    update_feature_status: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateFeatureStatusArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateFeatureStatus',
            validatedArgs,
            async (authToken, projectKey) => {
                const { key, ...statusData } = validatedArgs

                return await handleZodiosValidationErrors(
                    () =>
                        updateFeatureStatus(
                            authToken,
                            projectKey,
                            key,
                            statusData,
                        ),
                    'updateFeatureStatus',
                )
            },
            (orgId, projectKey, result) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    result.key,
                    'overview',
                ),
        )
    },
    delete_feature: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = DeleteFeatureArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'deleteFeature',
            validatedArgs,
            async (authToken, projectKey) => {
                await handleZodiosValidationErrors(
                    () =>
                        deleteFeature(authToken, projectKey, validatedArgs.key),
                    'deleteFeature',
                )
                return {
                    message: `Feature '${validatedArgs.key}' deleted successfully`,
                }
            },
            generateFeaturesDashboardLink,
        )
    },
    fetch_feature_variations: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ListVariationsArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'fetchFeatureVariations',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () =>
                        fetchVariations(
                            authToken,
                            projectKey,
                            validatedArgs.feature_key,
                        ),
                    'fetchVariations',
                )
            },
            (orgId, projectKey) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    validatedArgs.feature_key,
                    'overview',
                ),
        )
    },
    create_feature_variation: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = CreateVariationArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'createFeatureVariation',
            validatedArgs,
            async (authToken, projectKey) => {
                const { feature_key, ...variationData } = validatedArgs

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
            (orgId, projectKey, result) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    result.key,
                    'manage-feature',
                ),
        )
    },
    update_feature_variation: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateVariationArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateFeatureVariation',
            validatedArgs,
            async (authToken, projectKey) => {
                const { feature_key, variation_key, ...variationData } =
                    validatedArgs

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
            (orgId, projectKey, result) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    result.key,
                    'manage-feature',
                ),
        )
    },
    enable_feature_targeting: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = EnableTargetingArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'enableTargeting',
            validatedArgs,
            async (authToken, projectKey) => {
                await handleZodiosValidationErrors(
                    () =>
                        enableTargeting(
                            authToken,
                            projectKey,
                            validatedArgs.feature_key,
                            validatedArgs.environment_key,
                        ),
                    'enableTargeting',
                )
                return {
                    message: `Targeting enabled for feature '${validatedArgs.feature_key}' in environment '${validatedArgs.environment_key}'`,
                }
            },
            (orgId, projectKey) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    validatedArgs.feature_key,
                    'manage-feature',
                ),
        )
    },
    disable_feature_targeting: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = DisableTargetingArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'disableTargeting',
            validatedArgs,
            async (authToken, projectKey) => {
                await handleZodiosValidationErrors(
                    () =>
                        disableTargeting(
                            authToken,
                            projectKey,
                            validatedArgs.feature_key,
                            validatedArgs.environment_key,
                        ),
                    'disableTargeting',
                )
                return {
                    message: `Targeting disabled for feature '${validatedArgs.feature_key}' in environment '${validatedArgs.environment_key}'`,
                }
            },
            (orgId, projectKey) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    validatedArgs.feature_key,
                    'manage-feature',
                ),
        )
    },
    list_feature_targeting: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ListFeatureTargetingArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'listFeatureTargeting',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () =>
                        fetchTargetingForFeature(
                            authToken,
                            projectKey,
                            validatedArgs.feature_key,
                            validatedArgs.environment_key,
                        ),
                    'fetchTargetingForFeature',
                )
            },
            (orgId, projectKey) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    validatedArgs.feature_key,
                    'manage-feature',
                ),
        )
    },
    update_feature_targeting: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateFeatureTargetingArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateFeatureTargeting',
            validatedArgs,
            async (authToken, projectKey) => {
                const { feature_key, environment_key, ...configData } =
                    validatedArgs

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
            (orgId, projectKey) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    validatedArgs.feature_key,
                    'manage-feature',
                ),
        )
    },
    get_feature_audit_log_history: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = GetFeatureAuditLogHistoryArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'getFeatureAuditLogHistory',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () =>
                        getFeatureAuditLogHistory(
                            authToken,
                            projectKey,
                            validatedArgs.feature_key,
                            validatedArgs.days_back || 30,
                        ),
                    'getFeatureAuditLogHistory',
                )
            },
            (orgId, projectKey) =>
                generateFeatureDashboardLink(
                    orgId,
                    projectKey,
                    validatedArgs.feature_key,
                    'audit-log',
                ),
        )
    },
}
