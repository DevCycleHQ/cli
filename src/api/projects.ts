import { IsNotEmpty, IsString } from 'class-validator'
import apiClient from './apiClient'

export type Project = {
    id: string
    name: string
    key: string
    description: string
}

export class CreateProjectParams {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    key: string
}

export const fetchProjects = async (token: string): Promise<Project[]> => {
    const url = '/v1/projects'
    const response = await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const createProject = async (
    token: string,
    params: CreateProjectParams
): Promise<Project> => {
    const url = '/v1/projects'
    const response = await apiClient.post(url, params, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}
