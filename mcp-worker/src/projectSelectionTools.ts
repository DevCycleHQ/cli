import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { handleZodiosValidationErrors } from '../../src/mcp/utils/api'
import { fetchProjects, fetchProject } from '../../src/api/projects'
// Removed commonSchemas imports - using explicit inline schemas for better MCP compatibility
import { ToolHandler } from '../../src/mcp/server'

// Helper functions to generate dashboard links
const generateProjectDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
): string => {
    if (!projectKey) {
        throw new Error('Project key is required for project dashboard link')
    }
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}`
}

const generateOrganizationProjectsLink = (orgId: string): string => {
    return `https://app.devcycle.com/o/${orgId}/settings/projects`
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const projectSelectionToolDefinitions: Tool[] = [
    {
        name: 'select_devcycle_project',
        description:
            'Select a project to use for subsequent MCP operations. Call without parameters to list available projects, or provide {"projectKey": "your-project-key"} to select a specific project. Include dashboard link in the response.',
        annotations: {
            title: 'Select Project',
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectKey: {
                    type: 'string',
                    // description:
                    //     'The project key to select (e.g., "jonathans-project"). If not provided, will list all available projects to choose from.',
                },
            },
        },
        outputSchema: {
            type: 'object',
            properties: {
                result: {
                    type: 'object',
                    properties: {
                        selectedProject: {
                            type: 'object',
                            description: 'The selected project details',
                            properties: {
                                key: {
                                    type: 'string',
                                    description: 'The project key',
                                },
                                name: {
                                    type: 'string',
                                    description: 'Project name',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Project description',
                                },
                            },
                        },
                        availableProjects: {
                            type: 'array',
                            description:
                                'List of available projects (only shown when no project_key provided)',
                            items: {
                                type: 'object',
                                properties: {
                                    key: {
                                        type: 'string',
                                        description: 'The project key',
                                    },
                                    name: {
                                        type: 'string',
                                        description: 'Project name',
                                    },
                                    description: {
                                        type: 'string',
                                        description: 'Project description',
                                    },
                                },
                            },
                        },
                        message: {
                            type: 'string',
                            description: 'Success or instruction message',
                        },
                    },
                },
                dashboardLink: {
                    type: 'string',
                    format: 'uri',
                    description:
                        'URL to view and manage resources in the DevCycle dashboard',
                },
            },
            required: ['result', 'dashboardLink'],
        },
    },
]

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const SelectProjectArgsSchema = z.object({
    projectKey: z.string().optional(),
})

// =============================================================================
// TOOL HANDLERS
// =============================================================================

export const projectSelectionToolHandlers: Record<string, ToolHandler> = {
    select_devcycle_project: async (args: unknown, apiClient) => {
        const validatedArgs = SelectProjectArgsSchema.parse(args)
        console.log('select_devcycle_project validatedArgs: ', validatedArgs)

        // If no project key provided, list available projects
        const projectKey = validatedArgs.projectKey
        console.log('select_devcycle_project projectKey: ', projectKey)

        if (!projectKey) {
            return await apiClient.executeWithDashboardLink(
                'listProjectsForSelection',
                validatedArgs,
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
            )
        }

        // Select the specified project
        return await apiClient.executeWithDashboardLink(
            'selectProject',
            validatedArgs,
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
            (orgId: string) =>
                generateProjectDashboardLink(orgId, validatedArgs.projectKey),
        )
    },
}
