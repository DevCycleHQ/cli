import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient } from '../utils/api'
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

const VARIABLE_KEY_PROPERTY = {
    type: 'string' as const,
    description: 'The variable key (unique, immutable)',
}

const PAGINATION_PROPERTIES = {
    search: {
        type: 'string' as const,
        description: 'Search query to filter variables',
    },
    page: {
        type: 'number' as const,
        description: 'Page number (default: 1)',
        minimum: 1,
    },
    per_page: {
        type: 'number' as const,
        description: 'Number of items per page (default: 100, max: 1000)',
        minimum: 1,
        maximum: 1000,
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

const MESSAGE_RESPONSE_SCHEMA = {
    type: 'object' as const,
    description: 'Simple message response',
    properties: {
        message: {
            type: 'string' as const,
            description: 'Response message',
        },
    },
    required: ['message'],
}

const DASHBOARD_LINK_PROPERTY = {
    type: 'string' as const,
    format: 'uri' as const,
    description: 'URL to view and manage variables in the DevCycle dashboard',
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const variableToolDefinitions: Tool[] = [
    {
        name: 'list_variables',
        description:
            'List variables in the current project. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: PAGINATION_PROPERTIES,
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
                return await fetchVariables(
                    authToken,
                    projectKey,
                    validatedArgs,
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
                return await createVariable(
                    authToken,
                    projectKey,
                    validatedArgs,
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

                return await updateVariable(
                    authToken,
                    projectKey,
                    key,
                    updateData,
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
                await deleteVariable(authToken, projectKey, validatedArgs.key)
                return {
                    message: `Variable '${validatedArgs.key}' deleted successfully`,
                }
            },
            generateVariablesDashboardLink,
        )
    },
}
