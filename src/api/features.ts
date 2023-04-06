import axios from 'axios'
import { BASE_URL } from './common'
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
}

export const fetchFeatures = async (token: string, project_id: string): Promise<Feature[]> => {
    const url = new URL(`/v1/projects/${project_id}/features`, BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const fetchFeatureByKey = async (token: string, project_id: string, key: string): Promise<Feature | null> => {
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
