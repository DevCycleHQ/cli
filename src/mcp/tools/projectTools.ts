import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { handleZodiosValidationErrors } from '../utils/api'
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
import { DASHBOARD_LINK_PROPERTY, PROJECT_KEY_PROPERTY } from './commonSchemas'
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
    return `https://app.devcycle.com/o/${orgId}/settings/projects/${projectKey}/edit`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

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

const PROJECT_PAGINATION_PROPERTIES = {
    page: {
        type: 'number' as const,
        description: 'Page number',
        minimum: 1,
        default: 1,
    },
    perPage: {
        type: 'number' as const,
        description: 'Items per page',
        minimum: 1,
        maximum: 1000,
        default: 100,
    },
    sortBy: {
        type: 'string' as const,
        description: 'Sort field',
        enum: [
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ],
        default: 'createdAt',
    },
    sortOrder: {
        type: 'string' as const,
        description: 'Sort order',
        enum: ['asc', 'desc'],
        default: 'desc',
    },
    search: {
        type: 'string' as const,
        description: 'Search query to filter results',
    },
    createdBy: {
        type: 'string' as const,
        description: 'Filter by creator',
    },
}

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

const PROJECT_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'Project object details',
    properties: {
        _id: {
            type: 'string' as const,
            description: 'Project MongoDB ID',
        },
        key: PROJECT_KEY_PROPERTY,
        name: {
            type: 'string' as const,
            description: 'Project name',
        },
        description: {
            type: 'string' as const,
            description: 'Project description',
        },
        color: {
            type: 'string' as const,
            description: 'Project color (hex format)',
        },
        createdAt: {
            type: 'string' as const,
            format: 'date-time',
            description: 'Project creation timestamp',
        },
        updatedAt: {
            type: 'string' as const,
            format: 'date-time',
            description: 'Project last update timestamp',
        },
    },
    required: ['_id', 'key', 'name', 'createdAt', 'updatedAt'],
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
        annotations: {
            title: 'List Projects',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: PROJECT_PAGINATION_PROPERTIES,
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
        annotations: {
            title: 'Get Current Project',
            readOnlyHint: true,
        },
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
        outputSchema: PROJECT_OUTPUT_SCHEMA,
    },
    {
        name: 'create_project',
        description:
            'Create a new project. Include dashboard link in the response.',
        annotations: {
            title: 'Create Project',
        },
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
        annotations: {
            title: 'Update Project',
        },
        inputSchema: {
            type: 'object',
            properties: PROJECT_COMMON_PROPERTIES,
            required: ['key'],
        },
        outputSchema: PROJECT_OUTPUT_SCHEMA,
    },
]

// Legacy handlers for backward compatibility
export const projectToolHandlers: Record<string, ToolHandler> = {
    list_projects: async (args: unknown, apiClient) => {
        const validatedArgs = ListProjectsArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'listProjects',
            validatedArgs,
            async (authToken: string) => {
                // projectKey not used for listing all projects
                return await handleZodiosValidationErrors(
                    () => fetchProjects(authToken, validatedArgs),
                    'fetchProjects',
                )
            },
            generateOrganizationSettingsLink,
        )
    },
    get_current_project: async (args: unknown, apiClient) => {
        return await apiClient.executeWithDashboardLink(
            'getCurrentProject',
            null,
            async (authToken: string, projectKey: string) => {
                return await handleZodiosValidationErrors(
                    () => fetchProject(authToken, projectKey),
                    'fetchProject',
                )
            },
            generateProjectDashboardLink,
        )
    },
    create_project: async (args: unknown, apiClient) => {
        const validatedArgs = CreateProjectArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'createProject',
            validatedArgs,
            async (authToken: string) => {
                // projectKey not used for creating projects
                return await handleZodiosValidationErrors(
                    () => createProject(authToken, validatedArgs),
                    'createProject',
                )
            },
            generateProjectDashboardLink,
        )
    },
    update_project: async (args: unknown, apiClient) => {
        const validatedArgs = UpdateProjectArgsSchema.parse(args)
        const { key, ...updateParams } = validatedArgs

        return await apiClient.executeWithDashboardLink(
            'updateProject',
            validatedArgs,
            async (authToken: string) => {
                // projectKey not used - we use the key from validated args
                return await handleZodiosValidationErrors(
                    () => updateProject(authToken, key, updateParams),
                    'updateProject',
                )
            },
            generateEditProjectLink,
        )
    },
}
