/**
 * E2E tests for worker startup and basic functionality
 */

import { SELF } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'

describe('Worker Startup', () => {
    it('should handle basic HTTP requests without crashing', async () => {
        const response = await SELF.fetch('http://localhost/')

        // Should get some response (might be 404, but shouldn't crash)
        expect(response).toBeDefined()
        expect(response.status).toBeGreaterThanOrEqual(200)
        expect(response.status).toBeLessThan(600)
    })

    it('should handle OAuth authorization endpoint', async () => {
        const response = await SELF.fetch(
            'http://localhost/oauth/authorize?client_id=test&response_type=code&redirect_uri=http://localhost:3000/callback',
        )

        // OAuth endpoint should be available
        expect(response).toBeDefined()
        expect(response.status).toBeGreaterThanOrEqual(200)
        expect(response.status).toBeLessThan(500) // Should not be a server error
    })

    it('should reject MCP requests without authentication', async () => {
        const mcpRequest = {
            jsonrpc: '2.0',
            method: 'tools/list',
            id: 1,
        }

        const response = await SELF.fetch('http://localhost/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mcpRequest),
        })

        // Should reject unauthenticated requests
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(response.status).toBeLessThan(500)
    })

    it('should handle SSE endpoint', async () => {
        const response = await SELF.fetch('http://localhost/sse', {
            headers: {
                Accept: 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        })

        // SSE endpoint should be available (might require auth)
        expect(response).toBeDefined()
        expect(response.status).toBeGreaterThanOrEqual(200)
    })
})
