import apiClient from './apiClient'

export class Variation {
    _id?: string
    key: string
    name: string
    variables?: { [key: string]: string | number | boolean | Record<string, unknown> }
}

export const fetchVariations = async (token: string, project_id: string, feature_key: string): Promise<Variation[]> => {
    const url = `/v1/projects/${project_id}/features/${feature_key}/variations`
    const response = await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}
