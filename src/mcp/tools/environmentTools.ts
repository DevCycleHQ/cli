import { z } from 'zod'
import {
    handleZodiosValidationErrors,
    omitProjectKey,
    MISSING_PROJECT_KEY_ERROR,
} from '../utils/api'
import { createEnvironment, updateEnvironment } from '../../api/environments'
import {
    CreateEnvironmentArgsSchema,
    UpdateEnvironmentArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { dashboardLinks } from '../utils/dashboardLinks'

// Individual handler functions
export async function createEnvironmentHandler(
    args: z.infer<typeof CreateEnvironmentArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'createEnvironment',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () =>
                    createEnvironment(
                        authToken,
                        projectKey,
                        omitProjectKey(args),
                    ),
                'createEnvironment',
            )
        },
        dashboardLinks.environment.settings,
    )
}

export async function updateEnvironmentHandler(
    args: z.infer<typeof UpdateEnvironmentArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { key, ...updateData } = omitProjectKey(args)

    return await apiClient.executeWithDashboardLink(
        'updateEnvironment',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () => updateEnvironment(authToken, projectKey, key, updateData),
                'updateEnvironment',
            )
        },
        dashboardLinks.environment.settings,
    )
}

/**
 * Register environment tools with the MCP server using the new direct registration pattern.
 * Listing environments and reading SDK keys are covered by select_project.
 */
export function registerEnvironmentTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'create_environment',
        {
            description: [
                'Create a new environment in the current project.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Create Environment',
            },
            inputSchema: CreateEnvironmentArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = CreateEnvironmentArgsSchema.parse(args)
            return await createEnvironmentHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_environment',
        {
            description: [
                'Update an existing environment.',
                '⚠️ IMPORTANT: Environment changes can affect how features are served, including in production.',
                'Always confirm with the user before updating a production environment.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Update Environment',
                destructiveHint: true,
            },
            inputSchema: UpdateEnvironmentArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpdateEnvironmentArgsSchema.parse(args)
            return await updateEnvironmentHandler(validatedArgs, apiClient)
        },
    )
}
