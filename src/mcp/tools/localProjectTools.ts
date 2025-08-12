import { z } from 'zod'
import { handleZodiosValidationErrors } from '../utils/api'
import { fetchProjects, fetchProject } from '../../api/projects'
import { fetchEnvironments } from '../../api/environments'
import { Project } from '../../api/schemas'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { formatProjectWithEnvironments } from '../utils/projectFormatting'
import { DevCycleAuth } from '../utils/auth'
import { dashboardLinks } from '../utils/dashboardLinks'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const SelectProjectArgsSchema = z.object({
    projectKey: z
        .string()
        .optional()
        .describe(
            'The project key to select. If not provided, will list all available projects to choose from.',
        ),
})

// =============================================================================
// INDIVIDUAL HANDLER FUNCTIONS
// =============================================================================

export async function selectDevCycleProjectHandler(
    args: z.infer<typeof SelectProjectArgsSchema>,
    apiClient: IDevCycleApiClient,
    auth: DevCycleAuth,
) {
    // If no project key provided, list available projects
    const projectKey = args.projectKey

    if (!projectKey) {
        return await apiClient.executeWithDashboardLink(
            'listProjectsForSelection',
            args,
            async (authToken: string) => {
                const projects = await handleZodiosValidationErrors(
                    () =>
                        fetchProjects(authToken, {
                            page: 1,
                            perPage: 100,
                            sortBy: 'name',
                            sortOrder: 'asc',
                        }),
                    'fetchProjects',
                )

                return {
                    availableProjects: projects.map((project: Project) => ({
                        key: project.key,
                        name: project.name,
                        description: project.description || '',
                    })),
                    message:
                        'Available projects listed. Call this tool again with a projectKey to select one.',
                }
            },
            dashboardLinks.project.list,
            false, // Don't require project for listing projects
        )
    } else {
        // Select the specified project
        return await apiClient.executeWithDashboardLink(
            'selectProject',
            args,
            async (authToken: string) => {
                // Fetch the specific project to verify it exists and user has access
                const selectedProject = await handleZodiosValidationErrors(
                    () => fetchProject(authToken, projectKey),
                    'selectProject.fetchProject',
                )

                // Fetch environments for the selected project
                const environments = await handleZodiosValidationErrors(
                    () => fetchEnvironments(authToken, projectKey),
                    'selectProject.fetchEnvironments',
                )

                // Set the selected project in the local auth instance
                await auth.setSelectedProject(projectKey)

                return formatProjectWithEnvironments(
                    selectedProject,
                    environments,
                    `Project '${selectedProject.name}' (${selectedProject.key}) has been selected for subsequent MCP operations. Found ${environments.length} environment(s). Configuration saved to ~/.config/devcycle/user.yml`,
                )
            },
            (orgId: string) =>
                dashboardLinks.project.dashboard(orgId, args.projectKey),
            false, // Don't require project for selecting a project
        )
    }
}

/**
 * Register local project selection tools with the MCP server
 * This is only used by the local MCP implementation, not the worker
 */
export function registerLocalProjectTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
    auth: DevCycleAuth,
): void {
    serverInstance.registerToolWithErrorHandling(
        'select_project',
        {
            description: [
                'Select a project to use for subsequent MCP operations.',
                'Call without parameters to list available projects.',
                'Do not automatically select a project, ask the user which project they want to select.',
                'This will update your local DevCycle configuration (~/.config/devcycle/user.yml).',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Select Project',
            },
            inputSchema: SelectProjectArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs = SelectProjectArgsSchema.parse(args)
            return await selectDevCycleProjectHandler(
                validatedArgs,
                apiClient,
                auth,
            )
        },
    )
}
