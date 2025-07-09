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

export const getFeatureAuditLogHistory = async (
    token: string,
    projectKey: string,
    featureKey: string,
    daysBack = 30,
): Promise<{
    timeline: Array<{
        id: string
        timestamp: string
        action: string
        actor: {
            name: string
            email?: string
        }
        resource: {
            type: string
            name: string
            key: string
        }
        changes: Array<{
            field: string
            oldValue: unknown
            newValue: unknown
        }>
        environment?: string
    }>
}> => {
    try {
        // Calculate the date threshold
        const sinceDate = new Date()
        sinceDate.setDate(sinceDate.getDate() - daysBack)
        const startDate = sinceDate.toISOString()

        const params = {
            startDate,
            perPage: 100,
            page: 1,
        }
        console.error(`feature history params: ${JSON.stringify(params)}`)

        // Use the audit log API to get feature history
        const response = await axiosClient.get(
            `/v1/projects/${projectKey}/features/${featureKey}/audit`,
            {
                headers: buildHeaders(token),
                params,
            },
        )
        console.error(
            `feature history response: ${JSON.stringify(response.data)}`,
        )

        const auditLogs = response.data || []

        // Transform audit log entries to timeline format
        const timeline = auditLogs.map((entry: any) => ({
            id: entry._id || entry.id,
            timestamp: entry.createdAt || entry.timestamp,
            action: entry.action || 'unknown',
            actor: {
                name: entry.user?.name || entry.actor?.name || 'Unknown',
                email: entry.user?.email || entry.actor?.email,
            },
            resource: {
                type: entry.resourceType || 'feature',
                name: entry.resourceName || featureKey,
                key: entry.resourceKey || featureKey,
            },
            changes: entry.changes || [],
            environment: entry.environment?.key || entry.environmentKey,
        }))

        return { timeline }
    } catch (error) {
        // If audit log API fails, return empty result
        console.warn(
            'Failed to fetch feature history from audit log:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        return { timeline: [] }
    }
}
