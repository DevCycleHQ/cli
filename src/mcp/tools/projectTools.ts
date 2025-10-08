import { handleZodiosValidationErrors } from '../utils/api'
import { fetchProject } from '../../api/projects'
import { fetchEnvironments } from '../../api/environments'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { formatProjectWithEnvironments } from '../utils/projectFormatting'
import { dashboardLinks } from '../utils/dashboardLinks'

export async function getCurrentProjectHandler(apiClient: IDevCycleApiClient) {
    return await apiClient.executeWithDashboardLink(
        'getCurrentProject',
        null,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for getting current project. Please select a project using the select_project tool first.',
                )
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
                'Get the currently selected project.',
                'Only call this tool if you have already selected a project using the select_project tool.',
                'Include dashboard link in the response.',
                'Returns the current project, its environments, and SDK keys.',
            ].join('\n'),
            annotations: {
                title: 'Get Current Project',
                readOnlyHint: true,
            },
            inputSchema: {}, // No parameters needed
        },
        async () => {
            return await getCurrentProjectHandler(apiClient)
        },
    )
}
