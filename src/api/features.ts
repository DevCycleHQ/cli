import apiClient from './apiClient'
import { Feature } from './schemas'

export const fetchFeatures = async (token: string, project_id: string): Promise<Feature[]> => {
    const response = await apiClient.get('/v1/projects/:project/features', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id
        }
    })

    return response
}

export const fetchFeatureByKey = async (token: string, project_id: string, key: string): Promise<Feature | null> => {
    try {
        const response = await apiClient.get('/v1/projects/:project/features/:key', {
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

export const deleteFeature = async (token: string, project_id: string, key: string): Promise<void> => {
    const url = '/v1/projects/:project/features/:key'
    return apiClient.delete(url, undefined, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
            key
        }
    })
}
