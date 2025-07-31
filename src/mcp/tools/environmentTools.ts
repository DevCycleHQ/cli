import { z } from 'zod'
import { handleZodiosValidationErrors } from '../utils/api'
import {
    fetchEnvironments,
    fetchEnvironmentByKey,
    createEnvironment,
    updateEnvironment,
} from '../../api/environments'
import {
    GetSdkKeysArgsSchema,
    ListEnvironmentsArgsSchema,
    CreateEnvironmentArgsSchema,
    UpdateEnvironmentArgsSchema,
} from '../types'
import { IDevCycleApiClient } from '../api/interface'
import { DevCycleMCPServerInstance } from '../server'

// Helper function to generate environment dashboard links
const generateEnvironmentDashboardLink = (
    orgId: string,
    projectKey: string | undefined,
): string => {
    if (!projectKey) {
        throw new Error(
            'Project key is required for environment dashboard link. Please select a project using the selecting a project first.',
        )
    }
    return `https://app.devcycle.com/o/${orgId}/settings/p/${projectKey}/environments`
}

// Individual handler functions
export async function listEnvironmentsHandler(
    args: z.infer<typeof ListEnvironmentsArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'listEnvironments',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for listing environments. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => fetchEnvironments(authToken, projectKey),
                'listEnvironments',
            )
        },
        generateEnvironmentDashboardLink,
    )
}

export async function getSdkKeysHandler(
    args: z.infer<typeof GetSdkKeysArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'getSdkKeys',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for getting SDK keys. Please select a project using the selecting a project first.',
                )
            }
            const environment = await handleZodiosValidationErrors(
                () =>
                    fetchEnvironmentByKey(
                        authToken,
                        projectKey,
                        args.environmentKey,
                    ),
                'fetchEnvironmentByKey',
            )

            const sdkKeys = environment.sdkKeys

            if (args.keyType) {
                return {
                    [args.keyType]: sdkKeys[args.keyType],
                }
            } else {
                return {
                    mobile: sdkKeys.mobile,
                    server: sdkKeys.server,
                    client: sdkKeys.client,
                }
            }
        },
        generateEnvironmentDashboardLink,
    )
}

export async function createEnvironmentHandler(
    args: z.infer<typeof CreateEnvironmentArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    return await apiClient.executeWithDashboardLink(
        'createEnvironment',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for creating environments. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () => createEnvironment(authToken, projectKey, args),
                'createEnvironment',
            )
        },
        generateEnvironmentDashboardLink,
    )
}

export async function updateEnvironmentHandler(
    args: z.infer<typeof UpdateEnvironmentArgsSchema>,
    apiClient: IDevCycleApiClient,
) {
    const { key, ...updateParams } = args

    return await apiClient.executeWithDashboardLink(
        'updateEnvironment',
        args,
        async (authToken: string, projectKey: string | undefined) => {
            if (!projectKey) {
                throw new Error(
                    'Project key is required for updating environments. Please select a project using the selecting a project first.',
                )
            }
            return await handleZodiosValidationErrors(
                () =>
                    updateEnvironment(authToken, projectKey, key, updateParams),
                'updateEnvironment',
            )
        },
        generateEnvironmentDashboardLink,
    )
}

/**
 * Register environment tools with the MCP server using the new direct registration pattern
 */
export function registerEnvironmentTools(
    serverInstance: DevCycleMCPServerInstance,
    apiClient: IDevCycleApiClient,
): void {
    serverInstance.registerToolWithErrorHandling(
        'list_environments',
        {
            description:
                'List environments in the current project. Include dashboard link in the response.',
            annotations: {
                title: 'List Environments',
                readOnlyHint: true,
            },
            inputSchema: ListEnvironmentsArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = ListEnvironmentsArgsSchema.parse(args)
            return await listEnvironmentsHandler(validatedArgs, apiClient)
        },
    )

    serverInstance.registerToolWithErrorHandling(
        'get_sdk_keys',
        {
            description:
                'Get SDK keys for an environment. Include dashboard link in the response.',
            annotations: {
                title: 'Get SDK Keys',
                readOnlyHint: true,
            },
            inputSchema: GetSdkKeysArgsSchema.shape,
        },
        async (args: any) => {
            const validatedArgs = GetSdkKeysArgsSchema.parse(args)
            return await getSdkKeysHandler(validatedArgs, apiClient)
        },
    )

    // DISABLED: Environment creation/update tools
    // serverInstance.registerToolWithErrorHandling(
    //     'create_environment',
    //     {
    //         description:
    //             'Create a new environment. Include dashboard link in the response.',
    //         annotations: {
    //             title: 'Create Environment',
    //         },
    //         inputSchema: CreateEnvironmentArgsSchema.shape,
    //     },
    //     async (args: any) => {
    //         const validatedArgs = CreateEnvironmentArgsSchema.parse(args)
    //         return await createEnvironmentHandler(validatedArgs, apiClient)
    //     },
    // )

    // serverInstance.registerToolWithErrorHandling(
    //     'update_environment',
    //     {
    //         description:
    //             'Update an existing environment. Include dashboard link in the response.',
    //         annotations: {
    //             title: 'Update Environment',
    //         },
    //         inputSchema: UpdateEnvironmentArgsSchema.shape,
    //     },
    //     async (args: any) => {
    //         const validatedArgs = UpdateEnvironmentArgsSchema.parse(args)
    //         return await updateEnvironmentHandler(validatedArgs, apiClient)
    //     },
    // )
}
