import { z } from 'zod'
import { schemas } from '../api/zodClient'

// Zod schemas for MCP tool arguments
export const ListFeaturesArgsSchema = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    per_page: z.number().min(1).max(1000).default(100).optional(),
})

export const ListVariablesArgsSchema = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    per_page: z.number().min(1).max(1000).default(100).optional(),
})

export const CreateVariableArgsSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    _feature: z.string().optional(),
    type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
    defaultValue: z.any().optional(),
    validationSchema: z
        .object({
            schemaType: z.string(),
            enumValues: z.array(z.any()).optional(),
            regexPattern: z.string().optional(),
            jsonSchema: z.string().optional(),
            description: z.string(),
            exampleValue: z.any(),
        })
        .optional(),
    tags: z.array(z.string()).optional(),
})

export const UpdateVariableArgsSchema = z.object({
    key: z.string(),
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    new_key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .optional(),
    type: z.enum(['String', 'Boolean', 'Number', 'JSON']).optional(),
    validationSchema: z
        .object({
            schemaType: z.string(),
            enumValues: z.array(z.any()).optional(),
            regexPattern: z.string().optional(),
            jsonSchema: z.string().optional(),
            description: z.string(),
            exampleValue: z.any(),
        })
        .optional(),
    persistent: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
})

export const DeleteVariableArgsSchema = z.object({
    key: z.string(),
})

export const ListProjectsArgsSchema = z.object({
    sort_by: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
    search: z.string().min(3).optional(),
    created_by: z.string().optional(),
    page: z.number().min(1).optional(),
    per_page: z.number().min(1).max(1000).default(100).optional(),
})

export const ListEnvironmentsArgsSchema = z.object({
    search: z.string().min(3).optional(),
    page: z.number().min(1).optional(),
    per_page: z.number().min(1).max(1000).default(100).optional(),
    sort_by: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
    created_by: z.string().optional(),
})

export const GetSdkKeysArgsSchema = z.object({
    environment_key: z.string(),
    key_type: z.enum(['mobile', 'server', 'client']).optional(),
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

const VariationVariablesSchema = z
    .record(
        z.union([z.string(), z.number(), z.boolean(), z.record(z.unknown())]),
    )
    .optional()

export const CreateVariationArgsSchema = z.object({
    feature_key: z.string(),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().max(100),
    variables: VariationVariablesSchema,
})

export const UpdateVariationArgsSchema = z.object({
    feature_key: z.string(),
    variation_key: z.string(),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .optional(),
    name: z.string().max(100).optional(),
    variables: VariationVariablesSchema,
})

export const ListFeatureTargetingArgsSchema = z.object({
    feature_key: z.string(),
    environment_key: z.string().optional(),
})

export const UpdateFeatureTargetingArgsSchema = z.object({
    feature_key: z.string(),
    environment_key: z.string(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
    targets: z
        .array(
            z.object({
                _id: z.string().optional(),
                name: z.string().optional(),
                audience: z.object({
                    name: z.string().max(100).optional(),
                    filters: z.object({
                        filters: z.array(z.any()),
                        operator: z.enum(['and', 'or']),
                    }),
                }),
                rollout: z
                    .object({
                        startPercentage: z.number().gte(0).lte(1).optional(),
                        type: z.enum(['schedule', 'gradual', 'stepped']),
                        startDate: z.string().datetime(),
                        stages: z
                            .array(
                                z.object({
                                    percentage: z.number().gte(0).lte(1),
                                    type: z.enum(['linear', 'discrete']),
                                    date: z.string().datetime(),
                                }),
                            )
                            .optional(),
                    })
                    .optional(),
                distribution: z.array(
                    z.object({
                        percentage: z.number().gte(0).lte(1),
                        _variation: z.string(),
                    }),
                ),
            }),
        )
        .optional(),
})

// Type inference helpers
export type ListFeaturesArgs = z.infer<typeof ListFeaturesArgsSchema>
export type ListVariablesArgs = z.infer<typeof ListVariablesArgsSchema>
export type CreateVariableArgs = z.infer<typeof CreateVariableArgsSchema>
export type UpdateVariableArgs = z.infer<typeof UpdateVariableArgsSchema>
export type DeleteVariableArgs = z.infer<typeof DeleteVariableArgsSchema>
export type ListProjectsArgs = z.infer<typeof ListProjectsArgsSchema>
export type ListEnvironmentsArgs = z.infer<typeof ListEnvironmentsArgsSchema>
export type GetSdkKeysArgs = z.infer<typeof GetSdkKeysArgsSchema>
export type EnableTargetingArgs = z.infer<typeof EnableTargetingArgsSchema>
export type DisableTargetingArgs = z.infer<typeof DisableTargetingArgsSchema>
export type CreateFeatureArgs = z.infer<typeof CreateFeatureArgsSchema>
export type UpdateFeatureArgs = z.infer<typeof UpdateFeatureArgsSchema>
export type ListVariationsArgs = z.infer<typeof ListVariationsArgsSchema>
export type CreateVariationArgs = z.infer<typeof CreateVariationArgsSchema>
export type UpdateVariationArgs = z.infer<typeof UpdateVariationArgsSchema>
export type UpdateSelfTargetingIdentityArgs = z.infer<
    typeof UpdateSelfTargetingIdentityArgsSchema
>
export type SetSelfTargetingOverrideArgs = z.infer<
    typeof SetSelfTargetingOverrideArgsSchema
>
export type ClearSelfTargetingOverridesArgs = z.infer<
    typeof ClearSelfTargetingOverridesArgsSchema
>
export type ListFeatureTargetingArgs = z.infer<
    typeof ListFeatureTargetingArgsSchema
>
export type UpdateFeatureTargetingArgs = z.infer<
    typeof UpdateFeatureTargetingArgsSchema
>
