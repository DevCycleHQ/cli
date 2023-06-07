import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import apiClient from './apiClient'

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

export const fetchProjects = async (token: string) => {
    return apiClient.get('/v1/projects', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })
}

export const createProject = async (
    token: string,
    params: CreateProjectParams
) => {
    return apiClient.post('/v1/projects', params, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })
}
