import { IsString } from 'class-validator'
import apiClient, { axiosClient } from './apiClient'
import { buildHeaders } from './common'

const BASE_URL = '/v1/projects/:project/userProfile/current'

export class UpdateUserProfileParams {
    @IsString()
    dvcUserId: string | null

    [key: string]: any

    constructor(data: Partial<UpdateUserProfileParams> = {}) {
        Object.assign(this, data)
    }
}

export const fetchUserProfile = async (token: string, project_id: string) => {
    return apiClient.get(`${BASE_URL}`, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}

export const updateUserProfile = async (
    token: string,
    project_id: string,
    dvcUserId: UpdateUserProfileParams,
) => {
    // Use axiosClient directly to avoid type instantiation issues
    const url = `/v1/projects/${project_id}/userProfile/current`
    const response = await axiosClient.patch(url, dvcUserId, {
        headers: buildHeaders(token),
    })
    return response.data
}
