import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import { fetchFeatures, createFeature, updateFeature } from '../../api/features'
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
                search: {
                    type: 'string',
                    description: 'Search query to filter features',
                },
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                },
                per_page: {
                    type: 'number',
                    description:
                        'Number of items per page (default: 100, max: 1000)',
                },
            },
        },
    },
    {
        name: 'create_feature',
        description: 'Create a new feature flag (supports interactive mode)',
        inputSchema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    description:
                        'Unique feature key (max 100 characters, pattern: ^[a-z0-9-_.]+$)',
                },
                name: {
                    type: 'string',
                    description:
                        'Human-readable feature name (max 100 characters)',
                },
                description: {
                    type: 'string',
                    description: 'Feature description (max 1000 characters)',
                },
                type: {
                    type: 'string',
                    enum: ['release', 'experiment', 'permission', 'ops'],
                    description: 'Feature type',
                },
                tags: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    description: 'Tags to organize features',
                },
                controlVariation: {
                    type: 'string',
                    description:
                        'The key of the variation that is used as the control variation for Metrics',
                },
                settings: {
                    type: 'object',
                    properties: {
                        publicName: {
                            type: 'string',
                            description:
                                'Public name for the feature (max 100 characters)',
                        },
                        publicDescription: {
                            type: 'string',
                            description:
                                'Public description for the feature (max 1000 characters)',
                        },
                        optInEnabled: {
                            type: 'boolean',
                            description:
                                'Whether opt-in is enabled for the feature',
                        },
                    },
                    description:
                        'Feature-level settings (all properties required if provided)',
                    required: [
                        'publicName',
                        'publicDescription',
                        'optInEnabled',
                    ],
                },
                sdkVisibility: {
                    type: 'object',
                    properties: {
                        mobile: {
                            type: 'boolean',
                            description:
                                'Whether the feature is visible to mobile SDKs',
                        },
                        client: {
                            type: 'boolean',
                            description:
                                'Whether the feature is visible to client SDKs',
                        },
                        server: {
                            type: 'boolean',
                            description:
                                'Whether the feature is visible to server SDKs',
                        },
                    },
                    description:
                        'SDK Type Visibility Settings (all properties required if provided)',
                    required: ['mobile', 'client', 'server'],
                },
                variables: {
                    type: 'array',
                    description:
                        'Array of variables to create or reassociate with this feature',
                    items: {
                        type: 'object',
                        description: 'Variable creation or reassociation data',
                    },
                },
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
                interactive: {
                    type: 'boolean',
                    description:
                        'Use interactive mode to prompt for missing fields',
                },
            },
        },
    },
    {
        name: 'update_feature',
        description: 'Update an existing feature flag',
        inputSchema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    description:
                        'The key of the feature to update(1-100 characters, must match pattern ^[a-z0-9-_.]+$)',
                },
                name: {
                    type: 'string',
                    description:
                        'Human-readable feature name (max 100 characters)',
                },
                description: {
                    type: 'string',
                    description: 'Feature description (max 1000 characters)',
                },
                type: {
                    type: 'string',
                    enum: ['release', 'experiment', 'permission', 'ops'],
                    description: 'Feature type',
                },
                tags: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    description: 'Tags to organize Features on the dashboard',
                },
                controlVariation: {
                    type: 'string',
                    description:
                        'The key of the variation that is used as the control variation for Metrics',
                },
                settings: {
                    type: 'object',
                    properties: {
                        publicName: {
                            type: 'string',
                            description:
                                'Public name for the feature (max 100 characters)',
                        },
                        publicDescription: {
                            type: 'string',
                            description:
                                'Public description for the feature (max 1000 characters)',
                        },
                        optInEnabled: {
                            type: 'boolean',
                            description:
                                'Whether opt-in is enabled for the feature',
                        },
                    },
                    description:
                        'Feature-level settings (all properties required if provided)',
                    required: [
                        'publicName',
                        'publicDescription',
                        'optInEnabled',
                    ],
                },
                sdkVisibility: {
                    type: 'object',
                    properties: {
                        mobile: {
                            type: 'boolean',
                            description:
                                'Whether the feature is visible to mobile SDKs',
                        },
                        client: {
                            type: 'boolean',
                            description:
                                'Whether the feature is visible to client SDKs',
                        },
                        server: {
                            type: 'boolean',
                            description:
                                'Whether the feature is visible to server SDKs',
                        },
                    },
                    description:
                        'SDK Type Visibility Settings (all properties required if provided)',
                    required: ['mobile', 'client', 'server'],
                },
                variables: {
                    type: 'array',
                    description:
                        'Array of variables to create or reassociate with this feature',
                    items: {
                        type: 'object',
                        description: 'Variable creation or reassociation data',
                    },
                },
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
    },
    {
        name: 'fetch_feature_variations',
        description: 'Get a list of variations for a feature',
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: {
                    type: 'string',
                    description: 'The key of the feature',
                },
            },
            required: ['feature_key'],
        },
    },
    {
        name: 'create_feature_variation',
        description: 'Create a new variation within a feature',
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: {
                    type: 'string',
                    description: 'The key of the feature',
                },
                key: {
                    type: 'string',
                    description:
                        'Unique variation key (1-100 characters, must match pattern ^[a-z0-9-_.]+$)',
                },
                name: {
                    type: 'string',
                    description:
                        'Human-readable variation name (max 100 characters)',
                },
                variables: {
                    type: 'object',
                    description:
                        'Optional key-value map of variable keys to their values for this variation (supports string, number, boolean, and object values)',
                },
            },
            required: ['feature_key', 'key', 'name'],
        },
    },
    {
        name: 'update_feature_variation',
        description: 'Update an existing variation by key',
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: {
                    type: 'string',
                    description: 'The key of the feature',
                },
                variation_key: {
                    type: 'string',
                    description: 'The key of the variation to update',
                },
                key: {
                    type: 'string',
                    description:
                        'New variation key (1-100 characters, must match pattern ^[a-z0-9-_.]+$)',
                },
                name: {
                    type: 'string',
                    description: 'New variation name (max 100 characters)',
                },
                variables: {
                    type: 'object',
                    description:
                        'Overrides the key-value map of variable keys to their values for this variation (supports string, number, boolean, and object values)',
                },
            },
            required: ['feature_key', 'variation_key'],
        },
    },
    {
        name: 'enable_targeting',
        description: 'Enable targeting for a feature in an environment',
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
        name: 'disable_targeting',
        description: 'Disable targeting for a feature in an environment',
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
        name: 'list_feature_targeting',
        description:
            'List feature configurations (targeting rules) for a feature',
        inputSchema: {
            type: 'object',
            properties: {
                feature_key: {
                    type: 'string',
                    description: 'The key of the feature',
                },
                environment_key: {
                    type: 'string',
                    description:
                        'The key of the environment (optional - if not provided, returns all environments)',
                },
            },
            required: ['feature_key'],
        },
    },
    {
        name: 'update_feature_targeting',
        description:
            'Update feature configuration (targeting rules) for a feature in an environment',
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
                                description: 'Target name',
                            },
                            audience: {
                                type: 'object',
                                description:
                                    'Audience definition for the target',
                                properties: {
                                    name: {
                                        type: 'string',
                                        description: 'Audience name',
                                    },
                                    filters: {
                                        type: 'object',
                                        description: 'Filter definition',
                                        properties: {
                                            filters: {
                                                type: 'array',
                                                description:
                                                    'Array of filter conditions',
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
                                    startPercentage: {
                                        type: 'number',
                                        minimum: 0,
                                        maximum: 1,
                                        description:
                                            'Starting percentage for rollout',
                                    },
                                    stages: {
                                        type: 'array',
                                        description: 'Rollout stages',
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
    },
]

export const featureToolHandlers: Record<string, ToolHandler> = {
    list_features: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListFeaturesArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'listFeatures',
            validatedArgs,
            async (authToken, projectKey) => {
                const query = {
                    search: validatedArgs.search,
                    page: validatedArgs.page,
                    perPage: validatedArgs.per_page,
                }
                return await fetchFeatures(authToken, projectKey, query)
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

                return await updateFeature(
                    authToken,
                    projectKey,
                    key,
                    updateData,
                )
            },
        )
    },
    fetch_feature_variations: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ListVariationsArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'fetchFeatureVariations',
            validatedArgs,
            async (authToken, projectKey) => {
                return await fetchVariations(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                )
            },
        )
    },
    create_feature_variation: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = CreateVariationArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'createFeatureVariation',
            validatedArgs,
            async (authToken, projectKey) => {
                const variationData = {
                    key: validatedArgs.key,
                    name: validatedArgs.name,
                    variables: validatedArgs.variables,
                }

                return await createVariation(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    variationData,
                )
            },
        )
    },
    update_feature_variation: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateVariationArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'updateFeatureVariation',
            validatedArgs,
            async (authToken, projectKey) => {
                const variationData = {
                    key: validatedArgs.key,
                    name: validatedArgs.name,
                    variables: validatedArgs.variables,
                }

                return await updateVariation(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.variation_key,
                    variationData,
                )
            },
        )
    },
    enable_targeting: async (args: unknown, apiClient: DevCycleApiClient) => {
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
    disable_targeting: async (args: unknown, apiClient: DevCycleApiClient) => {
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
    list_feature_targeting: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ListFeatureTargetingArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
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
        )
    },
    update_feature_targeting: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateFeatureTargetingArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'updateFeatureTargeting',
            validatedArgs,
            async (authToken, projectKey) => {
                return await updateFeatureConfigForEnvironment(
                    authToken,
                    projectKey,
                    validatedArgs.feature_key,
                    validatedArgs.environment_key,
                    {
                        status: validatedArgs.status,
                        targets: validatedArgs.targets,
                    },
                )
            },
        )
    },
}
