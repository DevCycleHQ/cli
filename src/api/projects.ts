import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import apiClient from './apiClient'
import { buildHeaders } from './common'

export class CreateProjectParams {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description: string

    @IsNotEmpty()
    @IsString()
    key: string
}

export class GetProjectsParams {
    @IsString()
    @IsOptional()
    sortBy: string

    @IsOptional()
    sortOrder: 'asc' | 'desc'
}

const BASE_URL = '/v1/projects'

export const fetchProjects = async (token: string, queries?: GetProjectsParams) => {
    return apiClient.get(BASE_URL, {
        headers: buildHeaders(token),
        queries
    })
}

export const fetchProject = async (token: string, projectKey: string) => {
    return apiClient.get(`${BASE_URL}/:key`, {
        headers: buildHeaders(token),
        params: {
            key: projectKey,
        }
    })
}

export const createProject = async (
    token: string,
    params: CreateProjectParams
) => {
    return apiClient.post(BASE_URL, params, {
        headers: buildHeaders(token),
    })
}
