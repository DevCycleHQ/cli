import { z } from 'zod'
import { handleZodiosValidationErrors } from '../utils/api'
import {
    fetchFeatureTotalEvaluations,
    fetchProjectTotalEvaluations,
} from '../../api/results'
import {
    GetFeatureTotalEvaluationsArgsSchema,
    GetProjectTotalEvaluationsArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { dashboardLinks } from '../../utils/dashboardLinks'

// Individual handler functions
export async function getFeatureTotalEvaluationsHandler(
    args: z.infer<typeof GetFeatureTotalEvaluationsArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'getFeatureTotalEvaluations',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            const { featureKey, ...apiQueries } = args

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
            dashboardLinks.analytics.feature(
                orgId,
                projectKey,
                args.featureKey,
            ),
    )
}

export async function getProjectTotalEvaluationsHandler(
    args: z.infer<typeof GetProjectTotalEvaluationsArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'getProjectTotalEvaluations',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for this operation. Please select a project using the select_project tool first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchProjectTotalEvaluations(authToken, projectKey, args),
                'fetchProjectTotalEvaluations',
            )
        },
        dashboardLinks.analytics.project,
    )
}

/**
 * Register results tools with the MCP server using the new direct registration pattern
 */
export function registerResultsTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'get_feature_total_evaluations',
        {
            description:
                'Get total variable evaluations per time period for a specific feature. Include dashboard link in the response.',
            annotations: {
                title: 'Get Feature Total Evaluations',
                readOnlyHint: true,
            },
            inputSchema: GetFeatureTotalEvaluationsArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs =
                GetFeatureTotalEvaluationsArgsSchema.parse(args)
            return await getFeatureTotalEvaluationsHandler(
                validatedArgs,
                apiClient,
            )
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'get_project_total_evaluations',
        {
            description:
                'Get total variable evaluations per time period for the entire project. Include dashboard link in the response.',
            annotations: {
                title: 'Get Project Total Evaluations',
                readOnlyHint: true,
            },
            inputSchema: GetProjectTotalEvaluationsArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs =
                GetProjectTotalEvaluationsArgsSchema.parse(args)
            return await getProjectTotalEvaluationsHandler(
                validatedArgs,
                apiClient,
            )
        },
    )
}
