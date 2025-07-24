import apiClient from './apiClient'
import { buildHeaders } from './common'

const BASE_URL = '/v1/projects/:project/customProperties'

export const fetchCustomProperties = async (
    token: string,
    project_id: string,
) => {
    return apiClient.get(`${BASE_URL}`, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}

export const createCustomProperty = async (
    token: string,
    project_id: string,
    data: {
        name: string
        key: string
        type: 'String' | 'Boolean' | 'Number'
        propertyKey: string
    },
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
    data: {
        name?: string
        key?: string
        propertyKey?: string
        type?: 'String' | 'Boolean' | 'Number'
    },
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
