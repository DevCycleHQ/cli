import apiClient from './apiClient'
import { buildHeaders } from './common'

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
