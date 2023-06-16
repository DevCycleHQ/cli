import { AxiosError } from 'axios'
import apiClient from './apiClient'
import { Feature } from './schemas'
import { IsNotEmpty, IsString, IsOptional, IsJSON, ValidateNested, IsObject, IsBoolean } from 'class-validator'
import { CreateVariableParams } from './variables'
import { CreateVariationParams } from './variations'
import { Type } from 'class-transformer'
import 'reflect-metadata'

export class SDKVisibilityParams {
    @IsBoolean()
    @IsNotEmpty()
    mobile: boolean
    
    @IsBoolean()
    @IsNotEmpty()
    client: boolean

    @IsBoolean()
    @IsNotEmpty()
    server: boolean
}

export class CreateFeatureParams {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    @IsString()
    key: string

    @IsString()
    @IsOptional()
    description?: string

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateVariableParams)
    variables?: CreateVariableParams[]

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateVariationParams)
    variations?: CreateVariationParams[]

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SDKVisibilityParams)
    sdkVisibility?: SDKVisibilityParams
}

const FEATURE_URL = '/v1/projects/:project/features'

const buildHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: token,
})

export const fetchFeatures = async (token: string, project_id: string): Promise<Feature[]> => {
    const response = await apiClient.get(FEATURE_URL, {
        headers: buildHeaders(token),
        params: {
            project: project_id
        }
    })

    return response
}

export const fetchFeatureByKey = async (token: string, project_id: string, key: string): Promise<Feature | null> => {
    try {
        const response = await apiClient.get(`${FEATURE_URL}/:key`, {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                key
            }
        })

        return response
    } catch (e: unknown) {
        if (e instanceof AxiosError && e.response?.status === 404) {
            return null
        }
        throw e
    }

}

export const createFeature = async (
    token: string, 
    project_id: string,
    params: CreateFeatureParams
): Promise<Feature> => {
    return await apiClient.post(FEATURE_URL, params, {
        headers: buildHeaders(token),
        params: {
            project: project_id
        }
    })
}

export const deleteFeature = async (token: string, project_id: string, key: string): Promise<void> => {
    return apiClient.delete(`${FEATURE_URL}/:key`, undefined, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            key
        }
    })
}
