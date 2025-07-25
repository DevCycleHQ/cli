/**
 * API Client Interface Abstraction for DevCycle MCP
 *
 * This module provides interface abstractions that allow different API client implementations
 * for local (stdio) and remote (Worker) MCP server contexts. The local implementation uses
 * file system and environment variables for authentication, while the Worker implementation
 * uses OAuth tokens from JWT claims.
 */

/**
 * Core API client interface that abstracts away authentication and execution details.
 * This allows the same tool implementations to work with different authentication strategies:
 * - Local: API keys and config files (DevCycleAuth)
 * - Worker: OAuth tokens from JWT claims
 */
export interface IDevCycleApiClient {
    /**
     * Execute an API operation with consistent logging and error handling
     * @param operationName - Name of the operation for logging purposes
     * @param args - Arguments passed to the operation
     * @param operation - The actual API operation function
     * @param requiresProject - Whether this operation requires a project context (default: true)
     */
    executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        requiresProject?: boolean,
    ): Promise<T>

    /**
     * Execute an API operation and include dashboard links in the response
     * @param operationName - Name of the operation for logging purposes
     * @param args - Arguments passed to the operation
     * @param operation - The actual API operation function
     * @param dashboardLink - Function to generate dashboard link from result
     */
    executeWithDashboardLink<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        dashboardLink: (orgId: string, projectKey: string, result: T) => string,
    ): Promise<{ result: T; dashboardLink: string }>
}

/**
 * Authentication context for API operations
 * This interface abstracts the different ways authentication can be provided
 */
export interface IAuthContext {
    /** The authentication token to use for API calls */
    getAuthToken(): string
    /** The organization ID for the current context */
    getOrgId(): string
    /** The project key for the current context (optional for some operations) */
    getProjectKey(): string
    /** Check if authentication is available */
    isAuthenticated(): boolean
    /** Check if project context is available */
    hasProject(): boolean
}

/**
 * Configuration for creating API client instances
 */
export interface ApiClientConfig {
    /** Base URL for the DevCycle API (defaults to production) */
    baseUrl?: string
    /** Additional headers to include with all requests */
    headers?: Record<string, string>
    /** Request timeout in milliseconds */
    timeout?: number
    /** Whether to enable debug logging */
    debug?: boolean
}

/**
 * Factory interface for creating API client instances
 * This allows different implementations for local vs Worker contexts
 */
export interface IApiClientFactory {
    /**
     * Create an API client instance with the provided authentication context
     */
    createClient(
        authContext: IAuthContext,
        config?: ApiClientConfig,
    ): IDevCycleApiClient
}

/**
 * Error types that can be thrown by API operations
 */
export enum ApiErrorType {
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    SCHEMA_VALIDATION_ERROR = 'SCHEMA_VALIDATION_ERROR',
    PROJECT_ERROR = 'PROJECT_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured error information for API operations
 */
export interface ApiError {
    type: ApiErrorType
    message: string
    operation?: string
    statusCode?: number
    suggestions?: string[]
    timestamp?: string
}

/**
 * Result wrapper for API operations that may fail
 */
export type ApiResult<T> =
    | {
          success: true
          data: T
      }
    | {
          success: false
          error: ApiError
      }

/**
 * Utility type for dashboard link generator functions
 */
export type DashboardLinkGenerator<T = any> = (
    orgId: string,
    projectKey: string,
    result: T,
) => string
