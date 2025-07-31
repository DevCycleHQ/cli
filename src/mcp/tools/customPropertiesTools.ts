import { z } from 'zod'
import { handleZodiosValidationErrors } from '../utils/api'
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
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'

// Helper function to generate custom properties dashboard links
const generateCustomPropertiesDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
): string => {
    if (!projectKey) {
        throw new Error(
            'Project key is required for custom properties dashboard link. Please select a project first.',
        )
    }
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/custom-properties`
}

// Individual handler functions
export async function listCustomPropertiesHandler(
    args: z.infer<typeof ListCustomPropertiesArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listCustomProperties',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for listing custom properties. Please select a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchCustomProperties(authToken, projectKey),
                'fetchCustomProperties',
            )
        },
        generateCustomPropertiesDashboardLink,
    )
}

export async function createCustomPropertyHandler(
    args: z.infer<typeof UpsertCustomPropertyArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'createCustomProperty',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for creating custom properties. Please select a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => createCustomProperty(authToken, projectKey, args),
                'createCustomProperty',
            )
        },
        generateCustomPropertiesDashboardLink,
    )
}

export async function updateCustomPropertyHandler(
    args: z.infer<typeof UpdateCustomPropertyArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'updateCustomProperty',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for updating custom properties. Please select a project first.',
                )
            }
            const { key, ...updateData } = args

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
}

export async function deleteCustomPropertyHandler(
    args: z.infer<typeof DeleteCustomPropertyArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'deleteCustomProperty',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for deleting custom properties. Please select a project first.',
                )
            }
            await handleZodiosValidationErrors(
                () => deleteCustomProperty(authToken, projectKey, args.key),
                'deleteCustomProperty',
            )
            return {
                message: `Custom property '${args.key}' deleted successfully`,
            }
        },
        generateCustomPropertiesDashboardLink,
    )
}

/**
 * Register custom properties tools with the MCP server using the new direct registration pattern
 */
export function registerCustomPropertiesTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'list_custom_properties',
        {
            description:
                'List custom properties in the current project. Include dashboard link in the response.',
            annotations: {
                title: 'List Custom Properties',
                readOnlyHint: true,
            },
            inputSchema: ListCustomPropertiesArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = ListCustomPropertiesArgsSchema.parse(args)
            return await listCustomPropertiesHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'create_custom_property',
        {
            description:
                'Create a new custom property. Include dashboard link in the response.',
            annotations: {
                title: 'Create Custom Property',
            },
            inputSchema: UpsertCustomPropertyArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpsertCustomPropertyArgsSchema.parse(args)
            return await createCustomPropertyHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_custom_property',
        {
            description:
                'Update an existing custom property. ⚠️ IMPORTANT: Custom property changes can affect feature flags in production environments. Always confirm with the user before updating custom properties for features that are active in production. Include dashboard link in the response.',
            annotations: {
                title: 'Update Custom Property',
                destructiveHint: true,
            },
            inputSchema: UpdateCustomPropertyArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpdateCustomPropertyArgsSchema.parse(args)
            return await updateCustomPropertyHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'delete_custom_property',
        {
            description:
                'Delete a custom property. ⚠️ CRITICAL: Deleting a custom property will remove it from ALL environments including production. ALWAYS confirm with the user before deleting any custom property. Include dashboard link in the response.',
            annotations: {
                title: 'Delete Custom Property',
                destructiveHint: true,
            },
            inputSchema: DeleteCustomPropertyArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = DeleteCustomPropertyArgsSchema.parse(args)
            return await deleteCustomPropertyHandler(validatedArgs, apiClient)
        },
    )
}
