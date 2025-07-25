import apiClient from './apiClient'
import { buildHeaders } from './common'
import {
    FeatureTotalEvaluationsQuerySchema,
    ProjectTotalEvaluationsQuerySchema,
} from '../mcp/types'
import { z } from 'zod'

export const fetchFeatureTotalEvaluations = async (
    token: string,
    project_id: string,
    feature_key: string,
    queries: z.infer<typeof FeatureTotalEvaluationsQuerySchema> = {},
) => {
    return apiClient.get(
        '/v1/projects/:project/features/:feature/results/total-evaluations',
        {
            headers: buildHeaders(token),
            params: {
                project: project_id,
                feature: feature_key,
            },
            queries,
        },
    )
}

export const fetchProjectTotalEvaluations = async (
    token: string,
    project_id: string,
    queries: z.infer<typeof ProjectTotalEvaluationsQuerySchema> = {},
) => {
    return apiClient.get('/v1/projects/:project/results/total-evaluations', {
        headers: buildHeaders(token),
        params: {
            project: project_id,
        },
        queries,
    })
}
