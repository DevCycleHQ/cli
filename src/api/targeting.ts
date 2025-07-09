import { IsOptional, IsString, IsArray, IsNotEmpty } from 'class-validator'
import apiClient from './apiClient'
import { buildHeaders } from './common'
import { Filter, UpdateFeatureConfigDto } from './schemas'

export const filterTypes = ['all', 'user', 'audienceMatch']
export type FilterType = 'all' | 'user' | 'audienceMatch'

export const userSubTypes = [
    'user_id',
    'email',
    'country',
    'platform',
    'platformVersion',
    'appVersion',
    'deviceModel',
    'customData',
]
export type UserSubType =
    | 'user_id'
    | 'email'
    | 'country'
    | 'platform'
    | 'platformVersion'
    | 'appVersion'
    | 'deviceModel'
    | 'customData'

export enum DataKeyType {
    string = 'String',
    boolean = 'Boolean',
    number = 'Number',
}

enum TargetingStatus {
    active = 'active',
    inactive = 'inactive',
}

export class UpdateTargetingParamsInput {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsOptional()
    @IsString()
    serve: string

    @IsOptional()
    @IsArray()
    definition: Filter[]
}

export const fetchTargetingForFeature = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key?: string,
) => {
    const url = '/v1/projects/:project/features/:feature/configurations'
    const response = await apiClient.get(url, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            feature: feature_key,
        },
        queries: {
            environment: environment_key,
        },
    })
    return response
}

export const enableTargeting = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string,
) => {
    return await updateTargetingStatusForFeatureAndEnvironment(
        token,
        project_id,
        feature_key,
        environment_key,
        TargetingStatus.active,
    )
}

export const disableTargeting = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string,
) => {
    return await updateTargetingStatusForFeatureAndEnvironment(
        token,
        project_id,
        feature_key,
        environment_key,
        TargetingStatus.inactive,
    )
}

const updateTargetingStatusForFeatureAndEnvironment = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string,
    status: TargetingStatus,
) => {
    const url = '/v1/projects/:project/features/:feature/configurations'
    return apiClient.patch(
        url,
        { status } as any,
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                feature: feature_key,
            },
            queries: {
                environment: environment_key,
            },
        },
    )
}

export const updateFeatureConfigForEnvironment = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string,
    params: UpdateFeatureConfigDto,
) => {
    const url = '/v1/projects/:project/features/:feature/configurations'
    const response = await apiClient.patch(url, params, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            feature: feature_key,
        },
        queries: {
            environment: environment_key,
        },
    })
    return response
}
