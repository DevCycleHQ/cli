import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import apiClient from './apiClient'
import { Feature, Variation } from './schemas'

export class CreateVariationParams {
    @IsString()
    @IsNotEmpty()
    key: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsOptional()
    variables?: { [key: string]: string | number | boolean | Record<string, unknown> }
}

export const fetchVariations = async (token: string, project_id: string, feature_key: string): Promise<Variation[]> => {
    const response = await apiClient.get('/v1/projects/:project/features/:feature/variations', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
            feature: feature_key,
        }
    })

    return response
}

export const createVariation = async (
    token: string,
    project_id: string,
    feature_key: string,
    variation: CreateVariationParams
): Promise<Feature> => {
    const response = await apiClient.post('/v1/projects/:project/features/:feature/variations', variation, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
            feature: feature_key,
        }
    })

    return response
}
