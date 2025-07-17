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
import { Feature } from '../../api/schemas'

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
const FEATURE_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'The key of the feature (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
}

const ENVIRONMENT_KEY_PROPERTY = {
    type: 'string' as const,
    description: 'The key of the environment',
}

const ENVIRONMENT_KEY_OPTIONAL_PROPERTY = {
    type: 'string' as const,
    description:
        'The key of the environment (optional - if not provided, returns all environments)',
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

const CONTROL_VARIATION_PROPERTY = {
    type: 'string' as const,
    description:
        'The key of the variation that is used as the control variation for Metrics',
}

const FEATURE_SETTINGS_PROPERTY = {
    type: 'object' as const,
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
    description: 'Feature-level settings (all properties required if provided)',
    required: ['publicName', 'publicDescription', 'optInEnabled'] as const,
}

const SDK_VISIBILITY_PROPERTY = {
    type: 'object' as const,
    properties: {
        mobile: {
            type: 'boolean' as const,
            description: 'Whether the feature is visible to mobile SDKs',
        },
        client: {
            type: 'boolean' as const,
            description: 'Whether the feature is visible to client SDKs',
        },
        server: {
            type: 'boolean' as const,
            description: 'Whether the feature is visible to server SDKs',
        },
    },
    description:
        'SDK Type Visibility Settings (all properties required if provided)',
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

const VARIATION_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'Unique variation key (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
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

const PAGINATION_PROPERTIES = {
    search: {
        type: 'string' as const,
        description: 'Search query to filter features',
    },
    page: {
        type: 'number' as const,
        description: 'Page number (default: 1)',
    },
    per_page: {
        type: 'number' as const,
        description: 'Number of items per page (default: 100, max: 1000)',
    },
}

const FEATURE_ENVIRONMENT_REQUIRED_PROPERTIES = {
    feature_key: FEATURE_KEY_PROPERTY,
    environment_key: ENVIRONMENT_KEY_PROPERTY,
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
        name: {
            type: 'string' as const,
            description: 'Display name of the feature',
        },
        description: {
            type: 'string' as const,
            description: 'Optional description of the feature',
        },
        type: {
            type: 'string' as const,
            description: 'Feature type (release, experiment, permission, ops)',
        },
        status: {
            type: 'string' as const,
            description: 'Feature status (active, complete, archived)',
        },
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
            description: 'Unique identifier for the variation',
        },
        key: VARIATION_KEY_PROPERTY,
        name: {
            type: 'string' as const,
            description: 'Display name of the variation',
        },
        variables: {
            type: 'object' as const,
            description: 'Variable values for this variation',
        },
    },
    required: ['_id', 'key', 'name'],
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
    description: 'URL to view and manage features in the DevCycle dashboard',
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const featureToolDefinitions: Tool[] = [
    {
        name: 'list_features',
        description:
            'List features in the current project. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: PAGINATION_PROPERTIES,
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
                            status: {
                                type: 'string',
                                description: 'Status for this environment',
                            },
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
        inputSchema: {
            type: 'object',
            properties: {
                key: FEATURE_KEY_PROPERTY,
                status: {
                    type: 'string',
                    enum: ['active', 'complete', 'archived'],
                    description: 'The status to set the feature to',
                },
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
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: FEATURE_KEY_PROPERTY,
                variation_key: {
                    type: 'string',
                    description: 'The key of the variation to update',
                },
                key: {
                    type: 'string',
                    description:
                        'New variation key (max 100 characters, pattern: ^[a-z0-9-_.]+$)',
                },
                name: {
                    type: 'string',
                    description: 'New variation name (max 100 characters)',
                },
                variables: VARIATION_VARIABLES_PROPERTY,
                _id: {
                    type: 'string',
                    description: 'Internal variation ID (optional)',
                },
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
        inputSchema: {
            type: 'object',
            properties: FEATURE_ENVIRONMENT_REQUIRED_PROPERTIES,
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
        inputSchema: {
            type: 'object',
            properties: FEATURE_ENVIRONMENT_REQUIRED_PROPERTIES,
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
                                description:
                                    'Target ID (optional for new targets)',
                            },
                            name: {
                                type: 'string',
                                description: 'Target name (optional)',
                            },
                            audience: {
                                type: 'object',
                                description:
                                    'Audience definition for the target',
                                properties: {
                                    name: {
                                        type: 'string',
                                        description:
                                            'Audience name (max 100 characters, optional)',
                                    },
                                    filters: {
                                        type: 'object',
                                        description:
                                            'Audience filters with logical operator',
                                        properties: {
                                            filters: {
                                                type: 'array',
                                                description:
                                                    'Array of filter conditions (supports all, optIn, user, userCountry, userAppVersion, userPlatformVersion, userCustom, audienceMatch filters)',
                                            },
                                            operator: {
                                                type: 'string',
                                                enum: ['and', 'or'],
                                                description:
                                                    'Logical operator for combining filters',
                                            },
                                        },
                                        required: ['filters', 'operator'],
                                    },
                                },
                                required: ['filters'],
                            },
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
                        description: 'Audit log entry',
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
                return await fetchFeatures(authToken, projectKey, validatedArgs)
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

                return await createFeature(authToken, projectKey, featureData)
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

                return await updateFeature(
                    authToken,
                    projectKey,
                    key,
                    updateData,
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

                return await updateFeatureStatus(
                    authToken,
                    projectKey,
                    key,
                    statusData,
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
                await deleteFeature(authToken, projectKey, validatedArgs.key)
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
                return await fetchVariations(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
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

                return await createVariation(
                    authToken,
                    projectKey,
                    feature_key,
                    variationData,
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

                return await updateVariation(
                    authToken,
                    projectKey,
                    feature_key,
                    variation_key,
                    variationData,
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
                await enableTargeting(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.environment_key,
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
                await disableTargeting(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.environment_key,
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
                return await fetchTargetingForFeature(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.environment_key,
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

                return await updateFeatureConfigForEnvironment(
                    authToken,
                    projectKey,
                    feature_key,
                    environment_key,
                    configData,
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
                return await getFeatureAuditLogHistory(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.days_back || 30,
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
