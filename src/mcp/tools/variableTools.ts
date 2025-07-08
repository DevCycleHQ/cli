import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { DevCycleApiClient, fetchVariables } from '../utils/api'
import { ListVariablesArgsSchema } from '../types'
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
]

export const variableToolHandlers: Record<string, ToolHandler> = {
    list_variables: async (args: unknown, apiClient: DevCycleApiClient) => {
        const validatedArgs = ListVariablesArgsSchema.parse(args)

        return await apiClient.executeWithLogging(
            'listVariables',
            validatedArgs,
            async (authToken, projectKey) => {
                const query = {
                    search: validatedArgs.search,
                    page: validatedArgs.page,
                    perPage: validatedArgs.per_page,
                }
                return await fetchVariables(authToken, projectKey, query)
            },
        )
    },
}
