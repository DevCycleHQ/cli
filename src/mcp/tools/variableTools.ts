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

export const variableToolDefinitions: Tool[] = [
    {
        name: 'list_variables',
        description: 'List variables in the current project',
        inputSchema: {
            type: 'object',
            properties: {
                search: {
                    type: 'string',
                    description: 'Search query to filter variables',
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
        name: 'create_variable',
        description: 'Create a new variable',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Variable name (1-100 characters)',
                },
                description: {
                    type: 'string',
                    description: 'Variable description (max 1000 characters)',
                },
                key: {
                    type: 'string',
                    description:
                        'Unique variable key (1-100 characters, must match pattern ^[a-z0-9-_.]+$)',
                },
                _feature: {
                    type: 'string',
                    description:
                        'Feature key or ID to associate with this variable',
                },
                type: {
                    type: 'string',
                    enum: ['String', 'Boolean', 'Number', 'JSON'],
                    description: 'Variable type',
                },
                defaultValue: {
                    description: 'Default value for the variable',
                },
                validationSchema: {
                    type: 'object',
                    description: 'Validation schema for variable values',
                    properties: {
                        schemaType: {
                            type: 'string',
                            description: 'Schema type',
                        },
                        enumValues: {
                            type: 'array',
                            description: 'Allowed enum values',
                        },
                        regexPattern: {
                            type: 'string',
                            description: 'Regex pattern for validation',
                        },
                        jsonSchema: {
                            type: 'string',
                            description: 'JSON schema for validation',
                        },
                        description: {
                            type: 'string',
                            description: 'Schema description',
                        },
                        exampleValue: {
                            description: 'Example value for the schema',
                        },
                    },
                },
            },
            required: ['key', 'type'],
        },
    },
    {
        name: 'update_variable',
        description: 'Update an existing variable',
        inputSchema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    description: 'Current variable key',
                },
                name: {
                    type: 'string',
                    description: 'Updated variable name (1-100 characters)',
                },
                description: {
                    type: 'string',
                    description:
                        'Updated variable description (max 1000 characters)',
                },
                type: {
                    type: 'string',
                    enum: ['String', 'Boolean', 'Number', 'JSON'],
                    description: 'Variable type',
                },
                validationSchema: {
                    type: 'object',
                    description: 'Validation schema for variable values',
                    properties: {
                        schemaType: {
                            type: 'string',
                            description: 'Schema type',
                        },
                        enumValues: {
                            type: 'array',
                            description: 'Allowed enum values',
                        },
                        regexPattern: {
                            type: 'string',
                            description: 'Regex pattern for validation',
                        },
                        jsonSchema: {
                            type: 'string',
                            description: 'JSON schema for validation',
                        },
                        description: {
                            type: 'string',
                            description: 'Schema description',
                        },
                        exampleValue: {
                            description: 'Example value for the schema',
                        },
                    },
                },
            },
            required: ['key'],
        },
    },
    {
        name: 'delete_variable',
        description: 'Delete a variable',
        inputSchema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    description: 'Variable key to delete',
                },
            },
            required: ['key'],
        },
    },
]

export const variableToolHandlers: Record<string, ToolHandler> = {
    list_variables: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListVariablesArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'listVariables',
            validatedArgs,
            async (authToken, projectKey) => {
                return await fetchVariables(
                    authToken,
                    projectKey,
                    validatedArgs,
                )
            },
        )
    },
    create_variable: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = CreateVariableArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'createVariable',
            validatedArgs,
            async (authToken, projectKey) => {
                return await createVariable(
                    authToken,
                    projectKey,
                    validatedArgs,
                )
            },
        )
    },
    update_variable: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = UpdateVariableArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
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
        )
    },
    delete_variable: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = DeleteVariableArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'deleteVariable',
            validatedArgs,
            async (authToken, projectKey) => {
                await deleteVariable(authToken, projectKey, validatedArgs.key)
                return {
                    message: `Variable '${validatedArgs.key}' deleted successfully`,
                }
            },
        )
    },
}
