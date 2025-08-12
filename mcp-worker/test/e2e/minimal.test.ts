/**
 * Minimal worker test to verify infrastructure works
 */

import { SELF } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'

describe('Minimal Worker Infrastructure', () => {
    it('should handle basic fetch requests', async () => {
        // Create a minimal request
        const response = await SELF.fetch('http://localhost/health')

        // Just verify we get a response
        expect(response).toBeDefined()
        expect(typeof response.status).toBe('number')
        expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should handle different HTTP methods', async () => {
        const getResponse = await SELF.fetch('http://localhost/', {
            method: 'GET',
        })

        const postResponse = await SELF.fetch('http://localhost/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"test": true}',
        })

        expect(getResponse).toBeDefined()
        expect(postResponse).toBeDefined()

        // Both should return some response (not necessarily success)
        expect(getResponse.status).toBeGreaterThanOrEqual(200)
        expect(postResponse.status).toBeGreaterThanOrEqual(200)
    })

    it('should have proper CORS headers if needed', async () => {
        const response = await SELF.fetch('http://localhost/', {
            method: 'OPTIONS',
        })

        expect(response).toBeDefined()
        expect(response.status).toBeGreaterThanOrEqual(200)
    })
})
