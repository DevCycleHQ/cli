import { AxiosError } from 'axios'
import apiClient from './apiClient'
import { CreateFeatureParams, Feature, UpdateFeatureParams } from './schemas'
import 'reflect-metadata'
import { buildHeaders } from './common'

const FEATURE_URL = '/v1/projects/:project/features'

export const fetchFeatures = async (
    token: string,
    project_id: string,
    queries: {
        feature?: string
        page?: number
        perPage?: number
        search?: string
    } = {},
): Promise<Feature[]> => {
    const response = await apiClient.get(FEATURE_URL, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
        queries,
    })

    return response
}

export const fetchFeatureByKey = async (
    token: string,
    project_id: string,
    key: string,
): Promise<Feature | null> => {
    try {
        const response = await apiClient.get(`${FEATURE_URL}/:key`, {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                key,
            },
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
    params: CreateFeatureParams,
): Promise<Feature> => {
    return await apiClient.post(FEATURE_URL, params, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}

export const updateFeature = async (
    token: string,
    project_id: string,
    feature_id: string,
    params: UpdateFeatureParams,
): Promise<Feature> => {
    return await apiClient.patch(`${FEATURE_URL}/:key`, params, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            key: feature_id,
        },
    })
}

export const deleteFeature = async (
    token: string,
    project_id: string,
    key: string,
): Promise<void> => {
    return apiClient.delete(`${FEATURE_URL}/:key`, undefined, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            key,
        },
    })
}
