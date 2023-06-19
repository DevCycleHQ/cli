import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import apiClient, { axiosClient } from './apiClient'
import { Variable } from './schemas'

export const variableTypes = ['String', 'Boolean', 'Number', 'JSON']

export class CreateVariableParams {
    @IsString()
    @IsOptional()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    @IsNotEmpty()
    @IsString()
    key: string

    @IsOptional()
    @IsString()
    feature?: string

    @IsString()
    @IsIn(variableTypes)
    type: 'String' | 'Boolean' | 'Number' | 'JSON'
}

export const createVariable = async (
    token: string,
    project_id: string,
    params: CreateVariableParams
) => {
    const data = {
        name: params.name,
        description: params.description,
        key: params.key,
        _feature: params.feature,
        type: params.type,
    }
    return apiClient.post('/v1/projects/:project/variables', data, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
        }
    })
}

export const updateVariable = async (
    token: string,
    project_id: string,
    variableKey: string,
    params: Partial<CreateVariableParams>
) => {
    const data = {
        name: params?.name,
        description: params?.description,
        key: params?.key,
        _feature: params?.feature,
        type: params?.type,
    }
    return apiClient.patch('/v1/projects/:project/variables/:key',
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            params: {
                project: project_id,
                key: variableKey,
            }
        })
}

export const fetchVariables = async (token: string, project_id: string, feature_id?: string) => {
    return await apiClient.get('/v1/projects/:project/variables', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
        },
        queries: {
            ...(feature_id && { feature: feature_id })
        }
    })
}

export const fetchAllVariables = async (token: string, project_id: string) => {
    const perPage = 1000
    const firstPage = 1
    const url = generatePaginatedVariableUrl(project_id, firstPage, perPage)
    // we have to use axiosClient instead of zodios because we need access to response headers
    const response = await axiosClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    const { headers } = response
    const total = Number(headers['count'])
    const totalPages = Math.ceil(total / perPage)
    const promises = []
    for (let i = 2; i <= totalPages; i++) {
        const url = generatePaginatedVariableUrl(project_id, i, perPage)
        promises.push(axiosClient.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        }))
    }

    const responses = await Promise.all(promises)
    const variables: Variable[] = responses.reduce((acc, response) => {
        return acc.concat(response.data)
    }, response.data)

    return variables
}

export const fetchVariableByKey = async (token: string, project_id: string, key: string) => {
    try {
        const response = await apiClient.get('/v1/projects/:project/variables/:key', {
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

const generatePaginatedVariableUrl = (project_id: string, page: number, perPage: number): string => {
    return `/v1/projects/${project_id}/variables?perPage=${perPage}&page=${page}&status=active`
}
