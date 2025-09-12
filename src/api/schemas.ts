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
export type Target = z.infer<typeof schemas.Target>
export type Override = z.infer<typeof schemas.Override>
export type CustomProperty = z.infer<typeof schemas.CustomProperty>
export type GetProjectsParams = z.infer<typeof schemas.GetProjectsParams>
export const GetProjectsParams = schemas.GetProjectsParams

export type CreateProjectParams = z.infer<typeof schemas.CreateProjectDto>
export const CreateProjectDto = schemas.CreateProjectDto

export type UpdateProjectParams = z.infer<typeof schemas.UpdateProjectDto>
export const UpdateProjectDto = schemas.UpdateProjectDto

export type CreateEnvironmentParams = z.infer<
    typeof schemas.CreateEnvironmentDto
>
export const CreateEnvironmentDto = schemas.CreateEnvironmentDto

export type UpdateEnvironmentParams = z.infer<
    typeof schemas.UpdateEnvironmentDto
>
export const UpdateEnvironmentDto = schemas.UpdateEnvironmentDto

export type CreateFeatureParams = z.infer<typeof schemas.CreateFeatureDto>
export const CreateFeatureDto = schemas.CreateFeatureDto

export type UpdateFeatureParams = z.infer<typeof schemas.UpdateFeatureDto>
export const UpdateFeatureDto = schemas.UpdateFeatureDto

export const UpdateFeatureStatusDto = z.object({
    status: z.enum(['active', 'complete', 'archived']),
    staticVariation: z.string().optional(),
})

export type UpdateFeatureStatusParams = z.infer<typeof UpdateFeatureStatusDto>

export type CreateVariableParams = z.infer<typeof schemas.CreateVariableDto>
export const CreateVariableDto = schemas.CreateVariableDto

export type UpdateVariableParams = z.infer<typeof schemas.UpdateVariableDto>
export const UpdateVariableDto = schemas.UpdateVariableDto

export type CreateVariationParams = z.infer<typeof schemas.CreateVariationDto>
export const CreateVariationDto = schemas.CreateVariationDto

export type UpdateVariationParams = Partial<CreateVariationParams>

export type UpdateFeatureConfigDto = z.infer<
    typeof schemas.UpdateFeatureConfigDto
>
export const UpdateFeatureConfigDto = schemas.UpdateFeatureConfigDto

export type UpdateTargetParams = z.infer<typeof schemas.UpdateTargetDto>
export const UpdateTargetDto = schemas.UpdateTargetDto

export type AudienceOperatorWithAudienceMatchFilter = z.infer<
    typeof schemas.AudienceOperatorWithAudienceMatchFilter
>
export type Filters = z.infer<
    typeof schemas.AudienceOperatorWithAudienceMatchFilter.shape.filters
>

export type AllFilter = z.infer<typeof schemas.AllFilter>
export const AllFilterSchema = schemas.AllFilter

export type OptInFilter = z.infer<typeof schemas.OptInFilter>
export const OptInFilterSchema = schemas.OptInFilter

export type UserFilter = z.infer<typeof schemas.UserFilter>
export const UserFilterSchema = schemas.UserFilter

export type UserCountryFilter = z.infer<typeof schemas.UserCountryFilter>
export const UserCountryFilterSchema = schemas.UserCountryFilter

export type UserAppVersionFilter = z.infer<typeof schemas.UserAppVersionFilter>
export const UserAppVersionFilterSchema = schemas.UserAppVersionFilter

export type UserPlatformVersionFilter = z.infer<
    typeof schemas.UserPlatformVersionFilter
>
export const UserPlatformVersionFilterSchema = schemas.UserPlatformVersionFilter

export type UserCustomFilter = z.infer<typeof schemas.UserCustomFilter>
export const UserCustomFilterSchema = schemas.UserCustomFilter

export type AudienceMatchFilter = z.infer<typeof schemas.AudienceMatchFilter>
export const AudienceMatchFilterSchema = schemas.AudienceMatchFilter

export type UpdateOverrideParams = z.infer<typeof schemas.UpdateUserOverrideDto>
export const UpdateOverrideDto = schemas.UpdateUserOverrideDto

export type Filter =
    | AllFilter
    | OptInFilter
    | UserFilter
    | UserCountryFilter
    | UserAppVersionFilter
    | UserPlatformVersionFilter
    | UserCustomFilter
    | AudienceMatchFilter

export type UserOverride = z.infer<typeof schemas.UserOverride>
export type FeatureOverride = z.infer<typeof schemas.FeatureOverride>
