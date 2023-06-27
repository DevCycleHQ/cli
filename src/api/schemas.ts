import { z } from 'zod'
import { schemas } from './zodClient'

export type Project = z.infer<typeof schemas.Project>
export type Environment = z.infer<typeof schemas.Environment>
export type SDKKeys = z.infer<typeof schemas.SDKKeys>
export type Variable = z.infer<typeof schemas.Variable>
export type Variation = z.infer<typeof schemas.Variation>
export type Feature = z.infer<typeof schemas.Feature>
export type FeatureConfig = z.infer<typeof schemas.FeatureConfig>

export type CreateEnvironmentParams = z.infer<typeof schemas.CreateEnvironmentDto>
export const CreateEnvironmentDto = schemas.CreateEnvironmentDto

export type UpdateEnvironmentParams = z.infer<typeof schemas.UpdateEnvironmentDto>
export const UpdateEnvironmentDto = schemas.UpdateEnvironmentDto

export type CreateFeatureParams = z.infer<typeof schemas.CreateFeatureDto>
export const CreateFeatureDto = schemas.CreateFeatureDto

export type UpdateFeatureParams = z.infer<typeof schemas.UpdateFeatureDto>
export const UpdateFeatureDto = schemas.UpdateFeatureDto

export type CreateVariableParams = z.infer<typeof schemas.CreateVariableDto>
export const CreateVariableDto = schemas.CreateVariableDto

export type UpdateVariableParams = z.infer<typeof schemas.UpdateVariableDto>
export const UpdateVariableDto = schemas.UpdateVariableDto

export type CreateVariationParams = z.infer<typeof schemas.FeatureVariationDto>
export const CreateVariationDto = schemas.FeatureVariationDto

export type UpdateVariationParams = Partial<CreateVariationParams>
