import axios from 'axios'
import { BASE_URL } from './common'
import { Variable } from '../types/variable'

export const fetchVariableKeys = async (token: string, project_id: string): Promise<string[]> => {
    const url = new URL(`/v1/projects/${project_id}/variables`, BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data.map((variable: any) => variable.key)
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
