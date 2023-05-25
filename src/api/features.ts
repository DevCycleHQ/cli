import apiClient from './apiClient'

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
    const url = `/v1/projects/${project_id}/features`
    const response = await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}

export const fetchFeatureByKey = async (token: string, project_id: string, key: string): Promise<Feature | null> => {
    const url = `/v1/projects/${project_id}/features/${key}`
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
