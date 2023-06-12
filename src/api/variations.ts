import apiClient from './apiClient'
import { Variation } from './schemas'

export const fetchVariations = async (token: string, project_id: string, feature_key: string): Promise<Variation[]> => {
    const response = await apiClient.get('/v1/projects/:project/features/:feature/variations', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
            feature: feature_key,
        }
    })

    return response
}
