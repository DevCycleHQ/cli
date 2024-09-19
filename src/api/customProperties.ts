import apiClient from './apiClient'
import { buildHeaders } from './common'

const BASE_URL = '/v1/projects/:project/customProperties'

export const fetchCustomProperties = async (token: string, project_id: string) => {
    return apiClient.get(`${BASE_URL}`, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}
