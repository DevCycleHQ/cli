import { z } from 'zod'

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

export const CreateFeatureArgsSchema = z.object({
    key: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
    interactive: z.boolean().optional(),
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
export type UpdateSelfTargetingIdentityArgs = z.infer<
    typeof UpdateSelfTargetingIdentityArgsSchema
>
export type SetSelfTargetingOverrideArgs = z.infer<
    typeof SetSelfTargetingOverrideArgsSchema
>
export type ClearSelfTargetingOverridesArgs = z.infer<
    typeof ClearSelfTargetingOverridesArgsSchema
>
