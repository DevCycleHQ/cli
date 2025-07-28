import { IDevCycleApiClient, IAuthContext } from './interface'

/**
 * Worker implementation of IDevCycleApiClient for Cloudflare Worker environments.
 * This implementation uses OAuth tokens from JWT claims instead of local file system
 * and environment variables for authentication.
 *
 * Note: This is a skeleton implementation for Phase 1.2. Full implementation
 * will be completed in Phase 2 (Cloudflare Worker Implementation).
 */
export class WorkerDevCycleApiClient implements IDevCycleApiClient {
    constructor(private authContext: IAuthContext) {}

    async executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (
            authToken: string,
            projectKey: string | undefined,
        ) => Promise<T>,
        requiresProject = true,
    ): Promise<T> {
        // TODO: Implement Worker-specific logging that works in Cloudflare environment
        // (no console.error, use structured logging for Workers)

        this.validateAuth(requiresProject)

        const authToken = this.authContext.getAuthToken()
        const projectKey =
            requiresProject && this.authContext.hasProject()
                ? this.authContext.getProjectKey()
                : undefined

        try {
            return await operation(authToken, projectKey)
        } catch (error) {
            // TODO: Implement Worker-specific error handling
            // (different from local implementation)
            throw this.wrapError(error, operationName)
        }
    }

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
        const result = await this.executeWithLogging(
            operationName,
            args,
            operation,
        )

        const organizationId = this.authContext.getOrgId()
        const projectKey = this.authContext.hasProject()
            ? this.authContext.getProjectKey()
            : undefined
        const link = dashboardLink(organizationId, projectKey, result)

        return {
            result,
            dashboardLink: link,
        }
    }

    private validateAuth(requiresProject: boolean): void {
        if (!this.authContext.isAuthenticated()) {
            throw new Error('Authentication required for Worker API operations')
        }

        if (requiresProject && !this.authContext.hasProject()) {
            throw new Error('Project context required for this operation')
        }
    }

    private wrapError(error: unknown, operationName: string): Error {
        // TODO: Implement Worker-specific error wrapping
        // Convert errors to structured format suitable for Workers
        if (error instanceof Error) {
            return new Error(
                `Worker API Error in ${operationName}: ${error.message}`,
            )
        }
        return new Error(
            `Worker API Error in ${operationName}: ${String(error)}`,
        )
    }
}

/**
 * Authentication context implementation for Cloudflare Worker environments.
 * This extracts authentication information from OAuth JWT tokens instead of
 * local file system and environment variables.
 */
export class WorkerAuthContext implements IAuthContext {
    constructor(
        private jwtClaims: Record<string, any>,
        private projectKey?: string,
    ) {}

    getAuthToken(): string {
        // TODO: Extract or exchange JWT for DevCycle API token
        // This will be implemented in Phase 2
        const token =
            this.jwtClaims.devcycle_token || this.jwtClaims.access_token
        if (!token) {
            throw new Error('No DevCycle token found in JWT claims')
        }
        return token
    }

    getOrgId(): string {
        // TODO: Extract organization ID from JWT claims
        // This will be implemented in Phase 2
        const orgId = this.jwtClaims.org_id || this.jwtClaims.organization_id
        if (!orgId) {
            throw new Error('No organization ID found in JWT claims')
        }
        return orgId
    }

    getProjectKey(): string {
        if (!this.projectKey) {
            throw new Error('No project key configured for Worker context')
        }
        return this.projectKey
    }

    isAuthenticated(): boolean {
        try {
            this.getAuthToken()
            this.getOrgId()
            return true
        } catch {
            return false
        }
    }

    hasProject(): boolean {
        return Boolean(this.projectKey)
    }

    /**
     * Set the project key for this auth context
     * In the Worker environment, this might be set based on the MCP session
     */
    setProjectKey(projectKey: string): void {
        this.projectKey = projectKey
    }
}

/**
 * Factory for creating Worker API client instances
 */
export class WorkerApiClientFactory {
    /**
     * Create a Worker API client from JWT claims
     */
    static fromJwtClaims(
        jwtClaims: Record<string, any>,
        projectKey?: string,
    ): WorkerDevCycleApiClient {
        const authContext = new WorkerAuthContext(jwtClaims, projectKey)
        return new WorkerDevCycleApiClient(authContext)
    }
}
