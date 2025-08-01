import type { UserProps, DevCycleJWTClaims } from './types'
import { IDevCycleApiClient } from '../../dist/mcp/api/interface'

/**
 * Interface for state management - allows McpAgent or other state managers
 */
interface IStateManager {
    state?: { selectedProjectKey?: string }
    setState(newState: { selectedProjectKey?: string }): void
}

/**
 * Worker-specific API client implementation that uses OAuth tokens from JWT claims
 * instead of API keys from local configuration files.
 */
export class WorkerApiClient implements IDevCycleApiClient {
    constructor(
        private props: UserProps,
        private env: Env,
        private stateManager?: IStateManager,
    ) {}

    /**
     * Execute an API operation with OAuth token authentication and consistent logging
     */
    async executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (
            authToken: string,
            projectKey: string | undefined,
        ) => Promise<T>,
        requiresProject: boolean = true,
    ): Promise<T> {
        const authToken = this.getAuthToken()
        const projectKey = await this.getProjectKey()

        if (requiresProject && !projectKey) {
            throw new Error('No project key found')
        }

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
                error: error,
                errorMessage:
                    error instanceof Error ? error.message : String(error),
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
        operation: (
            authToken: string,
            projectKey: string | undefined,
        ) => Promise<T>,
        dashboardLink: (
            orgId: string,
            projectKey: string | undefined,
            result: T,
        ) => string,
    ): Promise<{ result: T; dashboardLink: string }> {
        const authToken = this.getAuthToken()
        const projectKey = await this.getProjectKey()
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
     * Get the project key from McpAgent state first, then fall back to JWT claims
     */
    private async getProjectKey(): Promise<string | undefined> {
        // Priority 1: Check McpAgent state for selected project (if available)
        try {
            if (this.stateManager?.state?.selectedProjectKey) {
                return this.stateManager.state.selectedProjectKey
            }
        } catch (error) {
            console.warn('Failed to access state during getProjectKey:', error)
        }

        // Priority 2: Fall back to JWT claims
        const claims = this.props.claims as DevCycleJWTClaims
        return claims?.project_key
    }

    /**
     * Set the selected project (stored in McpAgent state)
     */
    async setSelectedProject(projectKey: string): Promise<void> {
        if (!this.stateManager) {
            throw new Error(
                'Project selection not available - state management not initialized',
            )
        }

        // Merge with existing state to preserve other state properties
        this.stateManager.setState({
            ...(this.stateManager.state || {}),
            selectedProjectKey: projectKey,
        })
    }

    /**
     * Check if user has a project key available (from storage or JWT claims)
     */
    public async hasProjectKey(): Promise<boolean> {
        try {
            const projectKey = await this.getProjectKey()
            return !!projectKey
        } catch {
            return false
        }
    }

    /**
     * Get the organization ID from JWT claims
     */
    public getOrgId(): string {
        const claims = this.props.claims as DevCycleJWTClaims

        if (claims?.org_id) {
            return claims.org_id
        }

        throw new Error('No organization ID found in JWT claims')
    }

    /**
     * Get the user ID from JWT claims (for logging purposes)
     */
    public getUserId(): string {
        const claims = this.props.claims as DevCycleJWTClaims
        return claims?.sub || claims?.email || 'unknown'
    }

    /**
     * Check if the user has access to the required project
     */
    public async hasProjectAccess(projectKey?: string): Promise<boolean> {
        try {
            const userProjectKey = await this.getProjectKey()
            return !projectKey || userProjectKey === projectKey
        } catch {
            return false
        }
    }

    /**
     * Get user context information for debugging
     */
    public async getUserContext() {
        const claims = this.props.claims as DevCycleJWTClaims

        return {
            userId: this.getUserId(),
            orgId: this.getOrgId(),
            email: claims?.email,
            name: claims?.name,
            hasAccessToken: !!this.props.tokenSet?.accessToken,
            hasRefreshToken: !!this.props.tokenSet?.refreshToken,
        }
    }
}
