import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import apiClient from './apiClient'

export const environmentTypes = [
    'development',
    'staging',
    'production',
    'disaster_recovery'
]

export const sdkTypes = [
    'client',
    'mobile',
    'server'
]

export class CreateEnvironmentParams {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    @IsString()
    key: string

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsIn(environmentTypes)
    type: 'development' | 'staging' | 'production' | 'disaster_recovery'
}

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
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: { project: project_id }
    })
}

export const updateEnvironment = async (
    token: string,
    project_id: string,
    environmentKey: string,
    params: Partial<CreateEnvironmentParams>
) => {
    return apiClient.patch('/v1/projects/:project/environments/:key', params, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
            key: environmentKey
        }
    })
}

export const fetchEnvironments = async (token: string, project_id: string) => {
    return apiClient.get('/v1/projects/:project/environments', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
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
    try {
        const response = await apiClient.get('/v1/projects/:project/environments/:key', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            params: {
                project: project_id,
                key
            }
        })

        return response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        if (e.response?.status === 404) {
            return null
        }
        throw e
    }

}
