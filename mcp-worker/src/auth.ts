// Import removed - using env parameter instead
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import * as oauth from 'oauth4webapi'
import type { UserProps } from './types'
import { OAuthHelpers } from '@cloudflare/workers-oauth-provider'
import type {
    AuthRequest,
    TokenExchangeCallbackOptions,
    TokenExchangeCallbackResult,
} from '@cloudflare/workers-oauth-provider'
import { renderConsentScreen } from './consentScreen'

type Auth0AuthRequest = {
    mcpAuthRequest: AuthRequest
    codeVerifier: string
    codeChallenge: string
    nonce: string
    transactionState: string
    consentToken: string
}

export async function getOidcConfig({
    issuer,
    client_id,
    client_secret,
}: {
    issuer: string
    client_id: string
    client_secret: string
}) {
    // Validate required parameters
    if (!issuer) {
        throw new Error('AUTH0_DOMAIN is required but not set')
    }
    if (!client_id) {
        throw new Error('AUTH0_CLIENT_ID is required but not set')
    }
    if (!client_secret) {
        throw new Error('AUTH0_CLIENT_SECRET is required but not set')
    }

    const response = await oauth.discoveryRequest(new URL(issuer), {
        algorithm: 'oidc',
    })
    const as = await oauth.processDiscoveryResponse(new URL(issuer), response)
    const client: oauth.Client = { client_id }
    const clientAuth = oauth.ClientSecretPost(client_secret)
    return { as, client, clientAuth }
}

/**
 * OAuth Authorization Endpoint
 *
 * This route initiates the Authorization Code Flow when a user wants to log in.
 * It creates a random state parameter to prevent CSRF attacks and stores the
 * original request information in a state-specific cookie for later retrieval.
 * Then it shows a consent screen before redirecting to Auth0.
 */
export async function authorize(
    c: any & { env: Env & { OAUTH_PROVIDER: OAuthHelpers } },
) {
    const mcpClientAuthRequest = await c.env.OAUTH_PROVIDER.parseAuthRequest(
        c.req.raw,
    )
    if (!mcpClientAuthRequest.clientId) {
        return c.text('Invalid request', 400)
    }

    const client = await c.env.OAUTH_PROVIDER.lookupClient(
        mcpClientAuthRequest.clientId,
    )
    if (!client) {
        return c.text('Invalid client', 400)
    }

    // Generate all that is needed for the Auth0 auth request
    const codeVerifier = oauth.generateRandomCodeVerifier()
    const transactionState = oauth.generateRandomState()
    const consentToken = oauth.generateRandomState() // For CSRF protection on consent form

    // We will persist everything in a cookie.
    const auth0AuthRequest: Auth0AuthRequest = {
        codeChallenge: await oauth.calculatePKCECodeChallenge(codeVerifier),
        codeVerifier,
        consentToken,
        mcpAuthRequest: mcpClientAuthRequest,
        nonce: oauth.generateRandomNonce(),
        transactionState,
    }

    // Store the auth request in a transaction-specific cookie
    const cookieName = `auth0_req_${transactionState}`
    setCookie(c, cookieName, btoa(JSON.stringify(auth0AuthRequest)), {
        httpOnly: true,
        maxAge: 60 * 60 * 1, // 1 hour
        path: '/',
        sameSite: c.env.NODE_ENV !== 'development' ? 'none' : 'lax',
        secure: c.env.NODE_ENV !== 'development',
    })

    // Extract client information for the consent screen
    const clientName = client.clientName || client.clientId
    const clientLogo = client.logoUri || '' // No default logo
    const clientUri = client.clientUri || '#'
    const requestedScopes = (c.env.AUTH0_SCOPE || '').split(' ')

    // Render the consent screen with CSRF protection
    return c.html(
        renderConsentScreen({
            clientLogo,
            clientName,
            clientUri,
            consentToken,
            redirectUri: mcpClientAuthRequest.redirectUri,
            requestedScopes,
            transactionState,
        }),
    )
}

/**
 * Consent Confirmation Endpoint
 *
 * This route handles the consent confirmation before redirecting to Auth0
 */
export async function confirmConsent(c: any) {
    // Get form data
    const formData = await c.req.formData()

    const transactionState = formData.get('transaction_state') as string
    const consentToken = formData.get('consent_token') as string
    const consentAction = formData.get('consent_action') as string

    // Validate the transaction state
    if (!transactionState) {
        return c.text('Invalid transaction state', 400)
    }

    // Get the transaction-specific cookie
    const cookieName = `auth0_req_${transactionState}`
    const auth0AuthRequestCookie = getCookie(c, cookieName)
    if (!auth0AuthRequestCookie) {
        return c.text('Invalid or expired transaction', 400)
    }

    // Parse the Auth0 auth request from the cookie
    const auth0AuthRequest = JSON.parse(
        atob(auth0AuthRequestCookie),
    ) as Auth0AuthRequest

    // Validate the CSRF token
    if (auth0AuthRequest.consentToken !== consentToken) {
        return c.text('Invalid consent token', 403)
    }

    // Handle user denial
    if (consentAction !== 'approve') {
        // Parse the MCP client auth request to get the original redirect URI
        const redirectUri = new URL(auth0AuthRequest.mcpAuthRequest.redirectUri)

        // Add error parameters to the redirect URI
        redirectUri.searchParams.set('error', 'access_denied')
        redirectUri.searchParams.set(
            'error_description',
            'User denied the request',
        )
        if (auth0AuthRequest.mcpAuthRequest.state) {
            redirectUri.searchParams.set(
                'state',
                auth0AuthRequest.mcpAuthRequest.state,
            )
        }

        // Clear the transaction cookie
        setCookie(c, cookieName, '', {
            maxAge: 0,
            path: '/',
        })

        return c.redirect(redirectUri.toString())
    }

    const { as } = await getOidcConfig({
        client_id: c.env.AUTH0_CLIENT_ID,
        client_secret: c.env.AUTH0_CLIENT_SECRET,
        issuer: `https://${c.env.AUTH0_DOMAIN}/`,
    })

    // Redirect to Auth0's authorization endpoint
    const authorizationUrl = new URL(as.authorization_endpoint!)
    authorizationUrl.searchParams.set('client_id', c.env.AUTH0_CLIENT_ID)
    authorizationUrl.searchParams.set(
        'redirect_uri',
        new URL('/oauth/callback', c.req.url).href,
    )
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('audience', c.env.AUTH0_AUDIENCE)
    authorizationUrl.searchParams.set('scope', c.env.AUTH0_SCOPE)
    authorizationUrl.searchParams.set(
        'code_challenge',
        auth0AuthRequest.codeChallenge,
    )
    authorizationUrl.searchParams.set('code_challenge_method', 'S256')
    authorizationUrl.searchParams.set('nonce', auth0AuthRequest.nonce)
    authorizationUrl.searchParams.set('state', transactionState)

    return c.redirect(authorizationUrl.href)
}

/**
 * OAuth Callback Endpoint
 *
 * This route handles the callback from Auth0 after user authentication.
 * It exchanges the authorization code for tokens and completes the
 * authorization process.
 */
export async function callback(
    c: any & { env: Env & { OAUTH_PROVIDER: OAuthHelpers } },
) {
    // Parse the state parameter to extract transaction state and Auth0 state
    const stateParam = c.req.query('state') as string
    if (!stateParam) {
        return c.text('Invalid state parameter', 400)
    }

    // Parse the Auth0 auth request from the transaction-specific cookie
    const cookieName = `auth0_req_${stateParam}`
    const auth0AuthRequestCookie = getCookie(c, cookieName)
    if (!auth0AuthRequestCookie) {
        return c.text('Invalid transaction state or session expired', 400)
    }

    const auth0AuthRequest = JSON.parse(
        atob(auth0AuthRequestCookie),
    ) as Auth0AuthRequest

    // Clear the transaction cookie as it's no longer needed
    setCookie(c, cookieName, '', {
        maxAge: 0,
        path: '/',
    })

    console.log('Processing OAuth callback with valid transaction state')

    const { as, client, clientAuth } = await getOidcConfig({
        client_id: c.env.AUTH0_CLIENT_ID,
        client_secret: c.env.AUTH0_CLIENT_SECRET,
        issuer: `https://${c.env.AUTH0_DOMAIN}/`,
    })

    // Perform the Code Exchange
    const params = oauth.validateAuthResponse(
        as,
        client,
        new URL(c.req.url),
        auth0AuthRequest.transactionState,
    )

    const response = await oauth.authorizationCodeGrantRequest(
        as,
        client,
        clientAuth,
        params,
        new URL('/oauth/callback', c.req.url).href,
        auth0AuthRequest.codeVerifier,
    )

    console.log('Successfully completed authorization code exchange')

    // Process the response
    const result = await oauth.processAuthorizationCodeResponse(
        as,
        client,
        response,
        {
            expectedNonce: auth0AuthRequest.nonce,
            requireIdToken: true,
        },
    )

    // Get the claims from the id_token
    const claims = oauth.getValidatedIdTokenClaims(result)
    if (!claims) {
        return c.text('Received invalid id_token from Auth0', 400)
    }

    // Complete the authorization
    const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
        metadata: {
            label: claims.name || claims.email || claims.sub,
        },
        props: {
            claims: claims,
            tokenSet: {
                accessToken: result.access_token,
                accessTokenTTL: result.expires_in,
                idToken: result.id_token,
                refreshToken: result.refresh_token,
            },
        } as UserProps,
        request: auth0AuthRequest.mcpAuthRequest,
        scope: auth0AuthRequest.mcpAuthRequest.scope,
        userId: claims.sub!,
    })

    return Response.redirect(redirectTo, 302)
}

/**
 * Token Exchange Callback
 *
 * This function handles the token exchange callback for the CloudflareOAuth Provider
 * and allows us to then interact with the Upstream IdP (your Auth0 tenant)
 */
export function createTokenExchangeCallback(env: Env) {
    return async function tokenExchangeCallback(
        options: TokenExchangeCallbackOptions,
    ): Promise<TokenExchangeCallbackResult> {
        console.log('Token exchange callback:', options.grantType)

        // During the Authorization Code Exchange, we want to make sure that the Access Token issued
        // by the MCP Server has the same TTL as the one issued by Auth0.
        if (options.grantType === 'authorization_code') {
            return {
                accessTokenTTL: options.props.tokenSet.accessTokenTTL,
                newProps: {
                    ...options.props,
                },
            }
        }

        if (options.grantType === 'refresh_token') {
            console.log('🔄 Starting token refresh flow')

            const auth0RefreshToken = options.props.tokenSet.refreshToken
            if (!auth0RefreshToken) {
                throw new Error('No Auth0 refresh token found')
            }

            try {
                const { as, client, clientAuth } = await getOidcConfig({
                    client_id: env.AUTH0_CLIENT_ID,
                    client_secret: env.AUTH0_CLIENT_SECRET,
                    issuer: `https://${env.AUTH0_DOMAIN}/`,
                })

                // Perform the refresh token exchange with Auth0.
                const response = await oauth.refreshTokenGrantRequest(
                    as,
                    client,
                    clientAuth,
                    auth0RefreshToken,
                )

                const refreshTokenResponse =
                    await oauth.processRefreshTokenResponse(
                        as,
                        client,
                        response,
                    )

                // Get the claims from the id_token
                const claims =
                    oauth.getValidatedIdTokenClaims(refreshTokenResponse)
                if (!claims) {
                    throw new Error('Received invalid id_token from Auth0')
                }

                console.log('✅ Token refresh successful')

                const newTokenSet = {
                    accessToken: refreshTokenResponse.access_token,
                    accessTokenTTL: refreshTokenResponse.expires_in,
                    idToken: refreshTokenResponse.id_token,
                    refreshToken:
                        refreshTokenResponse.refresh_token || auth0RefreshToken,
                }

                // Store the new token set and claims.
                return {
                    accessTokenTTL: refreshTokenResponse.expires_in,
                    newProps: {
                        ...options.props,
                        claims: claims,
                        tokenSet: newTokenSet,
                    },
                }
            } catch (error) {
                console.error(
                    '❌ Token refresh failed:',
                    error instanceof Error ? error.message : 'Unknown error',
                )
                throw error
            }
        }

        console.error('Unsupported grant type:', options.grantType)
        throw new Error(`Unsupported grant type: ${options.grantType}`)
    }
}

/**
 * Create the Hono app with OAuth and utility routes
 */
export function createAuthApp(): Hono<{
    Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers }
}> {
    const app = new Hono<{ Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers } }>()

    // OAuth routes - these are required for the OAuth flow
    app.get('/oauth/authorize', authorize)
    app.post('/oauth/authorize/consent', confirmConsent)
    app.get('/oauth/callback', callback)

    // Health check
    app.get('/health', (c) => {
        return c.json({
            status: 'ok',
            service: 'DevCycle MCP Server',
            timestamp: new Date().toISOString(),
        })
    })

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
