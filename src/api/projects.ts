import axios from 'axios'
import { BASE_URL } from './common'
import { IsNotEmpty, IsString } from 'class-validator'

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
    const url = new URL('/v1/projects', BASE_URL)
    const response = await axios.get(url.href, {
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
    const url = new URL('/v1/projects', BASE_URL)
    const response = await axios.post(url.href, params, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}
