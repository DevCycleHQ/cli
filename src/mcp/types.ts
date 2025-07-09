import { z } from 'zod'
import { schemas } from '../api/zodClient'

// Zod schemas for MCP tool arguments
export const ListFeaturesArgsSchema = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    perPage: z.number().min(1).max(1000).default(100).optional(),
})

export const ListVariablesArgsSchema = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    perPage: z.number().min(1).max(1000).default(100).optional(),
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
    search: z.string().min(3).optional(),
    createdBy: z.string().optional(),
    page: z.number().min(1).optional(),
    perPage: z.number().min(1).max(1000).default(100).optional(),
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
