import type { UserProps, Env, DevCycleJWTClaims } from './types'
import { IDevCycleApiClient } from '../api/interface'

/**
 * Worker-specific API client implementation that uses OAuth tokens from JWT claims
 * instead of API keys from local configuration files.
 */
export class WorkerApiClient implements IDevCycleApiClient {
    constructor(
        private props: UserProps,
        private env: Env,
    ) {}

    /**
     * Execute an API operation with OAuth token authentication and consistent logging
     */
    async executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        requiresProject: boolean = true,
    ): Promise<T> {
        const authToken = this.getAuthToken()
        const projectKey = requiresProject ? this.getProjectKey() : ''

        console.log(`Worker MCP ${operationName}:`, {
            args,
            userId: this.getUserId(),
            orgId: this.getOrgId(),
            projectKey: requiresProject ? projectKey : 'N/A',
        })

        try {
            const result = await operation(authToken, projectKey)
            console.log(`Worker MCP ${operationName} completed successfully`)
            return result
        } catch (error) {
            console.error(`Worker MCP ${operationName} error:`, {
                error: error instanceof Error ? error.message : String(error),
                args,
                userId: this.getUserId(),
                orgId: this.getOrgId(),
            })
            throw error
        }
    }

    /**
     * Execute an API operation and include dashboard links in the response
     */
    async executeWithDashboardLink<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        dashboardLink: (orgId: string, projectKey: string, result: T) => string,
    ): Promise<{ result: T; dashboardLink: string }> {
        const authToken = this.getAuthToken()
        const projectKey = this.getProjectKey()
        const orgId = this.getOrgId()

        console.log(`Worker MCP ${operationName} (with dashboard link):`, {
            args,
            userId: this.getUserId(),
            orgId,
            projectKey,
        })

        try {
            const result = await operation(authToken, projectKey)
            const link = dashboardLink(orgId, projectKey, result)

            console.log(
                `Worker MCP ${operationName} completed successfully with dashboard link`,
            )

            return {
                result,
                dashboardLink: link,
            }
        } catch (error) {
            console.error(`Worker MCP ${operationName} error:`, {
                error: error instanceof Error ? error.message : String(error),
                args,
                userId: this.getUserId(),
                orgId,
            })
            throw error
        }
    }

    /**
     * Get the OAuth access token for API authentication
     */
    private getAuthToken(): string {
        if (!this.props.tokenSet?.accessToken) {
            throw new Error('No access token available in user props')
        }
        return this.props.tokenSet.accessToken
    }

    /**
     * Get the project key from JWT claims or environment variables
     */
    private getProjectKey(): string {
        const claims = this.props.claims as DevCycleJWTClaims

        // Try from JWT claims first - this allows user-specific project context
        if (claims?.project_key) {
            return claims.project_key
        }

        // Fall back to environment variable for single-project deployments
        if (this.env.DEFAULT_PROJECT_KEY) {
            return this.env.DEFAULT_PROJECT_KEY
        }

        throw new Error(
            'No project key found in JWT claims or environment variables. ' +
                'Either set DEFAULT_PROJECT_KEY in worker environment or include project_key in JWT claims.',
        )
    }

    /**
     * Get the organization ID from JWT claims
     */
    private getOrgId(): string {
        const claims = this.props.claims as DevCycleJWTClaims

        if (claims?.org_id) {
            return claims.org_id
        }

        throw new Error('No organization ID found in JWT claims')
    }

    /**
     * Get the user ID from JWT claims (for logging purposes)
     */
    private getUserId(): string {
        const claims = this.props.claims as DevCycleJWTClaims
        return claims?.sub || claims?.email || 'unknown'
    }

    /**
     * Check if the user has access to the required project
     */
    public hasProjectAccess(projectKey?: string): boolean {
        try {
            const userProjectKey = this.getProjectKey()
            return !projectKey || userProjectKey === projectKey
        } catch {
            return false
        }
    }

    /**
     * Get user context information for debugging
     */
    public getUserContext() {
        const claims = this.props.claims as DevCycleJWTClaims
        return {
            userId: this.getUserId(),
            orgId: this.getOrgId(),
            projectKey: this.getProjectKey(),
            email: claims?.email,
            name: claims?.name,
            hasAccessToken: !!this.props.tokenSet?.accessToken,
            hasRefreshToken: !!this.props.tokenSet?.refreshToken,
        }
    }
}
