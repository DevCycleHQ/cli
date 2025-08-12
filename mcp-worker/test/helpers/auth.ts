import { EncodeJWT } from 'jose'
import type { UserProps, DevCycleJWTClaims } from '../../src/types'

/**
 * Creates a mock JWT token for testing
 */
export function createMockJWT(claims: Partial<DevCycleJWTClaims> = {}): string {
    const defaultClaims: DevCycleJWTClaims = {
        sub: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        org_id: 'test-org-id',
        project_key: 'test-project',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        aud: 'https://api-test.devcycle.com/',
        iss: 'https://test-auth.devcycle.com/',
    }

    const payload = { ...defaultClaims, ...claims }

    // Create a simple base64-encoded mock JWT (not cryptographically valid)
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }))
    const encodedPayload = btoa(JSON.stringify(payload))
    const signature = 'mock-signature'

    return `${header}.${encodedPayload}.${signature}`
}

/**
 * Creates mock user properties for testing
 */
export function createMockUserProps(
    jwtClaims: Partial<DevCycleJWTClaims> = {},
    tokenProps: Partial<UserProps['tokenSet']> = {},
): UserProps {
    const mockJWT = createMockJWT(jwtClaims)

    // Parse the claims from the mock JWT
    const payload = JSON.parse(atob(mockJWT.split('.')[1]))

    return {
        claims: payload,
        tokenSet: {
            accessToken: `mock-access-token-${Date.now()}`,
            accessTokenTTL: 3600,
            idToken: mockJWT,
            refreshToken: `mock-refresh-token-${Date.now()}`,
            ...tokenProps,
        },
    }
}

/**
 * Creates a mock OAuth KV store for testing
 */
export function createMockOAuthKV() {
    const store = new Map<string, string>()

    return {
        async get(key: string): Promise<string | null> {
            return store.get(key) || null
        },
        async put(key: string, value: string): Promise<void> {
            store.set(key, value)
        },
        async delete(key: string): Promise<void> {
            store.delete(key)
        },
        async list(): Promise<{ keys: { name: string }[] }> {
            return { keys: Array.from(store.keys()).map((name) => ({ name })) }
        },
    }
}

/**
 * Creates mock environment bindings for testing
 */
export function createMockEnv(overrides: Partial<Env> = {}): Env {
    return {
        NODE_ENV: 'test',
        API_BASE_URL: 'https://api-test.devcycle.com',
        AUTH0_DOMAIN: 'test-auth.devcycle.com',
        AUTH0_AUDIENCE: 'https://api-test.devcycle.com/',
        AUTH0_SCOPE: 'openid profile email offline_access',
        AUTH0_CLIENT_ID: 'test-client-id',
        AUTH0_CLIENT_SECRET: 'test-client-secret',
        ENABLE_OUTPUT_SCHEMAS: 'false',
        OAUTH_KV: createMockOAuthKV(),
        MCP_OBJECT: {} as any, // Mock Durable Object
        ...overrides,
    } as Env
}
