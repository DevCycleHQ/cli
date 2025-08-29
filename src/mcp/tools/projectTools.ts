import { z } from 'zod'
import { handleZodiosValidationErrors } from '../utils/api'
import {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
} from '../../api/projects'
import { fetchEnvironments } from '../../api/environments'
import {
    ListProjectsArgsSchema,
    CreateProjectArgsSchema,
    UpdateProjectArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { formatProjectWithEnvironments } from '../utils/projectFormatting'
import { dashboardLinks } from '../utils/dashboardLinks'

// Individual handler functions
export async function listProjectsHandler(
    args: z.infer<typeof ListProjectsArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listProjects',
        args,
        async (authToken: string) => {
            return await handleZodiosValidationErrors(
                () => fetchProjects(authToken, args),
                'fetchProjects',
            )
        },
        dashboardLinks.organization.settings,
        false, // Don't require project for listing projects
    )
}

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

export async function createProjectHandler(
    args: z.infer<typeof CreateProjectArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'createProject',
        args,
        async (authToken: string) => {
            return await handleZodiosValidationErrors(
                () => createProject(authToken, args),
                'createProject',
            )
        },
        dashboardLinks.project.dashboard,
    )
}

export async function updateProjectHandler(
    args: z.infer<typeof UpdateProjectArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { key, ...updateParams } = args

    return await apiClient.executeWithDashboardLink(
        'updateProject',
        args,
        async (authToken: string) => {
            return await handleZodiosValidationErrors(
                () => updateProject(authToken, key, updateParams),
                'updateProject',
            )
        },
        dashboardLinks.project.edit,
    )
}

/**
 * Register project tools with the MCP server using the new direct registration pattern
 */
export function registerProjectTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'list_projects',
        {
            description: [
                'List all projects in the current organization.',
                'Can be called before "select_project"',
            ].join('\n'),
            annotations: {
                title: 'List Projects',
                readOnlyHint: true,
            },
            inputSchema: ListProjectsArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs = ListProjectsArgsSchema.parse(args)

            return await listProjectsHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'get_current_project',
        {
            description: [
                'Get the currently selected project.',
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

    // DISABLED: Project creation/update tools
    // serverInstance.registerToolWithErrorHandling(
    //     'create_project',
    //     {
    //         description:
    //             'Create a new project. Include dashboard link in the response.',
    //         annotations: {
    //             title: 'Create Project',
    //         },
    //         inputSchema: CreateProjectArgsSchema.shape,
    //     },
    //     async (args: any) => {
    //         const validatedArgs = CreateProjectArgsSchema.parse(args)

    //         return await createProjectHandler(validatedArgs, apiClient)
    //     },
    // )

    // serverInstance.registerToolWithErrorHandling(
    //     'update_project',
    //     {
    //         description:
    //             'Update an existing project. Include dashboard link in the response.',
    //         annotations: {
    //             title: 'Update Project',
    //         },
    //         inputSchema: UpdateProjectArgsSchema.shape,
    //     },
    //     async (args: any) => {
    //         const validatedArgs = UpdateProjectArgsSchema.parse(args)

    //         return await updateProjectHandler(validatedArgs, apiClient)
    //     },
    // )
}
