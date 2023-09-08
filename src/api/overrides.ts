import apiClient from './apiClient'
import { buildHeaders } from './common'
import { Override, UpdateOverrideParams } from './schemas'

const BASE_URL = '/v1/projects/:project'

export const deleteAllProjectOverrides = async (
    token: string,
    project_id: string,
) => {
    return apiClient.delete(`${BASE_URL}/overrides/current`, undefined,
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
            },
        })
}

export const deleteFeatureOverrides = async (
    token: string,
    project_id: string,
    feature: string,
    environment: string
) => {
    return apiClient.delete(`${BASE_URL}/features/:feature/overrides/current`, undefined,
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                feature: feature,
            },
            queries: {
                environment: environment,
            },
        })
}

export const updateOverride = async (
    token: string,
    project_id: string,
    feature_id: string,
    params: UpdateOverrideParams,
): Promise<Override> => {
    return await apiClient.put(`${BASE_URL}/features/:feature/overrides/current`, params, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            feature: feature_id,
            environment: params.environment,
            variation: params.variation
        }
    })
}

export const fetchFeatureOverridesForUser = async (
    token: string,
    project_id: string,
    feature_id: string,
    environment_id: string
) => {
    const endpoint = '/features/:feature/overrides/current'
    return apiClient.get(`${BASE_URL}${endpoint}`, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            feature: feature_id,
        },
        queries: {
            environment: environment_id,
        },
    })
}

export const fetchProjectOverridesForUser = async (
    token: string,
    project_id: string,
) => {
    return apiClient.get(`${BASE_URL}/overrides/current`, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}