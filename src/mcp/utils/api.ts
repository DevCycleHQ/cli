import { DevCycleAuth } from './auth'

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return String(error)
}

function ensureError(error: unknown): Error {
    if (error instanceof Error) {
        return error
    }
    return new Error(String(error))
}

export class DevCycleApiClient {
    constructor(private auth: DevCycleAuth) {}

    /**
     * Helper method to execute API calls with consistent error handling and logging
     */
    public async executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        requiresProject = true,
    ): Promise<T> {
        console.error(
            `MCP ${operationName} args:`,
            args ? JSON.stringify(args, null, 2) : 'none',
        )

        try {
            this.auth.requireAuth()
            if (requiresProject) {
                this.auth.requireProject()
            }

            const authToken = this.auth.getAuthToken()
            const projectKey = requiresProject ? this.auth.getProjectKey() : ''

            const result = await operation(authToken, projectKey)
            console.error(
                `MCP ${operationName} result:`,
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                `MCP ${operationName} error:`,
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    public getAuth(): DevCycleAuth {
        return this.auth
    }
}
