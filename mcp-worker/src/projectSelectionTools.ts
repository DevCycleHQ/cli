import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { handleZodiosValidationErrors } from '../../src/mcp/utils/api'
import { fetchProjects, fetchProject } from '../../src/api/projects'
import {
    DASHBOARD_LINK_PROPERTY,
    PROJECT_KEY_PROPERTY,
} from '../../src/mcp/tools/commonSchemas'
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
            'Select a project to use for subsequent MCP operations. If no project_key is provided, lists all available projects. Include dashboard link in the response.',
        annotations: {
            title: 'Select Project',
        },
        inputSchema: {
            type: 'object',
            properties: {
                project_key: {
                    ...PROJECT_KEY_PROPERTY,
                    description:
                        'The project key to select. If not provided, will list all available projects to choose from.',
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
                                key: PROJECT_KEY_PROPERTY,
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
                                    key: PROJECT_KEY_PROPERTY,
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
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
]

// =============================================================================
// TOOL HANDLERS
// =============================================================================

export const projectSelectionToolHandlers: Record<string, ToolHandler> = {
    select_devcycle_project: async (args: unknown, apiClient) => {
        const validatedArgs = args as { project_key?: string }

        // If no project key provided, list available projects
        const projectKey = validatedArgs.project_key
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
                if (apiClient.setSelectedProject) {
                    await apiClient.setSelectedProject(projectKey)
                } else {
                    throw new Error(
                        'Project selection not supported in this environment',
                    )
                }

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
                generateProjectDashboardLink(orgId, validatedArgs.project_key),
        )
    },
}
