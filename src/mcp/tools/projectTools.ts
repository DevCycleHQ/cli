import { z } from 'zod'
import {
    handleZodiosValidationErrors,
    MISSING_PROJECT_KEY_ERROR,
} from '../utils/api'
import { ProjectScopedArgsSchema } from '../types'
import { fetchProject } from '../../api/projects'
import { fetchEnvironments } from '../../api/environments'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { formatProjectWithEnvironments } from '../utils/projectFormatting'
import { dashboardLinks } from '../utils/dashboardLinks'

export async function getCurrentProjectHandler(
    args: z.infer<typeof ProjectScopedArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'getCurrentProject',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }

            // Fetch the current project details
            const project = await handleZodiosValidationErrors(
                () => fetchProject(authToken, projectKey),
                'fetchProject',
            )

            // Fetch environments for the current project
            const environments = await handleZodiosValidationErrors(
                () => fetchEnvironments(authToken, projectKey),
                'fetchEnvironments',
            )

            return formatProjectWithEnvironments(
                project,
                environments,
                `Current project: '${project.name}' (${project.key}) with ${environments.length} environment(s).`,
            )
        },
        dashboardLinks.project.dashboard,
        false,
    )
}

export function registerProjectTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'get_current_project',
        {
            description: [
                'Get a project, defaulting to the currently selected one.',
                'Only call this tool if you have already selected a project using the select_project tool, or you are passing a projectKey.',
                'Include dashboard link in the response.',
                'Returns the current project, its environments, and SDK keys.',
            ].join('\n'),
            annotations: {
                title: 'Get Current Project',
                readOnlyHint: true,
            },
            inputSchema: ProjectScopedArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs = ProjectScopedArgsSchema.parse(args)
            return await getCurrentProjectHandler(validatedArgs, apiClient)
        },
    )
}
