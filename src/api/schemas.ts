import { z } from 'zod'
import {
    Project,
    Environment,
    SDKKeys,
    Variable,
    Variation,
    Feature,
    FeatureConfig,
    Audience,
    Target,
    Override,
    CustomProperty,
    GetProjectsParams,
    CreateProjectDto,
    UpdateProjectDto,
    CreateEnvironmentDto,
    UpdateEnvironmentDto,
    CreateFeatureDto,
    UpdateFeatureDto,
    CreateVariableDto,
    UpdateVariableDto,
    CreateVariationDto,
    UpdateFeatureConfigDto,
    UpdateTargetDto,
    AudienceOperatorWithAudienceMatchFilter,
    AllFilter,
    OptInFilter,
    UserFilter,
    UserCountryFilter,
    UserAppVersionFilter,
    UserPlatformVersionFilter,
    UserCustomFilter,
    AudienceMatchFilter,
    UpdateUserOverrideDto,
    UserOverride,
    FeatureOverride,
} from './zodClient'
import { UpdateFeatureStatusDto } from './zodClientV2'

export type Project = z.infer<typeof Project>
export type Environment = z.infer<typeof Environment>
export type SDKKeys = z.infer<typeof SDKKeys>
export type Variable = z.infer<typeof Variable>
export type Variation = z.infer<typeof Variation>
export type Feature = z.infer<typeof Feature>
export type FeatureConfig = z.infer<typeof FeatureConfig>
export type Audience = z.infer<typeof Audience>
export type Target = z.infer<typeof Target>
export type Override = z.infer<typeof Override>
export type CustomProperty = z.infer<typeof CustomProperty>
export type GetProjectsParams = z.infer<typeof GetProjectsParams>
export { GetProjectsParams }

export type CreateProjectParams = z.infer<typeof CreateProjectDto>
export { CreateProjectDto }

export type UpdateProjectParams = z.infer<typeof UpdateProjectDto>
export { UpdateProjectDto }

export type CreateEnvironmentParams = z.infer<typeof CreateEnvironmentDto>
export { CreateEnvironmentDto }

export type UpdateEnvironmentParams = z.infer<typeof UpdateEnvironmentDto>
export { UpdateEnvironmentDto }

export type CreateFeatureParams = z.infer<typeof CreateFeatureDto>
export { CreateFeatureDto }

export type UpdateFeatureParams = z.infer<typeof UpdateFeatureDto>
export { UpdateFeatureDto }

export type UpdateFeatureStatusParams = z.infer<typeof UpdateFeatureStatusDto>
export { UpdateFeatureStatusDto }

export type CreateVariableParams = z.infer<typeof CreateVariableDto>
export { CreateVariableDto }

export type UpdateVariableParams = z.infer<typeof UpdateVariableDto>
export { UpdateVariableDto }

export type CreateVariationParams = z.infer<typeof CreateVariationDto>
export { CreateVariationDto }

export type UpdateVariationParams = Partial<CreateVariationParams>

export type UpdateFeatureConfigDto = z.infer<typeof UpdateFeatureConfigDto>
export { UpdateFeatureConfigDto }

export type UpdateTargetParams = z.infer<typeof UpdateTargetDto>
export { UpdateTargetDto }

export type AudienceOperatorWithAudienceMatchFilter = z.infer<
    typeof AudienceOperatorWithAudienceMatchFilter
>
export type Filters = z.infer<
    typeof AudienceOperatorWithAudienceMatchFilter.shape.filters
>

export type AllFilter = z.infer<typeof AllFilter>
export const AllFilterSchema = AllFilter

export type OptInFilter = z.infer<typeof OptInFilter>
export const OptInFilterSchema = OptInFilter

export type UserFilter = z.infer<typeof UserFilter>
export const UserFilterSchema = UserFilter

export type UserCountryFilter = z.infer<typeof UserCountryFilter>
export const UserCountryFilterSchema = UserCountryFilter

export type UserAppVersionFilter = z.infer<typeof UserAppVersionFilter>
export const UserAppVersionFilterSchema = UserAppVersionFilter

export type UserPlatformVersionFilter = z.infer<
    typeof UserPlatformVersionFilter
>
export const UserPlatformVersionFilterSchema = UserPlatformVersionFilter

export type UserCustomFilter = z.infer<typeof UserCustomFilter>
export const UserCustomFilterSchema = UserCustomFilter

export type AudienceMatchFilter = z.infer<typeof AudienceMatchFilter>
export const AudienceMatchFilterSchema = AudienceMatchFilter

export type UpdateOverrideParams = z.infer<typeof UpdateUserOverrideDto>
export const UpdateOverrideDto = UpdateUserOverrideDto

export type Filter =
    | AllFilter
    | OptInFilter
    | UserFilter
    | UserCountryFilter
    | UserAppVersionFilter
    | UserPlatformVersionFilter
    | UserCustomFilter
    | AudienceMatchFilter

export type UserOverride = z.infer<typeof UserOverride>
export type FeatureOverride = z.infer<typeof FeatureOverride>
