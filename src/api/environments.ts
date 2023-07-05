import apiClient from './apiClient'
import { buildHeaders } from './common'
import { CreateEnvironmentParams, UpdateEnvironmentParams } from './schemas'

export class APIKey {
    key: string
    createdAt: string
    compromised: boolean
}

export const createEnvironment = async (
    token: string,
    project_id: string,
    params: CreateEnvironmentParams
) => {
    return apiClient.post('/v1/projects/:project/environments', params, {
        headers: buildHeaders(token),
        params: { project: project_id }
    })
}

export const updateEnvironment = async (
    token: string,
    project_id: string,
    environmentKey: string,
    params: UpdateEnvironmentParams
) => {
    return apiClient.patch('/v1/projects/:project/environments/:key', params, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            key: environmentKey
        }
    })
}

export const fetchEnvironments = async (token: string, project_id: string) => {
    return apiClient.get('/v1/projects/:project/environments', {
        headers: buildHeaders(token),
        params: {
            project: project_id
        }
    })
}

export const fetchEnvironmentByKey = async (
    token: string,
    project_id: string,
    key: string
) => {
    const response = await apiClient.get('/v1/projects/:project/environments/:key', {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            key
        }
    })

    return response
}
