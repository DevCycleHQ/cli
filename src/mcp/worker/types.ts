import type { JWTPayload } from 'jose'

/**
 * User properties for Cloudflare Worker MCP implementation
 * Contains OAuth token information and JWT claims from DevCycle/Auth0
 */
export type UserProps = {
    /** JWT claims containing user identity and DevCycle context */
    claims: JWTPayload
    /** OAuth token set for API authentication */
    tokenSet: {
        accessToken: string
        idToken: string
        refreshToken: string
    }
}

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
    // OAuth Provider KV namespace for storing session data
    OAUTH_KV: KVNamespace

    // DevCycle API configuration
    API_BASE_URL?: string
    DEFAULT_PROJECT_KEY?: string

    // Auth0 configuration
    AUTH0_DOMAIN: string
    AUTH0_CLIENT_ID: string
    AUTH0_CLIENT_SECRET: string
    AUTH0_AUDIENCE?: string
    AUTH0_SCOPE?: string

    // Worker configuration
    NODE_ENV?: string

    // AI binding (if needed for future features)
    AI?: any
}

/**
 * Extended JWT claims that may contain DevCycle-specific information
 */
export interface DevCycleJWTClaims extends JWTPayload {
    /** DevCycle organization ID */
    org_id?: string
    /** DevCycle project key (if user has a default project) */
    project_key?: string
    /** User's email */
    email?: string
    /** User's name */
    name?: string
    /** Auth0 subject identifier */
    sub?: string
    /** Audience */
    aud?: string | string[]
    /** Issuer */
    iss?: string
    /** Expiration time */
    exp?: number
    /** Issued at time */
    iat?: number
}
