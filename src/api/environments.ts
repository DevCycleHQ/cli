import apiClient, { axiosClient } from './apiClient'
import { buildHeaders } from './common'
import { CreateEnvironmentParams, UpdateEnvironmentParams, Environment } from './schemas'

export class APIKey {
    key: string
    createdAt: string
    compromised: boolean
}

export const createEnvironment = async (
    token: string,
    project_id: string,
    params: CreateEnvironmentParams,
): Promise<Environment> => {
    const response = await apiClient.post('/v1/projects/:project/environments', params, {
        headers: buildHeaders(token),
        params: { project: project_id },
    })
    return response as Environment
}

export const updateEnvironment = async (
    token: string,
    project_id: string,
    environmentKey: string,
    params: UpdateEnvironmentParams,
): Promise<Environment> => {
    // Use axiosClient directly to avoid type instantiation issues
    const url = `/v1/projects/${project_id}/environments/${environmentKey}`
    const response = await axiosClient.patch(url, params, {
        headers: buildHeaders(token),
    })
    return response.data as Environment
}

export const fetchEnvironments = async (token: string, project_id: string): Promise<Environment[]> => {
    const response = await apiClient.get('/v1/projects/:project/environments', {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
    return response as Environment[]
}

export const fetchEnvironmentByKey = async (
    token: string,
    project_id: string,
    key: string,
): Promise<Environment | null> => {
    const response = await apiClient.get(
        '/v1/projects/:project/environments/:key',
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                key,
            },
        },
    )

    return response as Environment | null
}
