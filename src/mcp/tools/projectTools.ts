import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
import {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
} from '../../api/projects'
import {
    ListProjectsArgsSchema,
    CreateProjectArgsSchema,
    UpdateProjectArgsSchema,
} from '../types'
import { ToolHandler } from '../server'

// Helper functions to generate project dashboard links
const generateProjectDashboardLink = (
    orgId: string,
    projectKey: string,
): string => {
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}`
}

const generateOrganizationSettingsLink = (orgId: string): string => {
    return `https://app.devcycle.com/o/${orgId}/settings`
}

const generateEditProjectLink = (orgId: string, projectKey: string): string => {
    return `https://app.devcycle.com/o/${orgId}/settings/p/${projectKey}/details`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const PROJECT_KEY_PROPERTY = {
    type: 'string' as const,
    description: 'The project key (unique, immutable)',
}

const PAGINATION_PROPERTIES = {
    search: {
        type: 'string' as const,
        description: 'Search query to filter projects (minimum 3 characters)',
        minLength: 3,
    },
    page: {
        type: 'number' as const,
        description: 'Page number (default: 1)',
        minimum: 1,
    },
    perPage: {
        type: 'number' as const,
        description: 'Number of items per page (default: 100, max: 1000)',
        minimum: 1,
        maximum: 1000,
    },
    sortBy: {
        type: 'string' as const,
        description: 'Field to sort by (default: createdAt)',
        enum: [
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ] as const,
    },
    sortOrder: {
        type: 'string' as const,
        enum: ['asc', 'desc'] as const,
        description: 'Sort order (default: desc)',
    },
    createdBy: {
        type: 'string' as const,
        description: 'Filter by creator user ID',
    },
}

const PROJECT_COMMON_PROPERTIES = {
    name: {
        type: 'string' as const,
        description: 'Project name',
    },
    description: {
        type: 'string' as const,
        description: 'Project description',
    },
    key: PROJECT_KEY_PROPERTY,
    color: {
        type: 'string' as const,
        description: 'Project color (hex format)',
    },
}

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

const PROJECT_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'A DevCycle project configuration',
    properties: {
        _id: {
            type: 'string' as const,
            description: 'Unique identifier for the project',
        },
        key: PROJECT_KEY_PROPERTY,
        name: {
            type: 'string' as const,
            description: 'Display name of the project',
        },
        description: {
            type: 'string' as const,
            description: 'Optional description of the project',
        },
        color: {
            type: 'string' as const,
            description: 'Color used to represent this project in the UI',
        },
        createdAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the project was created',
        },
        updatedAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the project was last updated',
        },
    },
    required: ['_id', 'key', 'name', 'createdAt', 'updatedAt'],
}

const DASHBOARD_LINK_PROPERTY = {
    type: 'string' as const,
    format: 'uri' as const,
    description: 'URL to view and manage projects in the DevCycle dashboard',
}

// Complete output schema definitions
const PROJECT_OUTPUT_SCHEMA = {
    type: 'object' as const,
    properties: {
        result: PROJECT_OBJECT_SCHEMA,
        dashboardLink: DASHBOARD_LINK_PROPERTY,
    },
    required: ['result', 'dashboardLink'],
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const projectToolDefinitions: Tool[] = [
    {
        name: 'list_projects',
        description:
            'List all projects in the current organization. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: PAGINATION_PROPERTIES,
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'array' as const,
                    description: 'Array of project objects in the organization',
                    items: PROJECT_OBJECT_SCHEMA,
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'get_current_project',
        description:
            'Get the currently selected project. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        outputSchema: PROJECT_OUTPUT_SCHEMA,
    },
    {
        name: 'create_project',
        description:
            'Create a new project. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: PROJECT_COMMON_PROPERTIES,
            required: ['name', 'key'],
        },
        outputSchema: PROJECT_OUTPUT_SCHEMA,
    },
    {
        name: 'update_project',
        description:
            'Update an existing project. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: PROJECT_COMMON_PROPERTIES,
            required: ['key'],
        },
        outputSchema: PROJECT_OUTPUT_SCHEMA,
    },
]

export const projectToolHandlers: Record<string, ToolHandler> = {
    list_projects: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListProjectsArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'listProjects',
            validatedArgs,
            async (authToken) => {
                // projectKey not used for listing all projects
                return await fetchProjects(authToken, validatedArgs)
            },
            generateOrganizationSettingsLink,
        )
    },
    get_current_project: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        return await apiClient.executeWithDashboardLink(
            'getCurrentProject',
            null,
            async (authToken, projectKey) => {
                return await fetchProject(authToken, projectKey)
            },
            generateProjectDashboardLink,
        )
    },
    create_project: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateProjectArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'createProject',
            validatedArgs,
            async (authToken) => {
                // projectKey not used for creating projects
                return await createProject(authToken, validatedArgs)
            },
            generateProjectDashboardLink,
        )
    },
    update_project: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = UpdateProjectArgsSchema.parse(args)
        const { key, ...updateParams } = validatedArgs

        return await apiClient.executeWithDashboardLink(
            'updateProject',
            validatedArgs,
            async (authToken) => {
                // projectKey not used - we use the key from validated args
                return await updateProject(authToken, key, updateParams)
            },
            generateEditProjectLink,
        )
    },
}
