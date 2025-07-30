import { z } from 'zod'
import { handleZodiosValidationErrors } from '../utils/api'
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
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'

// Helper function to generate variable dashboard links
const generateVariablesDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
): string => {
    if (!projectKey) {
        throw new Error('Project key is required for variables dashboard link')
    }
    return `https://app.devcycle.com/o/${orgId}/p/${projectKey}/variables`
}

// Individual handler functions
export async function listVariablesHandler(
    args: z.infer<typeof ListVariablesArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listVariables',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error('Project key is required for this operation')
            }
            return await handleZodiosValidationErrors(
                () => fetchVariables(authToken, projectKey, args),
                'fetchVariables',
            )
        },
        generateVariablesDashboardLink,
    )
}

export async function createVariableHandler(
    args: z.infer<typeof CreateVariableArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'createVariable',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error('Project key is required for this operation')
            }
            return await handleZodiosValidationErrors(
                () => createVariable(authToken, projectKey, args),
                'createVariable',
            )
        },
        generateVariablesDashboardLink,
    )
}

export async function updateVariableHandler(
    args: z.infer<typeof UpdateVariableArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { key, ...updateData } = args

    return await apiClient.executeWithDashboardLink(
        'updateVariable',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error('Project key is required for this operation')
            }
            return await handleZodiosValidationErrors(
                () => updateVariable(authToken, projectKey, key, updateData),
                'updateVariable',
            )
        },
        generateVariablesDashboardLink,
    )
}

export async function deleteVariableHandler(
    args: z.infer<typeof DeleteVariableArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'deleteVariable',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error('Project key is required for this operation')
            }
            await handleZodiosValidationErrors(
                () => deleteVariable(authToken, projectKey, args.key),
                'deleteVariable',
            )
            return {
                message: `Variable '${args.key}' deleted successfully`,
            }
        },
        generateVariablesDashboardLink,
    )
}

/**
 * Register variable tools with the MCP server using the new direct registration pattern
 */
export function registerVariableTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'list_variables',
        {
            description:
                'List variables in the current project. Include dashboard link in the response.',
            annotations: {
                title: 'List Variables',
                readOnlyHint: true,
            },
            inputSchema: ListVariablesArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = ListVariablesArgsSchema.parse(args)
            return await listVariablesHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'create_variable',
        {
            description:
                'Create a new variable. Include dashboard link in the response.',
            annotations: {
                title: 'Create Variable',
            },
            inputSchema: CreateVariableArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = CreateVariableArgsSchema.parse(args)
            return await createVariableHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'update_variable',
        {
            description:
                'Update an existing variable. ⚠️ IMPORTANT: Variable changes can affect feature flags in production environments. Always confirm with the user before updating variables for features that are active in production. Include dashboard link in the response.',
            annotations: {
                title: 'Update Variable',
                destructiveHint: true,
            },
            inputSchema: UpdateVariableArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = UpdateVariableArgsSchema.parse(args)
            return await updateVariableHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'delete_variable',
        {
            description:
                'Delete a variable. ⚠️ CRITICAL: Deleting a variable will remove it from ALL environments including production. ALWAYS confirm with the user before deleting any variable. Include dashboard link in the response.',
            annotations: {
                title: 'Delete Variable',
                destructiveHint: true,
            },
            inputSchema: DeleteVariableArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = DeleteVariableArgsSchema.parse(args)
            return await deleteVariableHandler(validatedArgs, apiClient)
        },
    )
}
