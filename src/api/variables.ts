import axios from 'axios'
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

export type CreateVariableParams = {
    name: string,
    description: string,
    key: string,
    _feature: string,
    type: 'String' | 'Boolean' | 'Number' | 'JSON'
}

export const createVariable = async (token: string, project_id: string, params: CreateVariableParams): Promise<Variable> => {
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
    } catch (e: any) {
        if (e.response?.status === 404) {
            return null
        }
        throw e
    }

}
