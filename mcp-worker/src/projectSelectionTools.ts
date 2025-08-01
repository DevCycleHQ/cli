import { z } from 'zod'
import { handleZodiosValidationErrors } from '../../src/mcp/utils/api'
import { fetchProjects, fetchProject } from '../../src/api/projects'
import { IDevCycleApiClient } from '../../src/mcp/api/interface'
import { DevCycleMCPServerInstance } from '../../src/mcp/server'

// Helper functions to generate dashboard links
const generateProjectDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
): string => {
    if (!projectKey) {
        throw new Error(
            'Project key is required for project dashboard link. Please select a project using the select_project tool first.',
        )
    }
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}`
}

const generateOrganizationProjectsLink = (orgId: string): string => {
    return `https://app.devcycle.com/o/${orgId}/settings/projects`
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const SelectProjectArgsSchema = z.object({
    projectKey: z
        .string()
        .optional()
        .describe(
            'The project key to select (e.g., "jonathans-project"). If not provided, will list all available projects to choose from.',
        ),
})

// =============================================================================
// INDIVIDUAL HANDLER FUNCTIONS
// =============================================================================

export async function selectDevCycleProjectHandler(
    args: z.infer<typeof SelectProjectArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    console.log('select_project validatedArgs: ', args)

    // If no project key provided, list available projects
    const projectKey = args.projectKey
    console.log('select_project projectKey: ', projectKey)

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
                    availableProjects: projects.map((project: any) => ({
                        key: project.key,
                        name: project.name,
                        description: project.description || '',
                    })),
                    message:
                        'Available projects listed. Call this tool again with a project_key to select one.',
                }
            },
            generateOrganizationProjectsLink,
            false, // Don't require project for listing projects
        )
    }

    // Select the specified project
    return await apiClient.executeWithDashboardLink(
        'selectProject',
        args,
        async (authToken: string) => {
            // Fetch the specific project to verify it exists and user has access
            const selectedProject = await handleZodiosValidationErrors(
                () => fetchProject(authToken, projectKey),
                'fetchProject',
            )

            // Set the selected project in storage
            await apiClient.setSelectedProject!(projectKey)

            return {
                selectedProject: {
                    key: selectedProject.key,
                    name: selectedProject.name,
                    description: selectedProject.description || '',
                },
                message: `Project '${selectedProject.name}' (${selectedProject.key}) has been selected for subsequent MCP operations.`,
            }
        },
        (orgId: string) => generateProjectDashboardLink(orgId, args.projectKey),
        false, // Don't require project for selecting a project
    )
}

/**
 * Register project selection tools with the MCP server using the new direct registration pattern
 */
export function registerProjectSelectionTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'select_project',
        {
            description:
                'Select a project to use for subsequent MCP operations. Call without parameters to list available projects, or provide {"projectKey": "your-project-key"} to select a specific project. Include dashboard link in the response.',
            annotations: {
                title: 'Select Project',
            },
            inputSchema: SelectProjectArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = SelectProjectArgsSchema.parse(args)
            return await selectDevCycleProjectHandler(validatedArgs, apiClient)
        },
    )
}
