import { z } from 'zod'
import {
    handleZodiosValidationErrors,
    omitProjectKey,
    MISSING_PROJECT_KEY_ERROR,
} from '../utils/api'
import {
    fetchCustomProperties,
    createCustomProperty,
    updateCustomProperty,
    deleteCustomProperty,
} from '../../api/customProperties'
import {
    ListCustomPropertiesArgsSchema,
    CreateCustomPropertyArgsSchema,
    UpdateCustomPropertyArgsSchema,
    DeleteCustomPropertyArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'
import { dashboardLinks } from '../utils/dashboardLinks'

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
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () =>
                    fetchCustomProperties(
                        authToken,
                        projectKey,
                        omitProjectKey(args),
                    ),
                'fetchCustomProperties',
            )
        },
        dashboardLinks.customProperties.list,
    )
}

export async function createCustomPropertyHandler(
    args: z.infer<typeof CreateCustomPropertyArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'createCustomProperty',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            return await handleZodiosValidationErrors(
                () =>
                    createCustomProperty(
                        authToken,
                        projectKey,
                        omitProjectKey(args),
                    ),
                'createCustomProperty',
            )
        },
        dashboardLinks.customProperties.list,
    )
}

export async function updateCustomPropertyHandler(
    args: z.infer<typeof UpdateCustomPropertyArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { key, ...updateData } = omitProjectKey(args)

    return await apiClient.executeWithDashboardLink(
        'updateCustomProperty',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
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
        dashboardLinks.customProperties.list,
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
                throw new Error(MISSING_PROJECT_KEY_ERROR)
            }
            await handleZodiosValidationErrors(
                () => deleteCustomProperty(authToken, projectKey, args.key),
                'deleteCustomProperty',
            )
            return {
                message: `Custom property '${args.key}' deleted successfully`,
            }
        },
        dashboardLinks.customProperties.list,
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
            description: [
                'List custom properties in the current project.',
                'Custom properties define the custom user data (customData) that audiences and feature targeting rules can target.',
                'Include dashboard link in the response.',
            ].join('\n'),
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
            description: [
                'Create a new custom property.',
                'Custom properties define the custom user data (customData) that audiences and feature targeting rules can target.',
                'Include dashboard link in the response.',
            ].join('\n'),
            annotations: {
                title: 'Create Custom Property',
            },
            inputSchema: CreateCustomPropertyArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = CreateCustomPropertyArgsSchema.parse(args)
            return await createCustomPropertyHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_custom_property',
        {
            description: [
                'Update an existing custom property.',
                '⚠️ IMPORTANT: Custom property changes can affect targeting rules for features active in production environments.',
                'Always confirm with the user before updating a custom property that is in use.',
                'Include dashboard link in the response.',
            ].join('\n'),
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
            description: [
                'Delete a custom property.',
                '⚠️ CRITICAL: Deleting a custom property removes it from ALL environments including production, and can break targeting rules that use it.',
                'ALWAYS confirm with the user before deleting any custom property.',
                'Include dashboard link in the response.',
            ].join('\n'),
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
