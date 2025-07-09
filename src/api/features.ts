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
    } = {},
): Promise<Feature[]> => {
    // Use axiosClient directly to bypass zodios type checking for v2 API
    const url = `/v2/projects/${project_id}/features`
    const response = await axiosClient.get(url, {
        headers: buildHeaders(token),
        params: queries,
    })

    return response.data as Feature[]
}

export const fetchFeatureByKey = async (
    token: string,
    project_id: string,
    key: string,
): Promise<Feature | null> => {
    try {
        // Use axiosClient directly to bypass zodios type checking for v2 API
        const url = `/v2/projects/${project_id}/features/${key}`
        const response = await axiosClient.get(url, {
            headers: buildHeaders(token),
        })

        return response.data as Feature
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
    // Use axiosClient directly to bypass zodios type checking for v2 API
    const url = `/v2/projects/${project_id}/features`
    const response = await axiosClient.post(url, params, {
        headers: buildHeaders(token),
    })

    return response.data as Feature
}

export const updateFeature = async (
    token: string,
    project_id: string,
    feature_id: string,
    params: UpdateFeatureParams,
): Promise<Feature> => {
    // Use axiosClient directly to bypass zodios type checking for v2 API
    const url = `/v2/projects/${project_id}/features/${feature_id}`
    const response = await axiosClient.patch(url, params, {
        headers: buildHeaders(token),
    })

    return response.data as Feature
}

export const deleteFeature = async (
    token: string,
    project_id: string,
    key: string,
): Promise<void> => {
    // Use axiosClient directly to bypass zodios type checking for v2 API
    const url = `/v2/projects/${project_id}/features/${key}`
    await axiosClient.delete(url, {
        headers: buildHeaders(token),
    })
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
    return `/v2/projects/${project_id}/features?perPage=${perPage}&page=${page}&status=${status}`
}
