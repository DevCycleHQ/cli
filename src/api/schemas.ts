import { z } from 'zod'
import { schemas } from './zodClient'

export type Project = z.infer<typeof schemas.Project>
export type Environment = z.infer<typeof schemas.Environment>
export type SDKKeys = z.infer<typeof schemas.SDKKeys>
export type Variable = z.infer<typeof schemas.Variable>
export type Variation = z.infer<typeof schemas.Variation>
export type Feature = z.infer<typeof schemas.Feature>
export type CreateEnvironmentParams = z.infer<typeof schemas.CreateEnvironmentDto>
export const CreateEnvironmentDto = schemas.CreateEnvironmentDto
export type UpdateEnvironmentParams = z.infer<typeof schemas.UpdateEnvironmentDto>
export const UpdateEnvironmentDto = schemas.UpdateEnvironmentDto
export type FeatureConfig = z.infer<typeof schemas.FeatureConfig>
