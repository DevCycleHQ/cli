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
            properties: {
                random_string: {
                    type: 'string',
                    description: 'Dummy parameter for no-parameter tools',
                },
            },
            required: ['random_string'],
        },
    },
]

export const projectToolHandlers: Record<string, ToolHandler> = {
    list_projects: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListProjectsArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'listProjects',
            validatedArgs,
            async (authToken, projectKey) => {
                const query: any = {}
                if (validatedArgs.sort_by) query.sortBy = validatedArgs.sort_by
                if (validatedArgs.sort_order)
                    query.sortOrder = validatedArgs.sort_order
                if (validatedArgs.search) query.search = validatedArgs.search
                if (validatedArgs.created_by)
                    query.createdBy = validatedArgs.created_by
                if (validatedArgs.page) query.page = validatedArgs.page
                if (validatedArgs.per_page)
                    query.perPage = validatedArgs.per_page

                return await fetchProjects(authToken, query)
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
            args,
            async (authToken, projectKey) => {
                return await fetchProject(authToken, projectKey)
            },
        )
    },
}
