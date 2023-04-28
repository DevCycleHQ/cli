import axios from 'axios'
import { BASE_URL } from './common'
import { IsNotEmpty, IsString } from 'class-validator'

export class Feature {
    _id: string
    _project?: string
    name?: string
    description?: string
    key: string
    type: 'release' | 'experiment' | 'permission' | 'ops'
    tags: string[]
    createdAt: Date
    updatedAt: Date
    variations: {
        key: string
        name: string
        _id: string
        variables: Record<string, any>
    }[]
    variables: featureVariable[]
}

export class CreateFeatureParams {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    key: string

    variations?: {
        key: string
        name: string
        variables: Record<string, unknown>
    }[]

    variables: featureVariable[]
}

type featureVariable = {
    defaultValue: boolean | string | number | Record<string, unknown>
    key: string
    name: string
    type: 'Boolean' | 'Number' | 'String' | 'JSON'
}

export const fetchFeatures = async (
    token: string,
    project_id: string,
): Promise<Feature[]> => {
    const url = new URL(`/v1/projects/${project_id}/features`, BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const fetchFeatureByKey = async (
    token: string,
    project_id: string,
    key: string,
): Promise<Feature | null> => {
    const url = new URL(`/v1/projects/${project_id}/features/${key}`, BASE_URL)
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

export const createFeature = async (
    token: string,
    project_id: string,
    feature: CreateFeatureParams,
): Promise<Feature | null> => {
    const url = new URL(`/v1/projects/${project_id}/features`, BASE_URL)
    try {
        const response = await axios.post(
            url.href,
            { ...feature, type: 'release' },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            },
        )
        return response.data
    } catch (e: any) {
        if (e.response?.status === 404) {
            return null
        }
        console.error('Error:', e.response?.data) // Log the error response data
        throw e
    }
}
