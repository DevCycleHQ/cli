import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient, handleZodiosValidationErrors } from '../utils/api'
import {
    fetchVariables,
    createVariable,
    updateVariable,
    deleteVariable,
} from '../../api/variables'
import {
    ListVariablesArgsSchema,
    CreateVariableArgsSchema,
    UpdateVariableArgsSchema,
    DeleteVariableArgsSchema,
} from '../types'
import { ToolHandler } from '../server'
import {
    DASHBOARD_LINK_PROPERTY,
    MESSAGE_RESPONSE_SCHEMA,
    VARIABLE_KEY_PROPERTY,
} from './commonSchemas'

// Helper function to generate variable dashboard links
const generateVariablesDashboardLink = (
    orgId: string,
    projectKey: string,
): string => {
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/variables`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================
const VARIABLE_PAGINATION_PROPERTIES = {
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
        description: 'Search query to filter variables',
        minLength: 3,
    },
    feature: {
        type: 'string' as const,
        description: 'Filter by feature',
    },
    type: {
        type: 'string' as const,
        description: 'Filter by variable type',
        enum: ['String', 'Boolean', 'Number', 'JSON'],
    },
    status: {
        type: 'string' as const,
        description: 'Filter by variable status',
        enum: ['active', 'archived'],
    },
}

const VARIABLE_TYPE_PROPERTY = {
    type: 'string' as const,
    enum: ['String', 'Boolean', 'Number', 'JSON'] as const,
    description: 'Variable type',
}

const VALIDATION_SCHEMA_PROPERTY = {
    type: 'object' as const,
    description: 'Validation schema for variable values',
    properties: {
        schemaType: {
            type: 'string' as const,
            description: 'Schema type',
        },
        enumValues: {
            type: 'array' as const,
            description: 'Allowed enum values',
        },
        regexPattern: {
            type: 'string' as const,
            description: 'Regex pattern for validation',
        },
        jsonSchema: {
            type: 'string' as const,
            description: 'JSON schema for validation',
        },
        description: {
            type: 'string' as const,
            description: 'Schema description',
        },
        exampleValue: {
            description: 'Example value for the schema',
        },
    },
}

const VARIABLE_COMMON_PROPERTIES = {
    name: {
        type: 'string' as const,
        description: 'Variable name (1-100 characters)',
    },
    description: {
        type: 'string' as const,
        description: 'Variable description (max 1000 characters)',
    },
    key: {
        type: 'string' as const,
        description:
            'Unique variable key (1-100 characters, must match pattern ^[a-z0-9-_.]+$)',
    },
    _feature: {
        type: 'string' as const,
        description: 'Feature key or ID to associate with this variable',
    },
    type: VARIABLE_TYPE_PROPERTY,
    defaultValue: {
        description: 'Default value for the variable',
    },
    validationSchema: VALIDATION_SCHEMA_PROPERTY,
}

const UPDATE_VARIABLE_PROPERTIES = {
    key: {
        type: 'string' as const,
        description: 'Current variable key',
    },
    name: VARIABLE_COMMON_PROPERTIES.name,
    description: VARIABLE_COMMON_PROPERTIES.description,
    type: VARIABLE_COMMON_PROPERTIES.type,
    validationSchema: VARIABLE_COMMON_PROPERTIES.validationSchema,
}

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

const VARIABLE_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'A DevCycle variable configuration',
    properties: {
        _id: {
            type: 'string' as const,
            description: 'Unique identifier for the variable',
        },
        key: VARIABLE_KEY_PROPERTY,
        name: {
            type: 'string' as const,
            description: 'Display name of the variable',
        },
        description: {
            type: 'string' as const,
            description: 'Optional description of the variable',
        },
        type: {
            type: 'string' as const,
            description: 'Variable type (String, Boolean, Number, JSON)',
        },
        defaultValue: {
            description: 'Default value for the variable',
        },
        _feature: {
            type: 'string' as const,
            description: 'Associated feature ID',
        },
        validationSchema: {
            type: 'object' as const,
            description: 'Validation schema for the variable',
        },
        createdAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the variable was created',
        },
        updatedAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the variable was last updated',
        },
    },
    required: ['_id', 'key', 'name', 'type', 'createdAt', 'updatedAt'],
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const variableToolDefinitions: Tool[] = [
    {
        name: 'list_variables',
        description:
            'List variables in the current project. Include dashboard link in the response.',
        annotations: {
            title: 'List Variables',
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: VARIABLE_PAGINATION_PROPERTIES,
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'array' as const,
                    description: 'Array of variable objects in the project',
                    items: VARIABLE_OBJECT_SCHEMA,
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'create_variable',
        description:
            'Create a new variable. Include dashboard link in the response.',
        annotations: {
            title: 'Create Variable',
        },
        inputSchema: {
            type: 'object',
            properties: VARIABLE_COMMON_PROPERTIES,
            required: ['key', 'type'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: VARIABLE_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'update_variable',
        description:
            'Update an existing variable. ⚠️ IMPORTANT: Variable changes can affect feature flags in production environments. Always confirm with the user before updating variables for features that are active in production. Include dashboard link in the response.',
        annotations: {
            title: 'Update Variable',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: UPDATE_VARIABLE_PROPERTIES,
            required: ['key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: VARIABLE_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'delete_variable',
        description:
            'Delete a variable. ⚠️ CRITICAL: Deleting a variable will remove it from ALL environments including production. ALWAYS confirm with the user before deleting any variable. Include dashboard link in the response.',
        annotations: {
            title: 'Delete Variable',
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                key: VARIABLE_KEY_PROPERTY,
            },
            required: ['key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: MESSAGE_RESPONSE_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
]

export const variableToolHandlers: Record<string, ToolHandler> = {
    list_variables: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListVariablesArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'listVariables',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () => fetchVariables(authToken, projectKey, validatedArgs),
                    'fetchVariables',
                )
            },
            generateVariablesDashboardLink,
        )
    },
    create_variable: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateVariableArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'createVariable',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () => createVariable(authToken, projectKey, validatedArgs),
                    'createVariable',
                )
            },
            generateVariablesDashboardLink,
        )
    },
    update_variable: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = UpdateVariableArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateVariable',
            validatedArgs,
            async (authToken, projectKey) => {
                const { key, ...updateData } = validatedArgs

                return await handleZodiosValidationErrors(
                    () =>
                        updateVariable(authToken, projectKey, key, updateData),
                    'updateVariable',
                )
            },
            generateVariablesDashboardLink,
        )
    },
    delete_variable: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = DeleteVariableArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'deleteVariable',
            validatedArgs,
            async (authToken, projectKey) => {
                await handleZodiosValidationErrors(
                    () =>
                        deleteVariable(
                            authToken,
                            projectKey,
                            validatedArgs.key,
                        ),
                    'deleteVariable',
                )
                return {
                    message: `Variable '${validatedArgs.key}' deleted successfully`,
                }
            },
            generateVariablesDashboardLink,
        )
    },
}
