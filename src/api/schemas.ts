import { z } from 'zod'
import { schemas } from './zodClient'

export type Project = z.infer<typeof schemas.Project>
export type Environment = z.infer<typeof schemas.Environment>
export type SDKKeys = z.infer<typeof schemas.SDKKeys>
export type Variable = z.infer<typeof schemas.Variable>
export type Variation = z.infer<typeof schemas.Variation>
export type Feature = z.infer<typeof schemas.Feature>
export type FeatureConfig = z.infer<typeof schemas.FeatureConfig>
export type Audience = z.infer<typeof schemas.Audience>

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

export type UpdateFeatureConfigDto = z.infer<typeof schemas.UpdateFeatureConfigDto>
export const UpdateFeatureConfigDto = schemas.UpdateFeatureConfigDto

export type UpdateTargetParams = z.infer<typeof schemas.UpdateTargetDto>
export const UpdateTargetDto = schemas.UpdateTargetDto

export type AudienceOperatorWithAudienceMatchFilter = z.infer<typeof schemas.AudienceOperatorWithAudienceMatchFilter>
export type Filters = z.infer<typeof schemas.AudienceOperatorWithAudienceMatchFilter.shape.filters>

type AllFilter = z.infer<typeof schemas.AllFilter>
export const AllFilter = schemas.AllFilter

type UserFilter = z.infer<typeof schemas.UserFilter>
export const UserFilter = schemas.UserFilter

type UserCountryFilter = z.infer<typeof schemas.UserCountryFilter>
export const UserCountryFilter = schemas.UserCountryFilter

type UserAppVersionFilter = z.infer<typeof schemas.UserAppVersionFilter>
export const UserAppVersionFilter = schemas.UserAppVersionFilter

type UserPlatformVersionFilter = z.infer<typeof schemas.UserPlatformVersionFilter>
export const UserPlatformVersionFilter = schemas.UserPlatformVersionFilter

type UserCustomFilter = z.infer<typeof schemas.UserCustomFilter>
export const UserCustomFilter = schemas.UserCustomFilter

type AudienceMatchFilter = z.infer<typeof schemas.AudienceMatchFilter>
export const AudienceMatchFilter = schemas.AudienceMatchFilter

export type Filter = 
  | AllFilter
  | UserFilter
  | UserCountryFilter
  | UserAppVersionFilter
  | UserPlatformVersionFilter
  | UserCustomFilter
  | AudienceMatchFilter
