import { z } from 'zod'
import { handleZodiosValidationErrors } from '../../src/mcp/utils/api'
import { fetchProjects, fetchProject } from '../../src/api/projects'
import { fetchEnvironments } from '../../src/api/environments'
import { Project, Environment } from '../../src/api/schemas'
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

// Helper function to transform SDK keys to only include key and createdAt
const transformSdkKeys = (sdkKeys: Environment['sdkKeys']) => {
    if (!sdkKeys) return { mobile: [], client: [], server: [] }

    return Object.fromEntries(
        Object.entries(sdkKeys).map(([keyType, keys]) => [
            keyType,
            keys?.map((sdk) => ({
                key: sdk.key,
                createdAt: sdk.createdAt,
            })) || [],
        ]),
    )
}

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
                    availableProjects: projects.map((project: Project) => ({
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

                // Set the selected project in storage
                if (apiClient.setSelectedProject) {
                    await apiClient.setSelectedProject(projectKey)
                }

                return {
                    selectedProject: {
                        key: selectedProject.key,
                        name: selectedProject.name,
                        description: selectedProject.description || '',
                        environments: environments.map((env: Environment) => ({
                            key: env.key,
                            name: env.name,
                            description: env.description || '',
                            color: env.color || '',
                            type: env.type,
                            sdkKeys: transformSdkKeys(env.sdkKeys),
                        })),
                    },
                    message: `Project '${selectedProject.name}' (${selectedProject.key}) has been selected for subsequent MCP operations. Found ${environments.length} environment(s).`,
                }
            },
            (orgId: string) =>
                generateProjectDashboardLink(orgId, args.projectKey),
            false, // Don't require project for selecting a project
        )
    }
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
            description: [
                'Select a project to use for subsequent MCP operations.',
                'Call without parameters to list available projects.',
                'Do not automatically select a project, ask the user which project they want to select.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Select Project',
            },
            inputSchema: SelectProjectArgsSchema,
        },
        async (args: unknown) => {
            const validatedArgs = SelectProjectArgsSchema.parse(args)
            return await selectDevCycleProjectHandler(validatedArgs, apiClient)
        },
    )
}
