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
}

export const variableTypes = ['String', 'Boolean', 'Number', 'JSON']

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

export const fetchVariables = async (token: string, project_id: string): Promise<Variable[]> => {
    const url = new URL(`/v1/projects/${project_id}/variables`, BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
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
