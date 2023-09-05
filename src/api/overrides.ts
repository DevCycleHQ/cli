import apiClient from './apiClient'
import { buildHeaders } from './common'

const BASE_URL = '/v1/projects/:project/overrides/current'

export const deleteAllProjectOverrides = async (
    token: string,
    project_id: string,
) => {
    return apiClient.delete(`${BASE_URL}`, undefined,
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
            },
        })
}
