import axios from 'axios'
import { BASE_URL } from './common'
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export const environmentTypes = [
    'development',
    'staging',
    'production',
    'disaster_recovery',
]

export const sdkTypes = ['client', 'mobile', 'server']

export class Environment {
    _id: string
    _project?: string
    name?: string
    key: string
    type: 'development' | 'staging' | 'production' | 'disaster_recovery'
    sdkKeys: Record<string, APIKey[]>
    description?: string
    createdAt: Date
    updatedAt: Date
}

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
    type: string
}

export class APIKey {
    key: string
    createdAt: Date
    compromised: boolean
}

export const createEnvironment = async (
    token: string,
    project_id: string,
    params: CreateEnvironmentParams,
): Promise<Environment> => {
    const url = new URL(`/v1/projects/${project_id}/environments`, BASE_URL)
    const response = await axios.post(url.href, params, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const updateEnvironment = async (
    token: string,
    project_id: string,
    environmentKey: string,
    params: Partial<CreateEnvironmentParams>,
): Promise<Environment> => {
    const url = new URL(
        `/v1/projects/${project_id}/environments/${environmentKey}`,
        BASE_URL,
    )
    const response = await axios.patch(url.href, params, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const fetchEnvironments = async (
    token: string,
    project_id: string,
): Promise<Environment[]> => {
    const url = new URL(`/v1/projects/${project_id}/environments`, BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const fetchEnvironmentByKey = async (
    token: string,
    project_id: string,
    key: string,
): Promise<Environment | null> => {
    const url = new URL(
        `/v1/projects/${project_id}/environments/${key}`,
        BASE_URL,
    )
    try {
        const response = await axios.get(url.href, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })

        return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        if (e.response?.status === 404) {
            return null
        }
        throw e
    }
}
