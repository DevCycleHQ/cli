import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import apiClient from './apiClient'
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
    schemaType: 'enum' | 'regex' | 'jsonSchema'
    enumValues?: string[] | number[]
    regexPattern?: string
    jsonSchema?: string
    description: string
    defaultValue: string | number | { [key: string]: string | boolean | number }
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
    const url = `/v1/projects/${project_id}/variables`
    const response = await apiClient.post(url, params, {
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
    const url = `/v1/projects/${project_id}/variables/${variableKey}`
    const response = await apiClient.patch(url,
        params,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })

    return response.data
}

export const fetchVariables = async (token: string, project_id: string): Promise<Variable[]> => {
    const url = `/v1/projects/${project_id}/variables`
    const response = await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const fetchAllVariables = async (token: string, project_id: string): Promise<Variable[]> => {
    const perPage = 1000
    const url = `/v1/projects/${project_id}/variables?perPage=${perPage}&page=1`
    const response = await apiClient.get(url, {
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
        const url = `/v1/projects/${project_id}/variables?perPage=${perPage}&page=${i}`
        promises.push(apiClient.get(url, {
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

export const fetchVariableByKey = async (token: string, project_id: string, key: string): Promise<Variable | null> => {
    const url = `/v1/projects/${project_id}/variables/${key}`
    try {
        const response = await apiClient.get(url, {
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
