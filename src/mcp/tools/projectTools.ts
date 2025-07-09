import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import {
    fetchProjects,
    fetchProject,
    createProject,
    CreateProjectParams,
} from '../../api/projects'
import { ListProjectsArgsSchema, CreateProjectArgsSchema } from '../types'
import { ToolHandler } from '../server'

export const projectToolDefinitions: Tool[] = [
    {
        name: 'list_projects',
        description: 'List all projects in the current organization',
        inputSchema: {
            type: 'object',
            properties: {
                sortBy: {
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
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order (default: desc)',
                },
                search: {
                    type: 'string',
                    description:
                        'Search query to filter projects (minimum 3 characters)',
                },
                createdBy: {
                    type: 'string',
                    description: 'Filter by creator user ID',
                },
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                },
                perPage: {
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
    {
        name: 'create_project',
        description: 'Create a new project',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Project name',
                },
                description: {
                    type: 'string',
                    description: 'Project description',
                },
                key: {
                    type: 'string',
                    description: 'Unique project key',
                },
            },
            required: ['name', 'key'],
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
                return await fetchProjects(authToken, validatedArgs)
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
    create_project: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateProjectArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'createProject',
            validatedArgs,
            async (authToken) => {
                return await createProject(authToken, validatedArgs)
            },
            false,
        )
    },
}
