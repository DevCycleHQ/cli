import { z } from 'zod'
import apiClient from './apiClient'
import { buildHeaders } from './common'
import { CreateCustomPropertyDto, UpdateCustomPropertyDto } from './zodSchemas'

const BASE_URL = '/v1/projects/:project/customProperties'

export const fetchCustomProperties = async (
    token: string,
    project_id: string,
    queries: {
        page?: number
        perPage?: number
        sortBy?:
            | 'createdAt'
            | 'updatedAt'
            | 'name'
            | 'key'
            | 'createdBy'
            | 'propertyKey'
        sortOrder?: 'asc' | 'desc'
        search?: string
        type?: 'String' | 'Boolean' | 'Number'
    } = {},
) => {
    return apiClient.get(`${BASE_URL}`, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
        queries,
    })
}

export const createCustomProperty = async (
    token: string,
    project_id: string,
    data: z.infer<typeof CreateCustomPropertyDto>,
) => {
    return apiClient.post(`${BASE_URL}`, data, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}

export const updateCustomProperty = async (
    token: string,
    project_id: string,
    key: string,
    data: z.infer<typeof UpdateCustomPropertyDto>,
) => {
    return apiClient.patch(`${BASE_URL}/:key`, data, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            key,
        },
    })
}

export const deleteCustomProperty = async (
    token: string,
    project_id: string,
    key: string,
) => {
    return apiClient.delete(`${BASE_URL}/:key`, undefined, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            key,
        },
    })
}
