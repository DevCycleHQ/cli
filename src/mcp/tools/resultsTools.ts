import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { handleZodiosValidationErrors } from '../utils/api'
import {
    fetchFeatureTotalEvaluations,
    fetchProjectTotalEvaluations,
} from '../../api/results'
import {
    GetFeatureTotalEvaluationsArgsSchema,
    GetProjectTotalEvaluationsArgsSchema,
    FeatureTotalEvaluationsQuerySchema,
    ProjectTotalEvaluationsQuerySchema,
} from '../types'
import {
    DASHBOARD_LINK_PROPERTY,
    FEATURE_KEY_PROPERTY,
    EVALUATION_QUERY_PROPERTIES,
    EVALUATION_DATA_POINT_SCHEMA,
    PROJECT_DATA_POINT_SCHEMA,
} from './commonSchemas'

import { ToolHandler } from '../server'

// Helper functions to generate dashboard links
const generateFeatureAnalyticsDashboardLink = (
    orgId: string,
    projectKey: string,
    featureKey: string,
): string => {
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/features/${featureKey}/analytics`
}

const generateProjectAnalyticsDashboardLink = (
    orgId: string,
    projectKey: string,
): string => {
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/analytics`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const FEATURE_EVALUATION_QUERY_PROPERTIES = {
    featureKey: FEATURE_KEY_PROPERTY,
    ...EVALUATION_QUERY_PROPERTIES,
}

const PROJECT_EVALUATION_QUERY_PROPERTIES = EVALUATION_QUERY_PROPERTIES

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

const FEATURE_EVALUATIONS_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: {
            type: 'object' as const,
            description: 'Feature evaluation data aggregated by time period',
            properties: {
                evaluations: {
                    type: 'array' as const,
                    description: 'Array of evaluation data points',
                    items: EVALUATION_DATA_POINT_SCHEMA,
                },
                cached: {
                    type: 'boolean' as const,
                    description: 'Whether this result came from cache',
                },
                updatedAt: {
                    type: 'string' as const,
                    format: 'date-time' as const,
                    description: 'When the data was last updated',
                },
            },
            required: ['evaluations', 'cached', 'updatedAt'],
        },
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

const PROJECT_EVALUATIONS_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: {
            type: 'object' as const,
            description: 'Project evaluation data aggregated by time period',
            properties: {
                evaluations: {
                    type: 'array' as const,
                    description: 'Array of evaluation data points',
                    items: PROJECT_DATA_POINT_SCHEMA,
                },
                cached: {
                    type: 'boolean' as const,
                    description: 'Whether this result came from cache',
                },
                updatedAt: {
                    type: 'string' as const,
                    format: 'date-time' as const,
                    description: 'When the data was last updated',
                },
            },
            required: ['evaluations', 'cached', 'updatedAt'],
        },
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const resultsToolDefinitions: Tool[] = [
    {
        name: 'get_feature_total_evaluations',
        description:
            'Get total variable evaluations per time period for a specific feature. Include dashboard link in the response.',
        annotations: {
            title: 'Get Feature Total Evaluations',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: FEATURE_EVALUATION_QUERY_PROPERTIES,
            required: ['featureKey'],
        },
        outputSchema: FEATURE_EVALUATIONS_OUTPUT_SCHEMA,
    },
    {
        name: 'get_project_total_evaluations',
        description:
            'Get total variable evaluations per time period for the entire project. Include dashboard link in the response.',
        annotations: {
            title: 'Get Project Total Evaluations',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: PROJECT_EVALUATION_QUERY_PROPERTIES,
        },
        outputSchema: PROJECT_EVALUATIONS_OUTPUT_SCHEMA,
    },
]

export const resultsToolHandlers: Record<string, ToolHandler> = {
    get_feature_total_evaluations: async (args: unknown, apiClient) => {
        const validatedArgs = GetFeatureTotalEvaluationsArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'getFeatureTotalEvaluations',
            validatedArgs,
            async (authToken: string, projectKey: string) => {
                const { featureKey, ...apiQueries } = validatedArgs

                return await handleZodiosValidationErrors(
                    () =>
                        fetchFeatureTotalEvaluations(
                            authToken,
                            projectKey,
                            featureKey,
                            apiQueries,
                        ),
                    'fetchFeatureTotalEvaluations',
                )
            },
            (orgId, projectKey) =>
                generateFeatureAnalyticsDashboardLink(
                    orgId,
                    projectKey,
                    validatedArgs.featureKey,
                ),
        )
    },
    get_project_total_evaluations: async (args: unknown, apiClient) => {
        const validatedArgs = GetProjectTotalEvaluationsArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'getProjectTotalEvaluations',
            validatedArgs,
            async (authToken: string, projectKey: string) => {
                return await handleZodiosValidationErrors(
                    () =>
                        fetchProjectTotalEvaluations(
                            authToken,
                            projectKey,
                            validatedArgs,
                        ),
                    'fetchProjectTotalEvaluations',
                )
            },
            generateProjectAnalyticsDashboardLink,
        )
    },
}
