import apiClient from './apiClient'
import { buildHeaders } from './common'
import {
    CreateProjectParams,
    UpdateProjectParams,
    GetProjectsParams,
} from './schemas'

const BASE_URL = '/v1/projects'

export const fetchProjects = async (
    token: string,
    queries?: GetProjectsParams,
) => {
    return apiClient.get(BASE_URL, {
        headers: buildHeaders(token),
        queries,
    })
}

export const fetchProject = async (token: string, projectKey: string) => {
    return apiClient.get(`${BASE_URL}/:key`, {
        headers: buildHeaders(token),
        params: {
            key: projectKey,
        },
    })
}

export const createProject = async (
    token: string,
    params: CreateProjectParams,
) => {
    return apiClient.post(BASE_URL, params, {
        headers: buildHeaders(token),
    })
}

export const updateProject = async (
    token: string,
    projectKey: string,
    params: UpdateProjectParams,
) => {
    return apiClient.patch(`${BASE_URL}/:key`, params, {
        headers: buildHeaders(token),
        params: {
            key: projectKey,
        },
    })
}
