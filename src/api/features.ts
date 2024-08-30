import { AxiosError } from 'axios'
import { v2ApiClient as apiClient, apiClient as apiV1Client } from './apiClient'
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
    } = {},
): Promise<Feature[]> => {
    const response = await apiClient.get(FEATURE_URL, {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
        queries,
    })

    return response
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
