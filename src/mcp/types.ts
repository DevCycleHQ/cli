import { z } from 'zod'
import { schemas } from '../api/zodClient'
import { UpdateFeatureStatusDto } from '../api/schemas'

// Zod schemas for MCP tool arguments
export const ListFeaturesArgsSchema = z.object({
    page: z
        .number()
        .min(1)
        .default(1)
        .optional()
        .describe('Page number for pagination'),
    perPage: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe('Number of items per page (1-1000)'),
    sortBy: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .default('createdAt')
        .optional()
        .describe('Field to sort features by'),
    sortOrder: z
        .enum(['asc', 'desc'])
        .default('desc')
        .optional()
        .describe('Sort order (ascending or descending)'),
    search: z
        .string()
        .min(3)
        .optional()
        .describe('Search term to filter features by name or key'),
    staleness: z
        .enum(['all', 'unused', 'released', 'unmodified', 'notStale'])
        .optional()
        .describe('Filter features by staleness status'),
    createdBy: z
        .string()
        .optional()
        .describe('Filter features by creator user ID'),
    type: z
        .enum(['release', 'experiment', 'permission', 'ops'])
        .optional()
        .describe('Filter features by type'),
    status: z
        .enum(['active', 'complete', 'archived'])
        .optional()
        .describe('Filter features by status'),
})

export const ListVariablesArgsSchema = z.object({
    page: z
        .number()
        .min(1)
        .default(1)
        .optional()
        .describe('Page number for pagination'),
    perPage: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe('Number of items per page (1-1000)'),
    sortBy: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .default('createdAt')
        .optional()
        .describe('Field to sort variables by'),
    sortOrder: z
        .enum(['asc', 'desc'])
        .default('desc')
        .optional()
        .describe('Sort order (ascending or descending)'),
    search: z
        .string()
        .min(3)
        .optional()
        .describe('Search query to filter variables (minimum 3 characters)'),
    feature: z.string().optional().describe('Filter by feature key'),
    type: z
        .enum(['String', 'Boolean', 'Number', 'JSON'])
        .optional()
        .describe('Filter by variable type'),
    status: z
        .enum(['active', 'archived'])
        .optional()
        .describe('Filter by variable status'),
})

export const CreateVariableArgsSchema = z.object({
    key: schemas.CreateVariableDto.shape.key.describe(
        'Unique variable key (1-100 characters, lowercase letters, numbers, dots, dashes, underscores only)',
    ),
    name: schemas.CreateVariableDto.shape.name.describe(
        'Variable name (1-100 characters)',
    ),
    description: schemas.CreateVariableDto.shape.description
        .optional()
        .describe('Variable description (max 1000 characters)'),
    type: schemas.CreateVariableDto.shape.type.describe(
        'Variable type (String, Boolean, Number, JSON)',
    ),
    defaultValue: schemas.CreateVariableDto.shape.defaultValue
        .optional()
        .describe('Default value for the variable'),
    _feature: schemas.CreateVariableDto.shape._feature
        .optional()
        .describe('Feature key or ID to associate with this variable'),
    validationSchema: schemas.CreateVariableDto.shape.validationSchema
        .optional()
        .describe('Validation schema for variable values'),
})

export const UpdateVariableArgsSchema = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('Current variable key to identify which variable to update'),
    name: schemas.UpdateVariableDto.shape.name
        .optional()
        .describe('Variable name (1-100 characters)'),
    description: schemas.UpdateVariableDto.shape.description
        .optional()
        .describe('Variable description (max 1000 characters)'),
    type: schemas.UpdateVariableDto.shape.type
        .optional()
        .describe('Variable type (String, Boolean, Number, JSON)'),
    validationSchema: schemas.UpdateVariableDto.shape.validationSchema
        .optional()
        .describe('Validation schema for variable values'),
})

export const DeleteVariableArgsSchema = z.object({
    key: z
        .string()
        .describe('Variable key to identify which variable to delete'),
})

export const DeleteFeatureArgsSchema = z.object({
    key: z.string().describe('Feature key to identify which feature to delete'),
})

export const ListProjectsArgsSchema = z.object({
    page: schemas.GetProjectsParams.shape.page.describe(
        'Page number for pagination',
    ),
    perPage: schemas.GetProjectsParams.shape.perPage.describe(
        'Number of items per page (1-1000)',
    ),
    sortBy: schemas.GetProjectsParams.shape.sortBy.describe(
        'Field to sort projects by',
    ),
    sortOrder: schemas.GetProjectsParams.shape.sortOrder.describe(
        'Sort order (ascending or descending)',
    ),
    search: schemas.GetProjectsParams.shape.search.describe(
        'Search term to filter projects by name or key',
    ),
    createdBy: schemas.GetProjectsParams.shape.createdBy.describe(
        'Filter projects by creator user ID',
    ),
})

export const CreateProjectArgsSchema = z.object({
    name: schemas.CreateProjectDto.shape.name.describe(
        'Project name (max 100 characters)',
    ),
    key: schemas.CreateProjectDto.shape.key.describe(
        'Unique project key (lowercase letters, numbers, dots, dashes, underscores only)',
    ),
    description: schemas.CreateProjectDto.shape.description.describe(
        'Project description (max 1000 characters)',
    ),
    color: schemas.CreateProjectDto.shape.color.describe(
        'Project color in hex format (e.g., #FF0000)',
    ),
    settings: schemas.CreateProjectDto.shape.settings.describe(
        'Project settings configuration',
    ),
})

export const UpdateProjectArgsSchema = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('Project key to identify which project to update'), // Make key required for identifying the project
    name: schemas.UpdateProjectDto.shape.name.describe(
        'Updated project name (max 100 characters)',
    ),
    description: schemas.UpdateProjectDto.shape.description.describe(
        'Updated project description (max 1000 characters)',
    ),
    color: schemas.UpdateProjectDto.shape.color.describe(
        'Updated project color in hex format (e.g., #FF0000)',
    ),
    settings: schemas.UpdateProjectDto.shape.settings.describe(
        'Updated project settings configuration',
    ),
})

export const ListEnvironmentsArgsSchema = z.object({
    search: z
        .string()
        .min(3)
        .optional()
        .describe('Search term to filter environments by name or key'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    perPage: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe('Number of items per page (1-1000)'),
    sortBy: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .optional()
        .describe('Field to sort environments by'),
    sortOrder: z
        .enum(['asc', 'desc'])
        .optional()
        .describe('Sort order (ascending or descending)'),
    createdBy: z
        .string()
        .optional()
        .describe('Filter environments by creator user ID'),
})

export const GetSdkKeysArgsSchema = z.object({
    environmentKey: z.string().describe('Environment key to get SDK keys for'),
    keyType: z
        .enum(['mobile', 'server', 'client'])
        .optional()
        .describe('Specific type of SDK key to retrieve (optional)'),
})

export const CreateEnvironmentArgsSchema = z.object({
    name: schemas.CreateEnvironmentDto.shape.name.describe(
        'Environment name (max 100 characters)',
    ),
    key: schemas.CreateEnvironmentDto.shape.key.describe(
        'Unique environment key (lowercase letters, numbers, dots, dashes, underscores only)',
    ),
    description: schemas.CreateEnvironmentDto.shape.description.describe(
        'Environment description (max 1000 characters)',
    ),
    color: schemas.CreateEnvironmentDto.shape.color.describe(
        'Environment color in hex format (e.g., #FF0000)',
    ),
    type: schemas.CreateEnvironmentDto.shape.type.describe(
        'Environment type (development, staging, production, or disaster_recovery)',
    ),
    settings: schemas.CreateEnvironmentDto.shape.settings.describe(
        'Environment settings configuration',
    ),
})

export const UpdateEnvironmentArgsSchema = z.object({
    key: z
        .string()
        .describe('Environment key to identify which environment to update'), // Make key required for identifying the environment
    name: schemas.UpdateEnvironmentDto.shape.name.describe(
        'Updated environment name (max 100 characters)',
    ),
    description: schemas.UpdateEnvironmentDto.shape.description.describe(
        'Updated environment description (max 1000 characters)',
    ),
    color: schemas.UpdateEnvironmentDto.shape.color.describe(
        'Updated environment color in hex format (e.g., #FF0000)',
    ),
    type: schemas.UpdateEnvironmentDto.shape.type.describe(
        'Updated environment type (development, staging, production, or disaster_recovery)',
    ),
    settings: schemas.UpdateEnvironmentDto.shape.settings.describe(
        'Updated environment settings configuration',
    ),
})

export const EnableTargetingArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to enable targeting for'),
    environment_key: z
        .string()
        .describe('Environment key to enable targeting in'),
})

export const DisableTargetingArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to disable targeting for'),
    environment_key: z
        .string()
        .describe('Environment key to disable targeting in'),
})

export const CreateFeatureArgsSchema = z.object({
    name: schemas.CreateFeatureDto.shape.name.describe(
        'Feature name (max 100 characters)',
    ),
    key: schemas.CreateFeatureDto.shape.key.describe(
        'Unique feature key (lowercase letters, numbers, dots, dashes, underscores only)',
    ),
    description: schemas.CreateFeatureDto.shape.description.describe(
        'Feature description (max 1000 characters)',
    ),
    variables: schemas.CreateFeatureDto.shape.variables.describe(
        'Array of variables to create or reassociate with this feature',
    ),
    configurations: schemas.CreateFeatureDto.shape.configurations.describe(
        'Environment-specific configurations (key-value map of environment keys to config)',
    ),
    variations: schemas.CreateFeatureDto.shape.variations.describe(
        'Array of variations for this feature',
    ),
    controlVariation: schemas.CreateFeatureDto.shape.controlVariation.describe(
        'The key of the variation that is used as the control variation for Metrics',
    ),
    settings: schemas.CreateFeatureDto.shape.settings.describe(
        'Feature-level settings configuration',
    ),
    sdkVisibility: schemas.CreateFeatureDto.shape.sdkVisibility.describe(
        'SDK Type Visibility Settings for mobile, client, and server SDKs',
    ),
    type: schemas.CreateFeatureDto.shape.type.describe(
        'Feature type (release, experiment, permission, or ops)',
    ),
    tags: schemas.CreateFeatureDto.shape.tags.describe(
        'Tags to organize features',
    ),
    interactive: z
        .boolean()
        .optional()
        .describe('MCP-specific: prompt for missing fields'),
})

export const UpdateFeatureArgsSchema = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('Feature key to identify which feature to update'),
    name: schemas.UpdateFeatureDto.shape.name.describe(
        'Updated feature name (max 100 characters)',
    ),
    description: schemas.UpdateFeatureDto.shape.description.describe(
        'Updated feature description (max 1000 characters)',
    ),
    variables: schemas.UpdateFeatureDto.shape.variables.describe(
        'Updated array of variables for this feature',
    ),
    variations: schemas.UpdateFeatureDto.shape.variations.describe(
        'Updated array of variations for this feature',
    ),
    settings: schemas.UpdateFeatureDto.shape.settings.describe(
        'Updated feature-level settings configuration',
    ),
    sdkVisibility: schemas.UpdateFeatureDto.shape.sdkVisibility.describe(
        'Updated SDK Type Visibility Settings for mobile, client, and server SDKs',
    ),
    type: schemas.UpdateFeatureDto.shape.type.describe(
        'Updated feature type (release, experiment, permission, or ops)',
    ),
    tags: schemas.UpdateFeatureDto.shape.tags.describe(
        'Updated tags to organize features',
    ),
    controlVariation: schemas.UpdateFeatureDto.shape.controlVariation.describe(
        'Updated control variation key for Metrics',
    ),
})

export const UpdateFeatureStatusArgsSchema = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('Feature key to identify which feature to update'),
    status: UpdateFeatureStatusDto.shape.status.describe(
        'Updated feature status (active, complete, or archived)',
    ),
    staticVariation: UpdateFeatureStatusDto.shape.staticVariation.describe(
        'The variation key or ID to serve if the status is set to complete (optional)',
    ),
})

export const UpdateSelfTargetingIdentityArgsSchema = z.object({
    dvc_user_id: z
        .string()
        .nullable()
        .describe(
            'DevCycle User ID for self-targeting (use null or empty string to clear)',
        ),
})

export const SetSelfTargetingOverrideArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to set override for'),
    environment_key: z.string().describe('Environment key to set override in'),
    variation_key: z
        .string()
        .describe('Variation key to serve for the override'),
})

export const ClearSelfTargetingOverridesArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to clear overrides for'),
    environment_key: z
        .string()
        .describe('Environment key to clear overrides in'),
})

export const ListVariationsArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to list variations for'),
})

export const CreateVariationArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to create variation for'),
    key: schemas.CreateVariationDto.shape.key.describe(
        'Unique variation key (lowercase letters, numbers, dots, dashes, underscores only)',
    ),
    name: schemas.CreateVariationDto.shape.name.describe(
        'Variation name (max 100 characters)',
    ),
    variables: schemas.CreateVariationDto.shape.variables.describe(
        'Key-value map of variable keys to their values for this variation',
    ),
})

export const UpdateVariationArgsSchema = z.object({
    feature_key: z
        .string()
        .describe('Feature key that the variation belongs to'),
    variation_key: z
        .string()
        .describe('Variation key to identify which variation to update'),
    key: schemas.UpdateFeatureVariationDto.shape.key.describe(
        'Updated variation key (lowercase letters, numbers, dots, dashes, underscores only)',
    ),
    name: schemas.UpdateFeatureVariationDto.shape.name.describe(
        'Updated variation name (max 100 characters)',
    ),
    variables: z
        .record(
            z.union([
                z.string(),
                z.number(),
                z.boolean(),
                z.record(z.unknown()),
            ]),
        )
        .optional()
        .describe(
            'Updated key-value map of variable keys to their values for this variation',
        ),
})

export const ListFeatureTargetingArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to list targeting for'),
    environment_key: z
        .string()
        .optional()
        .describe('Optional environment key to filter targeting by'),
})

export const UpdateFeatureTargetingArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to update targeting for'),
    environment_key: z
        .string()
        .describe('Environment key to update targeting in'),
    status: schemas.UpdateFeatureConfigDto.shape.status.describe(
        'Updated targeting status for the feature',
    ),
    targets: schemas.UpdateFeatureConfigDto.shape.targets.describe(
        'Updated array of targeting rules/targets for the feature',
    ),
})

export const GetFeatureAuditLogHistoryArgsSchema = z.object({
    feature_key: z
        .string()
        .describe('Feature key to get audit log history for'),
    page: z
        .number()
        .min(1)
        .default(1)
        .optional()
        .describe('Page number for pagination (default: 1)'),
    perPage: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe('Number of items per page (default: 100, max: 1000)'),
    sortBy: z
        .enum(['createdAt', 'updatedAt', 'action', 'user'])
        .default('createdAt')
        .optional()
        .describe('Field to sort audit entries by (default: createdAt)'),
    sortOrder: z
        .enum(['asc', 'desc'])
        .default('desc')
        .optional()
        .describe('Sort order (default: desc)'),
    startDate: z
        .string()
        .optional()
        .describe('Start date for filtering audit entries (ISO 8601 format)'),
    endDate: z
        .string()
        .optional()
        .describe('End date for filtering audit entries (ISO 8601 format)'),
    environment: z
        .string()
        .optional()
        .describe('Environment key to filter audit entries by'),
    user: z.string().optional().describe('User ID to filter audit entries by'),
    action: z
        .string()
        .optional()
        .describe('Action type to filter audit entries by'),
})

// Base evaluation query schema (matches API camelCase naming)
const BaseEvaluationQuerySchema = z.object({
    startDate: z
        .number()
        .optional()
        .describe('Start date as Unix timestamp (optional)'),
    endDate: z
        .number()
        .optional()
        .describe('End date as Unix timestamp (optional)'),
    environment: z
        .string()
        .optional()
        .describe('Environment key to filter by (optional)'),
    period: z
        .enum(['day', 'hour', 'month'])
        .optional()
        .describe('Time period for aggregation (optional)'),
    sdkType: z
        .enum(['client', 'server', 'mobile', 'api'])
        .optional()
        .describe('SDK type to filter by (optional)'),
})

// MCP argument schemas (using camelCase to match API)
export const GetFeatureTotalEvaluationsArgsSchema =
    BaseEvaluationQuerySchema.extend({
        featureKey: z
            .string()
            .describe('Feature key to get evaluation data for'),
        platform: z
            .string()
            .optional()
            .describe('Platform to filter by (optional)'),
        variable: z
            .string()
            .optional()
            .describe('Variable key to filter by (optional)'),
    })

export const GetProjectTotalEvaluationsArgsSchema = BaseEvaluationQuerySchema

// API query schemas (same as MCP args since we use camelCase throughout)
export const FeatureTotalEvaluationsQuerySchema =
    GetFeatureTotalEvaluationsArgsSchema.omit({ featureKey: true })
export const ProjectTotalEvaluationsQuerySchema =
    GetProjectTotalEvaluationsArgsSchema

export const ListCustomPropertiesArgsSchema = z.object({
    page: z
        .number()
        .min(1)
        .default(1)
        .optional()
        .describe('Page number for pagination'),
    perPage: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe('Number of items per page (1-1000)'),
    sortBy: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .default('createdAt')
        .optional()
        .describe('Field to sort custom properties by'),
    sortOrder: z
        .enum(['asc', 'desc'])
        .default('desc')
        .optional()
        .describe('Sort order (ascending or descending)'),
    search: z
        .string()
        .min(3)
        .optional()
        .describe('Search term to filter custom properties by name or key'),
    createdBy: z
        .string()
        .optional()
        .describe('Filter custom properties by creator user ID'),
})

export const UpsertCustomPropertyArgsSchema = z.object({
    name: schemas.CreateCustomPropertyDto.shape.name.describe(
        'Custom property name (max 100 characters)',
    ),
    key: schemas.CreateCustomPropertyDto.shape.key.describe(
        'Unique custom property key (lowercase letters, numbers, dots, dashes, underscores only)',
    ),
    type: schemas.CreateCustomPropertyDto.shape.type.describe(
        'Custom property type (String, Boolean, or Number)',
    ),
    propertyKey: schemas.CreateCustomPropertyDto.shape.propertyKey.describe(
        'Property key to associate with the custom property',
    ),
})

export const UpdateCustomPropertyArgsSchema = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('Custom property key to identify which property to update'), // Make key required for identifying the custom property
    name: schemas.UpdateCustomPropertyDto.shape.name.describe(
        'Updated custom property name (max 100 characters)',
    ),
    propertyKey: schemas.UpdateCustomPropertyDto.shape.propertyKey.describe(
        'Updated property key to associate with the custom property',
    ),
    type: schemas.UpdateCustomPropertyDto.shape.type.describe(
        'Updated custom property type (String, Boolean, or Number)',
    ),
})

export const DeleteCustomPropertyArgsSchema = z.object({
    key: z
        .string()
        .describe('Custom property key to identify which property to delete'),
})
