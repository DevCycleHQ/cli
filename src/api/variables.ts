import axios from 'axios'
import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { BASE_URL } from './common'
export class Variable {
    _feature?: string
    type: string
    name?: string
    description?: string
    key: string
    initialDefaultValue?: string | number | boolean | Record<string, unknown>
    createdAt: Date
    updatedAt: Date
    validationSchema?: ValidationSchema
}

export const variableTypes = ['String', 'Boolean', 'Number', 'JSON']

type ValidationSchema = {
    schemaType: 'enum' | 'url' | 'regex'
    enumValues?: string[]
    regexPattern?: string
    example?: string
    jsonSchema?: string
    dateFormats?: string[]
}

export class CreateVariableParams {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    key: string

    @IsNotEmpty()
    @IsString()
    _feature: string

    @IsString()
    @IsIn(variableTypes)
    type: string
}

export const createVariable = async (
    token: string,
    project_id: string,
    params: CreateVariableParams
): Promise<Variable> => {
    const url = new URL(`/v1/projects/${project_id}/variables`, BASE_URL)
    const response = await axios.post(url.href,
        params,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })

    return response.data
}

export const updateVariable = async (
    token: string,
    project_id: string,
    variableKey: string,
    params: Partial<CreateVariableParams>
): Promise<Variable> => {
    const url = new URL(`/v1/projects/${project_id}/variables/${variableKey}`, BASE_URL)
    const response = await axios.patch(url.href,
        params,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })

    return response.data
}

export const fetchVariables = async (
    token: string,
    project_id: string,
    queryOptions?: QueryOptions
): Promise<Variable[]> => {
    const queryParams = new URLSearchParams()
    for (const [key, value] of Object.entries(queryOptions || {})) {
        queryParams.append(key, value as string)
    }

    const url = new URL(`/v1/projects/${project_id}/variables${'?' + queryParams.toString()}`, BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export type QueryOptions = {
    perPage?: number
    sortBy?: 'key' | 'name' | 'createdAt' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
}

export const fetchVariableByKey = async (token: string, project_id: string, key: string): Promise<Variable | null> => {
    const url = new URL(`/v1/projects/${project_id}/variables/${key}`, BASE_URL)
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
