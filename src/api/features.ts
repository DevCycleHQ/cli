import { AxiosError } from 'axios'
import {
    v2ApiClient as apiClient,
    apiClient as apiV1Client,
    axiosClient,
} from './apiClient'
import { CreateFeatureParams, Feature, UpdateFeatureParams } from './schemas'
import 'reflect-metadata'
import { buildHeaders } from './common'

const FEATURE_URL = '/v2/projects/:project/features'

export const fetchFeatures = async (
    token: string,
    project_id: string,
    queries: {
        feature?: string
        page?: number
        perPage?: number
        search?: string
        staleness?: string
    } = {},
): Promise<Feature[]> => {
    console.error('=== fetchFeatures API START ===')
    console.error('Project ID:', project_id)
    console.error('Token length:', token?.length || 0)
    console.error('Token prefix:', token?.substring(0, 20) + '...')
    console.error('Queries:', JSON.stringify(queries, null, 2))

    const url = FEATURE_URL
    console.error('API URL template:', url)
    console.error('Full URL will be:', url.replace(':project', project_id))

    try {
        console.error('Making API request...')
        const response = await apiClient.get(FEATURE_URL, {
            headers: buildHeaders(token),
            params: {
                project: project_id,
            },
            queries,
        })

        console.error('API request successful')
        console.error('Response type:', typeof response)
        console.error('Response is array:', Array.isArray(response))
        console.error(
            'Response length:',
            Array.isArray(response) ? response.length : 'N/A',
        )
        if (Array.isArray(response) && response.length > 0) {
            console.error(
                'First feature sample:',
                JSON.stringify(response[0], null, 2),
            )
        }
        console.error('=== fetchFeatures API END (SUCCESS) ===')

        return response
    } catch (error) {
        console.error('=== fetchFeatures API ERROR ===')
        console.error('Error type:', error?.constructor?.name)
        console.error(
            'Error message:',
            error instanceof Error ? error.message : 'Unknown',
        )
        if (error instanceof AxiosError) {
            console.error('Axios error status:', error.response?.status)
            console.error('Axios error data:', error.response?.data)
            console.error('Axios error headers:', error.response?.headers)
            console.error('Request config:', {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                params: error.config?.params,
            })
        }
        console.error('Full error:', error)
        console.error('=== fetchFeatures API END (ERROR) ===')
        throw error
    }
}

export const fetchFeatureByKey = async (
    token: string,
    project_id: string,
    key: string,
): Promise<Feature | null> => {
    try {
        const response = await apiClient.get(`${FEATURE_URL}/:key`, {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                key,
            },
        })

        return response
    } catch (e: unknown) {
        if (e instanceof AxiosError && e.response?.status === 404) {
            return null
        }
        throw e
    }
}

export const createFeature = async (
    token: string,
    project_id: string,
    params: CreateFeatureParams,
): Promise<Feature> => {
    return await apiClient.post(FEATURE_URL, params, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
    })
}

export const updateFeature = async (
    token: string,
    project_id: string,
    feature_id: string,
    params: UpdateFeatureParams,
): Promise<Feature> => {
    return await apiClient.patch(`${FEATURE_URL}/:feature`, params, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
            feature: feature_id,
        },
    })
}

export const deleteFeature = async (
    token: string,
    project_id: string,
    key: string,
): Promise<void> => {
    return apiV1Client.delete(
        '/v1/projects/:project/features/:key',
        undefined,
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                key,
            },
        },
    )
}

export const fetchAllCompletedOrArchivedFeatures = async (
    token: string,
    project_id: string,
): Promise<Feature[]> => {
    const statuses = ['complete', 'archived']
    const perPage = 1000
    const firstPage = 1

    const fetchFeaturesForStatus = async (
        status: string,
    ): Promise<Feature[]> => {
        const url = generatePaginatedFeatureUrl(
            project_id,
            firstPage,
            perPage,
            status,
        )
        const response = await axiosClient.get(url, {
            headers: buildHeaders(token),
        })

        const { headers } = response
        const total = Number(headers['count'])
        const totalPages = Math.ceil(total / perPage)

        const promises = Array.from({ length: totalPages - 1 }, (_, i) => {
            const url = generatePaginatedFeatureUrl(
                project_id,
                i + 2,
                perPage,
                status,
            )
            return axiosClient.get(url, {
                headers: buildHeaders(token),
            })
        })

        const responses = await Promise.all(promises)
        return responses.reduce<Feature[]>((acc, response) => {
            return acc.concat(response.data)
        }, response.data)
    }

    const allFeatures = await Promise.all(statuses.map(fetchFeaturesForStatus))
    return allFeatures.flat()
}

const generatePaginatedFeatureUrl = (
    project_id: string,
    page: number,
    perPage: number,
    status: string,
): string => {
    return `/v1/projects/${project_id}/features?perPage=${perPage}&page=${page}&status=${status}`
}
