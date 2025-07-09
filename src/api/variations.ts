import { IsString, IsOptional } from 'class-validator'
import apiClient from './apiClient'
import { CreateVariationParams, Feature, Variation } from './schemas'
import { buildHeaders } from './common'

// TODO: Update these functions to use the new v2 API client once the v2 variations endpoint is implemented
const variationsUrl = '/v1/projects/:project/features/:feature/variations'

export class UpdateVariationParams {
    @IsString()
    @IsOptional()
    key?: string

    @IsString()
    @IsOptional()
    name?: string

    @IsOptional()
    variables?: {
        [key: string]: string | number | boolean | Record<string, unknown>
    }

    @IsString()
    @IsOptional()
    _id?: string

    [key: string]: any

    constructor(data: Partial<UpdateVariationParams> = {}) {
        Object.assign(this, data)
    }
}

export const fetchVariations = async (
    token: string,
    project_id: string,
    feature_key: string,
): Promise<Variation[]> => {
    const response = await apiClient.get(variationsUrl, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            feature: feature_key,
        },
    })

    return response
}

export const fetchVariationByKey = async (
    token: string,
    project_id: string,
    feature_key: string,
    variationKey: string,
): Promise<Variation> => {
    const response = await apiClient.get(`${variationsUrl}/:key`, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            feature: feature_key,
            key: variationKey,
        },
    })

    return response
}

export const createVariation = async (
    token: string,
    project_id: string,
    feature_key: string,
    variation: CreateVariationParams,
): Promise<Feature> => {
    const response = await apiClient.post(
        '/v1/projects/:project/features/:feature/variations',
        variation,
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                feature: feature_key,
            },
        },
    )

    return response
}

export const updateVariation = async (
    token: string,
    project_id: string,
    feature_key: string,
    variationKey: string,
    variation: UpdateVariationParams,
) => {
    return apiClient.patch(
        '/v1/projects/:project/features/:feature/variations/:key',
        variation,
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                feature: feature_key,
                key: variationKey,
            },
        },
    )
}
