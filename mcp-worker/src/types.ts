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
        accessTokenTTL: number
        idToken: string
        refreshToken: string
    }
}

// Env interface is now generated in worker-configuration.d.ts

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
}
