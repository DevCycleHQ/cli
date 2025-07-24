import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient, handleZodiosValidationErrors } from '../utils/api'
import {
    fetchCustomProperties,
    createCustomProperty,
    updateCustomProperty,
    deleteCustomProperty,
} from '../../api/customProperties'
import {
    ListCustomPropertiesArgsSchema,
    UpsertCustomPropertyArgsSchema,
    UpdateCustomPropertyArgsSchema,
    DeleteCustomPropertyArgsSchema,
} from '../types'
import { ToolHandler } from '../server'
import {
    DASHBOARD_LINK_PROPERTY,
    MESSAGE_RESPONSE_SCHEMA,
    CUSTOM_PROPERTY_KEY_PROPERTY,
} from './commonSchemas'

// Helper function to generate custom properties dashboard links
const generateCustomPropertiesDashboardLink = (
    orgId: string,
    projectKey: string,
): string => {
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/custom-properties`
}

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const CUSTOM_PROPERTY_PAGINATION_PROPERTIES = {
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
        description: 'Search query to filter custom properties',
        minLength: 3,
    },
    createdBy: {
        type: 'string' as const,
        description: 'Filter by creator',
    },
}

const CUSTOM_PROPERTY_TYPE_PROPERTY = {
    type: 'string' as const,
    enum: ['String', 'Boolean', 'Number'] as const,
    description: 'Custom property type',
}

const CUSTOM_PROPERTY_SCHEMA_PROPERTY = {
    type: 'object' as const,
    description: 'Schema definition for the custom property',
    properties: {
        schemaType: {
            type: 'string' as const,
            enum: ['enum'],
            description: 'Schema type',
        },
        required: {
            type: 'boolean' as const,
            description: 'Whether the property is required',
        },
        enumSchema: {
            type: 'object' as const,
            description: 'Enum schema configuration',
            properties: {
                allowedValues: {
                    type: 'array' as const,
                    description: 'Array of allowed values',
                    items: {
                        type: 'object' as const,
                        properties: {
                            label: {
                                type: 'string' as const,
                                description: 'Display label for the value',
                            },
                            value: {
                                description:
                                    'The actual value (string or number)',
                            },
                        },
                        required: ['label', 'value'],
                    },
                },
                allowAdditionalValues: {
                    type: 'boolean' as const,
                    description:
                        'Whether additional values are allowed beyond the enum',
                },
            },
        },
    },
}

const CUSTOM_PROPERTY_COMMON_PROPERTIES = {
    key: CUSTOM_PROPERTY_KEY_PROPERTY,
    name: {
        type: 'string' as const,
        description: 'Custom property name (max 100 characters)',
        maxLength: 100,
    },
    type: CUSTOM_PROPERTY_TYPE_PROPERTY,
    propertyKey: {
        type: 'string' as const,
        description:
            'Property key used to identify the custom property in user data',
    },
    schema: CUSTOM_PROPERTY_SCHEMA_PROPERTY,
}

// =============================================================================
// OUTPUT SCHEMAS
// =============================================================================

const CUSTOM_PROPERTY_OBJECT_SCHEMA = {
    type: 'object' as const,
    description: 'A DevCycle custom property configuration',
    properties: {
        _id: {
            type: 'string' as const,
            description: 'Unique identifier for the custom property',
        },
        key: CUSTOM_PROPERTY_KEY_PROPERTY,
        name: {
            type: 'string' as const,
            description: 'Display name of the custom property',
        },
        type: {
            type: 'string' as const,
            description: 'Custom property type (String, Boolean, Number)',
        },
        propertyKey: {
            type: 'string' as const,
            description: 'Property key used in user data',
        },
        schema: CUSTOM_PROPERTY_SCHEMA_PROPERTY,
        _project: {
            type: 'string' as const,
            description: 'Associated project ID',
        },
        _createdBy: {
            type: 'string' as const,
            description: 'User who created the custom property',
        },
        createdAt: {
            type: 'string' as const,
            description: 'ISO timestamp when the custom property was created',
        },
        updatedAt: {
            type: 'string' as const,
            description:
                'ISO timestamp when the custom property was last updated',
        },
    },
    required: [
        '_id',
        'key',
        'name',
        'type',
        'propertyKey',
        '_project',
        '_createdBy',
        'createdAt',
        'updatedAt',
    ],
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const customPropertiesToolDefinitions: Tool[] = [
    {
        name: 'list_custom_properties',
        description:
            'List custom properties in the current project. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: CUSTOM_PROPERTY_PAGINATION_PROPERTIES,
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: {
                    type: 'array' as const,
                    description:
                        'Array of custom property objects in the project',
                    items: CUSTOM_PROPERTY_OBJECT_SCHEMA,
                },
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'create_custom_property',
        description:
            'Create a new custom property. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: CUSTOM_PROPERTY_COMMON_PROPERTIES,
            required: ['key', 'name', 'type', 'propertyKey'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: CUSTOM_PROPERTY_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'update_custom_property',
        description:
            'Update an existing custom property. ⚠️ IMPORTANT: Custom property changes can affect feature flags in production environments. Always confirm with the user before updating custom properties for features that are active in production. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: CUSTOM_PROPERTY_COMMON_PROPERTIES,
            required: ['key'],
        },
        outputSchema: {
            type: 'object' as const,
            properties: {
                result: CUSTOM_PROPERTY_OBJECT_SCHEMA,
                dashboardLink: DASHBOARD_LINK_PROPERTY,
            },
            required: ['result', 'dashboardLink'],
        },
    },
    {
        name: 'delete_custom_property',
        description:
            'Delete a custom property. ⚠️ CRITICAL: Deleting a custom property will remove it from ALL environments including production. ALWAYS confirm with the user before deleting any custom property. Include dashboard link in the response.',
        inputSchema: {
            type: 'object',
            properties: {
                key: CUSTOM_PROPERTY_KEY_PROPERTY,
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

export const customPropertiesToolHandlers: Record<string, ToolHandler> = {
    list_custom_properties: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = ListCustomPropertiesArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'listCustomProperties',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () => fetchCustomProperties(authToken, projectKey),
                    'fetchCustomProperties',
                )
            },
            generateCustomPropertiesDashboardLink,
        )
    },
    create_custom_property: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpsertCustomPropertyArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'createCustomProperty',
            validatedArgs,
            async (authToken, projectKey) => {
                return await handleZodiosValidationErrors(
                    () =>
                        createCustomProperty(
                            authToken,
                            projectKey,
                            validatedArgs,
                        ),
                    'createCustomProperty',
                )
            },
            generateCustomPropertiesDashboardLink,
        )
    },
    update_custom_property: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = UpdateCustomPropertyArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'updateCustomProperty',
            validatedArgs,
            async (authToken, projectKey) => {
                const { key, ...updateData } = validatedArgs

                return await handleZodiosValidationErrors(
                    () =>
                        updateCustomProperty(
                            authToken,
                            projectKey,
                            key,
                            updateData,
                        ),
                    'updateCustomProperty',
                )
            },
            generateCustomPropertiesDashboardLink,
        )
    },
    delete_custom_property: async (
        args: unknown,
        apiClient: DevCycleApiClient,
    ) => {
        const validatedArgs = DeleteCustomPropertyArgsSchema.parse(args)

        return await apiClient.executeWithDashboardLink(
            'deleteCustomProperty',
            validatedArgs,
            async (authToken, projectKey) => {
                await handleZodiosValidationErrors(
                    () =>
                        deleteCustomProperty(
                            authToken,
                            projectKey,
                            validatedArgs.key,
                        ),
                    'deleteCustomProperty',
                )
                return {
                    message: `Custom property '${validatedArgs.key}' deleted successfully`,
                }
            },
            generateCustomPropertiesDashboardLink,
        )
    },
}
