import { z } from 'zod'
import {
    GetProjectsParams,
    CreateProjectDto,
    UpdateProjectDto,
    CreateEnvironmentDto,
    UpdateEnvironmentDto,
    CreateFeatureDto,
    UpdateFeatureDto,
    CreateVariationDto,
    UpdateFeatureVariationDto,
    UpdateFeatureConfigDto,
    CreateCustomPropertyDto,
    UpdateCustomPropertyDto,
    CreateVariableDto,
    UpdateVariableDto,
} from '../api/zodSchemas'
import { UpdateFeatureStatusDto } from '../api/schemas'

// Zod schemas for MCP tool arguments
export const VariableValidationSchema = z.object({
    schemaType: z
        .enum(['enum', 'regex', 'jsonSchema'])
        .describe('Type of validation to apply'),
    enumValues: z
        .union([z.array(z.string()), z.array(z.number())])
        .optional()
        .describe(
            'Required when schemaType="enum": allowable values as strings or numbers',
        ),
    regexPattern: z
        .string()
        .optional()
        .describe(
            'Required when schemaType="regex": regular expression pattern to validate against',
        ),
    jsonSchema: z
        .string()
        .optional()
        .describe(
            'Required when schemaType="jsonSchema": stringified JSON Schema to validate against',
        ),
    description: z.string(),
    exampleValue: z.any().describe('Example value demonstrating a valid input'),
})

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
        .describe('Number of items per page'),
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
        .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    search: z
        .string()
        .min(3)
        .optional()
        .describe('Search term to filter features by "name" or "key"'),
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
        .describe('Number of items per page'),
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
        .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    search: z
        .string()
        .min(3)
        .optional()
        .describe('Search query to filter variables by "name" or "key"'),
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
    key: CreateVariableDto.shape.key.describe('Unique variable key'),
    name: CreateVariableDto.shape.name,
    description: CreateVariableDto.shape.description,
    type: CreateVariableDto.shape.type,
    defaultValue: CreateVariableDto.shape.defaultValue.describe(
        'Default value for the variable, the data type of the defaultValue must match the variable.type',
    ),
    _feature: CreateVariableDto.shape._feature.describe(
        'Feature key or ID to associate with this variable, only set if variable is associated with a feature',
    ),
    validationSchema: CreateVariableDto.shape.validationSchema.describe(
        'Validation schema for variable values',
    ),
    persistent: CreateVariableDto.shape.persistent.describe(
        'indicating if the variable is intended to be long-lived within a feature',
    ),
    tags: CreateVariableDto.shape.tags.describe('Tags to organize variables'),
})

export const UpdateVariableArgsSchema = UpdateVariableDto.extend({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('key to identify variable'),
    validationSchema: UpdateVariableDto.shape.validationSchema
        .optional()
        .describe('Validation schema for variable values'),
    persistent: UpdateVariableDto.shape.persistent
        .optional()
        .describe(
            'indicating if the variable is intended to be long-lived within a feature',
        ),
    tags: UpdateVariableDto.shape.tags
        .optional()
        .describe('Tags to organize variables'),
})

export const DeleteVariableArgsSchema = z.object({
    key: z.string().describe('key to identify variable to delete'),
})

export const DeleteFeatureArgsSchema = z.object({
    key: z.string().describe('key to identify feature to delete'),
})

export const ListProjectsArgsSchema = GetProjectsParams.extend({
    page: GetProjectsParams.shape.page.describe('Page number for pagination'),
    perPage: GetProjectsParams.shape.perPage.describe(
        'Number of items per page',
    ),
    search: GetProjectsParams.shape.search.describe(
        'Search term to filter projects by "name" or "key"',
    ),
    createdBy: GetProjectsParams.shape.createdBy.describe(
        'Filter projects by creator user ID',
    ),
})

export const CreateProjectArgsSchema = CreateProjectDto.extend({
    key: CreateProjectDto.shape.key.describe('Unique project key'),
    color: CreateProjectDto.shape.color.describe(
        'Project color in hex format (e.g., #FF0000)',
    ),
})

export const UpdateProjectArgsSchema = UpdateProjectDto.extend({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('key to identify project to update'),
    color: UpdateProjectDto.shape.color
        .describe('Updated project color in hex format (e.g., #FF0000)')
        .optional(),
})

export const ListEnvironmentsArgsSchema = z.object({
    search: z
        .string()
        .min(3)
        .optional()
        .describe('filter environments by "name" or "key"'),
    page: z.number().min(1).optional().describe('Page number for pagination'),
    perPage: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe('Number of items per page'),
    sortBy: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    createdBy: z.string().optional().describe('Filter by creator user ID'),
})

export const GetSdkKeysArgsSchema = z.object({
    environmentKey: z.string(),
    keyType: z
        .enum(['mobile', 'server', 'client'])
        .optional()
        .describe('type of SDK key to retrieve'),
})

export const CreateEnvironmentArgsSchema = CreateEnvironmentDto.extend({
    key: CreateEnvironmentDto.shape.key.describe('Unique environment key'),
    color: CreateEnvironmentDto.shape.color.describe(
        'Environment color in hex format (e.g., #FF0000)',
    ),
})

export const UpdateEnvironmentArgsSchema = UpdateEnvironmentDto.extend({
    key: z.string().describe('key to identify environment to update'),
    color: UpdateEnvironmentDto.shape.color
        .describe('color in hex format (e.g., #FF0000)')
        .optional(),
})

export const SetFeatureTargetingArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to set targeting for'),
    environment_key: z
        .string()
        .describe('Environment key to set targeting for'),
    enabled: z.boolean().describe('enable or disable targeting'),
})

export const CreateFeatureArgsSchema = CreateFeatureDto.extend({
    key: CreateFeatureDto.shape.key.describe('Unique feature key'),
    variables: CreateFeatureDto.shape.variables.describe(
        'Array of variables to create or reassociate with this feature',
    ),
    configurations: CreateFeatureDto.shape.configurations.describe(
        'Environment-specific configurations (key-value map of environment keys to config)',
    ),
    variations: CreateFeatureDto.shape.variations.describe(
        'Array of variations for this feature',
    ),
    controlVariation: CreateFeatureDto.shape.controlVariation.describe(
        'The key of the variation that is used as the control variation for Metrics',
    ),
    settings: CreateFeatureDto.shape.settings.describe(
        'Feature-level settings configuration',
    ),
    sdkVisibility: CreateFeatureDto.shape.sdkVisibility.describe(
        'SDK Type Visibility Settings for mobile, client, and server SDKs',
    ),
    tags: CreateFeatureDto.shape.tags.describe('Tags to organize features'),
})

export const UpdateFeatureArgsSchema = UpdateFeatureDto.extend({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('key to identify feature to update'),
    configurations: UpdateFeatureDto.shape.configurations
        .optional()
        .describe(
            'Updated environment-specific targeting configurations (key-value map of environment keys to config)',
        ),
    variables: UpdateFeatureDto.shape.variables
        .optional()
        .describe('Updated array of variables for this feature'),
    variations: UpdateFeatureDto.shape.variations
        .optional()
        .describe('Updated array of variations for this feature'),
    settings: UpdateFeatureDto.shape.settings
        .optional()
        .describe('Updated feature-level settings configuration'),
    sdkVisibility: UpdateFeatureDto.shape.sdkVisibility
        .optional()
        .describe(
            'Updated SDK Type Visibility Settings for mobile, client, and server SDKs',
        ),
    controlVariation: UpdateFeatureDto.shape.controlVariation
        .optional()
        .describe('Updated control variation key for Metrics'),
    tags: UpdateFeatureDto.shape.tags
        .optional()
        .describe('Updated tags to organize features'),
    // summary: UpdateFeatureDto.shape.summary.optional().describe(
    //     'Updated feature summary',
    // ),
    // staleness: UpdateFeatureDto.shape.staleness.optional().describe(
    //     'Updated feature staleness configuration',
    // ),
})

export const UpdateFeatureStatusArgsSchema = UpdateFeatureStatusDto.extend({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('key to identify feature to update'),
    staticVariation: UpdateFeatureStatusDto.shape.staticVariation.describe(
        'The variation key or ID to serve if the status is set to complete',
    ),
})

export const UpdateSelfTargetingIdentityArgsSchema = z.object({
    dvc_user_id: z
        .string()
        .describe(
            'DevCycle User ID for self-targeting (empty string to clear)',
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

const variablesDescription =
    'key-value map of variable keys to their values for this variation. { "variableKey1": "value1", "variableKey2": false }'

export const CreateVariationArgsSchema = CreateVariationDto.extend({
    feature_key: z.string().describe('Feature key to create variation for'),
    key: CreateVariationDto.shape.key.describe('Unique variation key'),
    variables:
        CreateVariationDto.shape.variables.describe(variablesDescription),
})

export const UpdateVariationArgsSchema = UpdateFeatureVariationDto.extend({
    key: UpdateFeatureVariationDto.shape.key.describe('Updated variation key'),
    feature_key: z
        .string()
        .describe('Feature key that the variation belongs to'),
    variation_key: z.string().describe('key to identify variation to update'),
    variables: UpdateFeatureVariationDto.shape.variables
        .optional()
        .describe(`Updated ${variablesDescription}`),
})

export const ListFeatureTargetingArgsSchema = z.object({
    feature_key: z.string().describe('Feature key to list targeting for'),
    environment_key: z
        .string()
        .optional()
        .describe('Optional environment key to filter targeting by'),
})

export const UpdateFeatureTargetingArgsSchema = UpdateFeatureConfigDto.extend({
    feature_key: z.string().describe('Feature key to update targeting for'),
    environment_key: z
        .string()
        .describe('Environment key to update targeting in'),
    targets: UpdateFeatureConfigDto.shape.targets
        .optional()
        .describe('Updated array of targeting rules/targets for the feature'),
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
        .describe('Page number for pagination'),
    perPage: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .optional()
        .describe('Number of items per page'),
    sortBy: z
        .enum(['createdAt', 'updatedAt', 'action', 'user'])
        .default('createdAt')
        .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
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
        .enum(['created', 'modified', 'deleted'])
        .optional()
        .describe('Action type to filter audit entries by'),
})

// Cleanup feature prompt tool args
export const CleanupFeatureArgsSchema = z.object({
    featureKey: z.string(),
})

// Zod schema for DevCycle Audit Log Entity - matches the actual swagger specification
export const AuditLogEntitySchema = z.object({
    date: z
        .string()
        .describe(
            'Timestamp when the audit entry was created (ISO 8601 format)',
        ),
    a0_user: z.string().describe('Auth0 user ID who performed the action'),
    changes: z
        .array(z.record(z.unknown()))
        .describe('Array of changes made (objects with unknown structure)'),
})

// Base evaluation query schema (matches API camelCase naming)
const BaseEvaluationQuerySchema = z.object({
    startDate: z.number().optional().describe('Start date as Unix timestamp'),
    endDate: z.number().optional().describe('End date as Unix timestamp'),
    environment: z.string().optional().describe('Environment key to filter by'),
    period: z
        .enum(['day', 'hour', 'month'])
        .optional()
        .describe('Time period for aggregation'),
    sdkType: z
        .enum(['client', 'server', 'mobile', 'api'])
        .optional()
        .describe('SDK type to filter by'),
})

// MCP argument schemas (using camelCase to match API)
export const GetFeatureTotalEvaluationsArgsSchema =
    BaseEvaluationQuerySchema.extend({
        featureKey: z
            .string()
            .describe('Feature key to get evaluation data for'),
        platform: z.string().optional().describe('Platform to filter by'),
        variable: z.string().optional().describe('Variable key to filter by'),
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
        .describe('Number of items per page'),
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
        .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    search: z
        .string()
        .min(3)
        .optional()
        .describe('Search term to filter by "name" or "key"'),
    createdBy: z.string().optional().describe('Filter by creator user ID'),
})

export const UpsertCustomPropertyArgsSchema = CreateCustomPropertyDto.extend({
    key: CreateCustomPropertyDto.shape.key.describe(
        'Unique custom property key',
    ),
    propertyKey: CreateCustomPropertyDto.shape.propertyKey.describe(
        'Property key to associate with the custom property',
    ),
})

export const UpdateCustomPropertyArgsSchema = UpdateCustomPropertyDto.extend({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .describe('key to identify property to update'),
})

export const DeleteCustomPropertyArgsSchema = z.object({
    key: z.string().describe('key to identify property to delete'),
})
