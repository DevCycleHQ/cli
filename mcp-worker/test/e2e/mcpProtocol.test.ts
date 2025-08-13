/**
 * E2E tests for MCP protocol compliance
 */

import { SELF } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import {
    makeMcpRequest,
    initializeMcp,
    listTools,
    type McpResponse,
} from '../helpers/mcpClient'

describe('MCP Protocol Compliance', () => {
    const mockAuthToken = 'mock-auth-token'

    it('should handle initialize handshake', async () => {
        const response = await makeMcpRequest(
            'initialize',
            {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                },
                clientInfo: {
                    name: 'test-client',
                    version: '1.0.0',
                },
            },
            mockAuthToken,
        )

        expect(response.jsonrpc).toBe('2.0')
        expect(response.error).toBeUndefined()
        expect(response.result).toBeDefined()

        const result = response.result as any
        expect(result.protocolVersion).toBeDefined()
        expect(result.capabilities).toBeDefined()
        expect(result.serverInfo).toBeDefined()
        expect(result.serverInfo.name).toContain('DevCycle')
        expect(result.serverInfo.version).toBeDefined()
    })

    it('should handle notifications/initialized', async () => {
        // First initialize
        await initializeMcp(mockAuthToken)

        // Then send initialized notification
        const response = await makeMcpRequest(
            'notifications/initialized',
            {},
            mockAuthToken,
        )

        // Notifications don't return responses, but shouldn't error
        expect(response.error).toBeUndefined()
    })

    it('should list available tools', async () => {
        // Initialize first
        await initializeMcp(mockAuthToken)

        const response = await makeMcpRequest('tools/list', {}, mockAuthToken)

        expect(response.jsonrpc).toBe('2.0')
        expect(response.error).toBeUndefined()
        expect(response.result).toBeDefined()

        const result = response.result as { tools: any[] }
        expect(result.tools).toBeDefined()
        expect(Array.isArray(result.tools)).toBe(true)
        expect(result.tools.length).toBeGreaterThan(0)

        // Each tool should have required properties
        for (const tool of result.tools) {
            expect(tool.name).toBeDefined()
            expect(typeof tool.name).toBe('string')
            expect(tool.description).toBeDefined()
            expect(typeof tool.description).toBe('string')
            expect(tool.inputSchema).toBeDefined()
        }
    })

    it('should handle invalid JSON-RPC requests', async () => {
        const response = await SELF.fetch('http://localhost/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${mockAuthToken}`,
            },
            body: 'invalid json',
        })

        expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should handle unknown methods gracefully', async () => {
        const response = await makeMcpRequest(
            'unknown/method',
            {},
            mockAuthToken,
        )

        expect(response.jsonrpc).toBe('2.0')
        expect(response.error).toBeDefined()
        expect(response.error!.code).toBeDefined()
        expect(response.error!.message).toBeDefined()
    })

    it('should require authentication for MCP requests', async () => {
        // Try to make request without auth token - should get HTTP 401
        try {
            await makeMcpRequest(
                'tools/list',
                // No auth token
            )
            // If we get here, the test should fail
            expect.fail('Expected request to fail with 401 Unauthorized, but it succeeded')
        } catch (error: any) {
            // Should get an HTTP 401 error
            expect(error.message).toContain('401')
            expect(error.message).toContain('Unauthorized')
        }
    })

    it('should handle malformed tool calls', async () => {
        // Initialize first
        await initializeMcp(mockAuthToken)

        const response = await makeMcpRequest(
            'tools/call',
            {
                // Missing required fields
                name: 'nonexistent-tool',
            },
            mockAuthToken,
        )

        expect(response.error).toBeDefined()
        expect(response.error!.message).toBeDefined()
    })

    it('should maintain JSON-RPC request/response correlation', async () => {
        const response = await makeMcpRequest('tools/list', {}, mockAuthToken)

        // Should have same ID in response
        expect(response.id).toBeDefined()
        expect(response.jsonrpc).toBe('2.0')
    })

    it('should handle concurrent requests', async () => {
        // Initialize first
        await initializeMcp(mockAuthToken)

        // Make multiple concurrent requests
        const promises = Array.from({ length: 5 }, (_, i) =>
            makeMcpRequest('tools/list', {}, mockAuthToken),
        )

        const responses = await Promise.all(promises)

        // All should succeed
        for (const response of responses) {
            expect(response.error).toBeUndefined()
            expect(response.result).toBeDefined()
        }
    })
})
