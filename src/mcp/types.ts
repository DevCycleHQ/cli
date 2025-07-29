import { z } from 'zod'
import { schemas } from '../api/zodClient'
import { UpdateFeatureStatusDto } from '../api/schemas'

// Zod schemas for MCP tool arguments
export const ListFeaturesArgsSchema = z.object({
    page: z.number().min(1).default(1).optional(),
    perPage: z.number().min(1).max(1000).default(100).optional(),
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
    search: z.string().min(3).optional(),
    staleness: z
        .enum(['all', 'unused', 'released', 'unmodified', 'notStale'])
        .optional(),
    createdBy: z.string().optional(),
    type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
    status: z.enum(['active', 'complete', 'archived']).optional(),
})

export const ListVariablesArgsSchema = z.object({
    page: z.number().min(1).default(1).optional(),
    perPage: z.number().min(1).max(1000).default(100).optional(),
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
    search: z.string().min(3).optional(),
    feature: z.string().optional(),
    type: z.enum(['String', 'Boolean', 'Number', 'JSON']).optional(),
    status: z.enum(['active', 'archived']).optional(),
})

export const CreateVariableArgsSchema = schemas.CreateVariableDto

export const UpdateVariableArgsSchema = schemas.UpdateVariableDto.extend({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/), // Make key required for identifying the variable
})

export const DeleteVariableArgsSchema = z.object({
    key: z.string(),
})

export const DeleteFeatureArgsSchema = z.object({
    key: z.string(),
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
    search: z.string().min(3).optional(),
    page: z.number().min(1).optional(),
    perPage: z.number().min(1).max(1000).default(100).optional(),
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
    createdBy: z.string().optional(),
})

export const GetSdkKeysArgsSchema = z.object({
    environmentKey: z.string(),
    keyType: z.enum(['mobile', 'server', 'client']).optional(),
})

export const CreateEnvironmentArgsSchema = schemas.CreateEnvironmentDto

export const UpdateEnvironmentArgsSchema = schemas.UpdateEnvironmentDto.extend({
    key: z.string(), // Make key required for identifying the environment
})

export const EnableTargetingArgsSchema = z.object({
    feature_key: z.string(),
    environment_key: z.string(),
})

export const DisableTargetingArgsSchema = z.object({
    feature_key: z.string(),
    environment_key: z.string(),
})

export const CreateFeatureArgsSchema = schemas.CreateFeatureDto.extend({
    interactive: z.boolean().optional(), // MCP-specific: prompt for missing fields
})

export const UpdateFeatureArgsSchema = schemas.UpdateFeatureDto.extend({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/), // Make key required for identifying the feature
})

export const UpdateFeatureStatusArgsSchema = UpdateFeatureStatusDto.extend({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/), // Feature key for identifying the feature
})

export const UpdateSelfTargetingIdentityArgsSchema = z.object({
    dvc_user_id: z.string().nullable(),
})

export const SetSelfTargetingOverrideArgsSchema = z.object({
    feature_key: z.string(),
    environment_key: z.string(),
    variation_key: z.string(),
})

export const ClearSelfTargetingOverridesArgsSchema = z.object({
    feature_key: z.string(),
    environment_key: z.string(),
})

export const ListVariationsArgsSchema = z.object({
    feature_key: z.string(),
})

export const CreateVariationArgsSchema = schemas.CreateVariationDto.extend({
    feature_key: z.string(), // MCP-specific: identifies which feature to add variation to
})

export const UpdateVariationArgsSchema =
    schemas.UpdateFeatureVariationDto.extend({
        feature_key: z.string(), // MCP-specific: identifies which feature the variation belongs to
        variation_key: z.string(), // MCP-specific: identifies which variation to update
        variables: z
            .record(
                z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.record(z.unknown()),
                ]),
            )
            .optional(), // Constrain to API-compatible types
    })

export const ListFeatureTargetingArgsSchema = z.object({
    feature_key: z.string(),
    environment_key: z.string().optional(),
})

export const UpdateFeatureTargetingArgsSchema =
    schemas.UpdateFeatureConfigDto.extend({
        feature_key: z.string(), // MCP-specific: identifies which feature to update targeting for
        environment_key: z.string(), // MCP-specific: identifies which environment to update targeting in
    })

export const GetFeatureAuditLogHistoryArgsSchema = z.object({
    feature_key: z.string(),
    days_back: z.number().min(1).max(365).default(30).optional(),
})

// Base evaluation query schema (matches API camelCase naming)
const BaseEvaluationQuerySchema = z.object({
    startDate: z.number().optional(),
    endDate: z.number().optional(),
    environment: z.string().optional(),
    period: z.enum(['day', 'hour', 'month']).optional(),
    sdkType: z.enum(['client', 'server', 'mobile', 'api']).optional(),
})

// MCP argument schemas (using camelCase to match API)
export const GetFeatureTotalEvaluationsArgsSchema =
    BaseEvaluationQuerySchema.extend({
        featureKey: z.string(),
        platform: z.string().optional(),
        variable: z.string().optional(),
    })

export const GetProjectTotalEvaluationsArgsSchema = BaseEvaluationQuerySchema

// API query schemas (same as MCP args since we use camelCase throughout)
export const FeatureTotalEvaluationsQuerySchema =
    GetFeatureTotalEvaluationsArgsSchema.omit({ featureKey: true })
export const ProjectTotalEvaluationsQuerySchema =
    GetProjectTotalEvaluationsArgsSchema

export const ListCustomPropertiesArgsSchema = z.object({
    page: z.number().min(1).default(1).optional(),
    perPage: z.number().min(1).max(1000).default(100).optional(),
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
    search: z.string().min(3).optional(),
    createdBy: z.string().optional(),
})

export const UpsertCustomPropertyArgsSchema = schemas.CreateCustomPropertyDto

export const UpdateCustomPropertyArgsSchema =
    schemas.UpdateCustomPropertyDto.extend({
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/), // Make key required for identifying the custom property
    })

export const DeleteCustomPropertyArgsSchema = z.object({
    key: z.string(),
})
