import { IsString } from 'class-validator'
import apiClient from './apiClient'
import { buildHeaders } from './common'

const BASE_URL = '/v1/projects/:project/userProfile/current'

export class UpdateUserProfileParams {
    @IsString()
    dvcUserId: string | null
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
    return apiClient.patch(`${BASE_URL}`, dvcUserId, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}
