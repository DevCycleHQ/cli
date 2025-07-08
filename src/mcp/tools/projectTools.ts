import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient, fetchProjects, fetchProject } from '../utils/api'
import { ListProjectsArgsSchema } from '../types'
import { ToolHandler } from '../server'

export const projectToolDefinitions: Tool[] = [
    {
        name: 'list_projects',
        description: 'List all projects in the current organization',
        inputSchema: {
            type: 'object',
            properties: {
                sort_by: {
                    type: 'string',
                    enum: [
                        'createdAt',
                        'updatedAt',
                        'name',
                        'key',
                        'createdBy',
                        'propertyKey',
                    ],
                    description: 'Field to sort by (default: createdAt)',
                },
                sort_order: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order (default: desc)',
                },
                search: {
                    type: 'string',
                    description:
                        'Search query to filter projects (minimum 3 characters)',
                },
                created_by: {
                    type: 'string',
                    description: 'Filter by creator user ID',
                },
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                },
                per_page: {
                    type: 'number',
                    description:
                        'Number of items per page (default: 100, max: 1000)',
                },
            },
        },
    },
    {
        name: 'get_current_project',
        description: 'Get the currently selected project',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
]

export const projectToolHandlers: Record<string, ToolHandler> = {
    list_projects: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListProjectsArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'listProjects',
            validatedArgs,
            async (authToken) => {
                return await fetchProjects(authToken, {
                    sortBy: validatedArgs.sort_by,
                    sortOrder: validatedArgs.sort_order,
                    search: validatedArgs.search,
                    createdBy: validatedArgs.created_by,
                    page: validatedArgs.page,
                    perPage: validatedArgs.per_page,
                })
            },
            false,
        )
    },
    get_current_project: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithLogging(
            'getCurrentProject',
            null,
            async (authToken, projectKey) => {
                return await fetchProject(authToken, projectKey)
            },
        )
    },
}
