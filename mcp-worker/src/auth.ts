import * as oauth from 'oauth4webapi'
import { Hono } from 'hono'
import type { UserProps, Env, DevCycleJWTClaims } from './types'

// Define OAuth parameter types locally since they're not exported correctly
type AuthorizeParams = Record<string, any>
type CallbackParams = Record<string, any>
type ConsentParams = Record<string, any>

// OAuth callback function type
type TokenExchangeCallbackFunction = (options: any) => Promise<any>

/**
 * Get OIDC configuration for Auth0
 */
async function getOidcConfig(options: {
    client_id: string
    client_secret: string
    issuer: string
}) {
    const as = await oauth
        .discoveryRequest(new URL(options.issuer))
        .then((response) =>
            oauth.processDiscoveryResponse(new URL(options.issuer), response),
        )

    const client: oauth.Client = {
        client_id: options.client_id,
        token_endpoint_auth_method: 'client_secret_basic',
    }

    const clientAuth = oauth.ClientSecretBasic(options.client_secret)

    return { as, client, clientAuth }
}

/**
 * Parse JWT token to extract claims
 */
function parseJWT(token: string): DevCycleJWTClaims {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format')
        }

        const payload = parts[1]
        const decoded = JSON.parse(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
        )
        return decoded as DevCycleJWTClaims
    } catch (error) {
        throw new Error(`Failed to parse JWT: ${error}`)
    }
}

/**
 * Token Exchange Callback
 *
 * Handles the token exchange process for OAuth authentication with DevCycle/Auth0.
 * This function processes both authorization code and refresh token flows.
 */
export const tokenExchangeCallback: TokenExchangeCallbackFunction = async (
    options: any,
) => {
    const { grantType, env, props } = options

    // During the Authorization Code Exchange, preserve token TTL from Auth0
    if (grantType === 'authorization_code') {
        const idToken = props?.tokenSet?.idToken
        if (!idToken) {
            throw new Error('No ID token received from Auth0')
        }

        // Extract claims from the ID token
        const claims = parseJWT(idToken)

        // Validate that we have the necessary DevCycle context
        if (!claims.org_id) {
            throw new Error(
                'DevCycle organization ID not found in token claims',
            )
        }

        return {
            accessTokenTTL: props.tokenSet.accessTokenTTL,
            newProps: {
                claims,
                tokenSet: {
                    accessToken: props.tokenSet.accessToken,
                    idToken: props.tokenSet.idToken,
                    refreshToken: props.tokenSet.refreshToken || '',
                },
            } as UserProps,
        }
    }

    // Handle refresh token flow
    if (grantType === 'refresh_token') {
        const auth0RefreshToken = props?.tokenSet?.refreshToken
        if (!auth0RefreshToken) {
            throw new Error('No Auth0 refresh token found')
        }

        const { as, client, clientAuth } = await getOidcConfig({
            client_id: env.AUTH0_CLIENT_ID,
            client_secret: env.AUTH0_CLIENT_SECRET,
            issuer: `https://${env.AUTH0_DOMAIN}/`,
        })

        // Perform the refresh token exchange with Auth0
        const response = await oauth.refreshTokenGrantRequest(
            as,
            client,
            clientAuth,
            auth0RefreshToken,
        )
        const refreshTokenResponse = await oauth.processRefreshTokenResponse(
            as,
            client,
            response,
        )

        // Extract claims from the new ID token
        let claims: DevCycleJWTClaims
        if (refreshTokenResponse.id_token) {
            claims = parseJWT(refreshTokenResponse.id_token)
        } else {
            // Fall back to existing claims if no new ID token
            claims = props.claims as DevCycleJWTClaims
        }

        // Return updated token set and claims
        return {
            accessTokenTTL: refreshTokenResponse.expires_in,
            newProps: {
                claims,
                tokenSet: {
                    accessToken: refreshTokenResponse.access_token,
                    idToken:
                        refreshTokenResponse.id_token || props.tokenSet.idToken,
                    refreshToken:
                        refreshTokenResponse.refresh_token || auth0RefreshToken,
                },
            } as UserProps,
        }
    }

    // For other grant types, no special handling needed
    return undefined
}

/**
 * Authorization endpoint handler
 * Initiates the OAuth flow with DevCycle/Auth0
 */
export async function authorize(c: any): Promise<Response> {
    const params = c.req.query() as AuthorizeParams

    // Add DevCycle-specific scopes if not already present
    const defaultScopes = ['openid', 'profile', 'email', 'offline_access']
    const requestedScopes = params.scope?.split(' ') || []
    const allScopes = [...new Set([...defaultScopes, ...requestedScopes])]

    // Forward to the OAuth provider with enhanced scopes
    return c.env.OAUTH_PROVIDER.authorize({
        ...params,
        scope: allScopes.join(' '),
    })
}

/**
 * OAuth callback handler
 * Processes the callback from Auth0 after user authentication
 */
export async function callback(c: any): Promise<Response> {
    const params = c.req.query() as CallbackParams
    return c.env.OAUTH_PROVIDER.callback(params)
}

/**
 * Consent confirmation handler
 * Handles user consent for the OAuth flow
 */
export async function confirmConsent(c: any): Promise<Response> {
    const formData = await c.req.formData()
    const params = Object.fromEntries(formData.entries()) as ConsentParams
    return c.env.OAUTH_PROVIDER.confirmConsent(params)
}

/**
 * Health check endpoint
 */
export function healthCheck() {
    return new Response(
        JSON.stringify({
            status: 'ok',
            service: 'DevCycle MCP Server',
            timestamp: new Date().toISOString(),
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        },
    )
}

/**
 * Create the Hono app with OAuth routes
 */
export function createAuthApp(): Hono<{ Bindings: Env }> {
    const app = new Hono<{ Bindings: Env }>()

    // OAuth flow endpoints
    app.get('/authorize', authorize)
    app.post('/authorize/consent', confirmConsent)
    app.get('/callback', callback)

    // Health check
    app.get('/health', () => healthCheck())

    // Info endpoint for debugging
    app.get('/info', (c) => {
        return c.json({
            service: 'DevCycle MCP Server',
            version: '1.0.0',
            auth0Domain: c.env.AUTH0_DOMAIN,
            apiBaseUrl: c.env.API_BASE_URL || 'https://api.devcycle.com',
        })
    })

    return app
}
