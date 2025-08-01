import { DevCycleAuth } from './auth'
import { setMCPToolCommand } from './headers'
import { IDevCycleApiClient } from '../api/interface'

/**
 * Utility function to handle Zodios validation errors by extracting response data
 * when HTTP call succeeds (200 OK) but schema validation fails
 */
export async function handleZodiosValidationErrors<T>(
    apiCall: () => Promise<T>,
    operationName?: string,
): Promise<T> {
    try {
        return await apiCall()
    } catch (error) {
        // Check if this is a Zodios validation error with successful HTTP response
        if (
            error instanceof Error &&
            error.message.includes('Zodios: Invalid response') &&
            error.message.includes('status: 200 OK')
        ) {
            if (operationName) {
                console.error(
                    `MCP ${operationName}: Zodios validation failed but HTTP 200 OK - extracting response data`,
                )
            }

            // Extract response data from error object using common patterns
            const errorAny = error as any
            const responseData =
                errorAny.data || // Zodios primary location
                errorAny.response?.data || // Axios standard location
                errorAny.cause?.data || // Alternative nested location
                null

            if (responseData) {
                if (operationName) {
                    console.error(
                        `Successfully extracted response data for ${operationName}`,
                    )
                }
                return responseData
            }

            if (operationName) {
                console.error(
                    `Could not extract response data from Zodios error for ${operationName}`,
                )
            }
        }

        // Re-throw the original error if we can't extract data
        throw error
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message
    }
    if (error && typeof error === 'string') {
        return error
    }
    if (error && typeof error === 'object') {
        return JSON.stringify(error)
    }
    if (error === null) {
        return 'null'
    }
    if (error === undefined) {
        return 'undefined'
    }
    return String(error)
}

export function ensureError(error: unknown): Error {
    if (error instanceof Error) {
        return error
    }
    return new Error(String(error))
}

export class DevCycleApiClient implements IDevCycleApiClient {
    constructor(private auth: DevCycleAuth) {}

    /**
     * Helper method to execute API calls with consistent error handling and logging
     */
    public async executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (
            authToken: string,
            projectKey: string | undefined,
        ) => Promise<T>,
        requiresProject = true,
    ): Promise<T> {
        try {
            this.auth.requireAuth()
            if (requiresProject) {
                this.auth.requireProject()
            }

            // Set the specific MCP tool command in headers before making API calls
            setMCPToolCommand(operationName)

            const authToken = this.auth.getAuthToken()
            const projectKey = requiresProject
                ? this.auth.getProjectKey()
                : undefined
            return await operation(authToken, projectKey)
        } catch (error) {
            console.error(
                `MCP ${operationName} error:`,
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    /**
     * Helper method to execute API calls and include dashboard links in the response
     */
    public async executeWithDashboardLink<T>(
        operationName: string,
        args: any,
        operation: (
            authToken: string,
            projectKey: string | undefined,
        ) => Promise<T>,
        dashboardLink: (
            orgId: string,
            projectKey: string | undefined,
            result: T,
        ) => string,
        requiresProject = true,
    ): Promise<{ result: T; dashboardLink: string }> {
        const result = await this.executeWithLogging(
            operationName,
            args,
            operation,
            requiresProject,
        )

        const organizationId = this.auth.getOrgId()
        const projectKey = requiresProject
            ? this.auth.getProjectKey()
            : undefined
        const link = dashboardLink(organizationId, projectKey, result)

        return {
            result,
            dashboardLink: link,
        }
    }

    public getAuth(): DevCycleAuth {
        return this.auth
    }
}
