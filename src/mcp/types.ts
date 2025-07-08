import { z } from 'zod'

// Zod schemas for MCP tool arguments
export const ListFeaturesArgsSchema = z.object({
    search: z.string().optional(),
    page: z.number().optional(),
    per_page: z.number().optional(),
})

export const ListVariablesArgsSchema = z.object({
    search: z.string().optional(),
    page: z.number().optional(),
    per_page: z.number().optional(),
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

// Type inference helpers
export type ListFeaturesArgs = z.infer<typeof ListFeaturesArgsSchema>
export type ListVariablesArgs = z.infer<typeof ListVariablesArgsSchema>
export type GetSdkKeysArgs = z.infer<typeof GetSdkKeysArgsSchema>
export type EnableTargetingArgs = z.infer<typeof EnableTargetingArgsSchema>
export type DisableTargetingArgs = z.infer<typeof DisableTargetingArgsSchema>
export type CreateFeatureArgs = z.infer<typeof CreateFeatureArgsSchema>
