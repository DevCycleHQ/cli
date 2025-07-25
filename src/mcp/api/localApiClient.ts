import { DevCycleApiClient } from '../utils/api'
import { DevCycleAuth } from '../utils/auth'
import {
    IDevCycleApiClient,
    IAuthContext,
    IApiClientFactory,
    ApiClientConfig,
} from './interface'

/**
 * Local authentication context that wraps DevCycleAuth for the interface abstraction.
 * This maintains compatibility with existing local authentication while providing
 * the standard interface for API clients.
 */
export class LocalAuthContext implements IAuthContext {
    constructor(private auth: DevCycleAuth) {}

    getAuthToken(): string {
        return this.auth.getAuthToken()
    }

    getOrgId(): string {
        return this.auth.getOrgId()
    }

    getProjectKey(): string {
        return this.auth.getProjectKey()
    }

    isAuthenticated(): boolean {
        return this.auth.hasToken()
    }

    hasProject(): boolean {
        try {
            const projectKey = this.auth.getProjectKey()
            return Boolean(projectKey)
        } catch {
            return false
        }
    }

    /**
     * Get the underlying DevCycleAuth instance for direct access when needed
     */
    getAuth(): DevCycleAuth {
        return this.auth
    }
}

/**
 * Local implementation of IDevCycleApiClient that wraps the existing DevCycleApiClient.
 * This adapter allows the existing local authentication and API client logic
 * to work with the new registry pattern while maintaining full backward compatibility.
 */
export class LocalDevCycleApiClient implements IDevCycleApiClient {
    constructor(private apiClient: DevCycleApiClient) {}

    async executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        requiresProject = true,
    ): Promise<T> {
        return await this.apiClient.executeWithLogging(
            operationName,
            args,
            operation,
            requiresProject,
        )
    }

    async executeWithDashboardLink<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        dashboardLink: (orgId: string, projectKey: string, result: T) => string,
    ): Promise<{ result: T; dashboardLink: string }> {
        return await this.apiClient.executeWithDashboardLink(
            operationName,
            args,
            operation,
            dashboardLink,
        )
    }

    /**
     * Get the underlying DevCycleApiClient for cases where direct access is needed
     */
    getApiClient(): DevCycleApiClient {
        return this.apiClient
    }
}

/**
 * Factory for creating local API client instances
 * This provides a standardized way to create API clients for the local environment
 */
export class LocalApiClientFactory implements IApiClientFactory {
    createClient(
        authContext: IAuthContext,
        config?: ApiClientConfig,
    ): IDevCycleApiClient {
        // For local implementation, we ignore the config for now and use existing DevCycleApiClient
        // In the future, we could use the config to customize the local client behavior

        if (authContext instanceof LocalAuthContext) {
            // Use the wrapped DevCycleAuth directly
            const auth = authContext.getAuth()
            const apiClient = new DevCycleApiClient(auth)
            return new LocalDevCycleApiClient(apiClient)
        }

        // If we have a different auth context, we'd need to create a DevCycleAuth wrapper
        // For now, this is not implemented as it's not needed for current use cases
        throw new Error('LocalApiClientFactory only supports LocalAuthContext')
    }
}

/**
 * Convenience function to create a local API client with DevCycleAuth
 */
export function createLocalApiClient(
    auth: DevCycleAuth,
): LocalDevCycleApiClient {
    const apiClient = new DevCycleApiClient(auth)
    return new LocalDevCycleApiClient(apiClient)
}
