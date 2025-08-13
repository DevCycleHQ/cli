/**
 * E2E tests for tool listing and discovery
 */

import { SELF } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import {
    initializeMcp,
    listTools,
    callTool,
    makeMcpRequest,
    type McpTool,
} from '../helpers/mcpClient'

describe('Tool Discovery and Listing', () => {
    const mockAuthToken = 'mock-auth-token'

    it('should list all expected tools', async () => {
        // Initialize MCP session
        await initializeMcp(mockAuthToken)

        // Get tools list
        const tools = await listTools(mockAuthToken)

        expect(tools).toBeDefined()
        expect(Array.isArray(tools)).toBe(true)
        expect(tools.length).toBeGreaterThan(0)

        // Extract tool names
        const toolNames = tools.map((tool) => tool.name)

        // Check that we have at least one mock tool
        expect(toolNames).toContain('mockTool')
    })

    it('should provide valid tool schemas', async () => {
        await initializeMcp(mockAuthToken)
        const tools = await listTools(mockAuthToken)

        for (const tool of tools) {
            // Each tool should have required properties
            expect(tool.name).toBeDefined()
            expect(typeof tool.name).toBe('string')
            expect(tool.name.length).toBeGreaterThan(0)

            expect(tool.description).toBeDefined()
            expect(typeof tool.description).toBe('string')
            expect(tool.description.length).toBeGreaterThan(0)

            expect(tool.inputSchema).toBeDefined()
            expect(typeof tool.inputSchema).toBe('object')

            // Input schema should have type property
            expect(tool.inputSchema).toHaveProperty('type')
        }
    })

    it('should include mock tools for testing', async () => {
        await initializeMcp(mockAuthToken)
        const tools = await listTools(mockAuthToken)

        const toolNames = tools.map((tool) => tool.name)

        // Should have mock tool
        expect(toolNames).toContain('mockTool')

        // Find the mock tool
        const mockTool = tools.find((tool) => tool.name === 'mockTool')
        expect(mockTool).toBeDefined()
        expect(mockTool!.description).toContain('testing')
    })

    it('should return tools in proper format', async () => {
        await initializeMcp(mockAuthToken)
        const tools = await listTools(mockAuthToken)

        // Verify tools are returned in the correct format
        expect(tools).toBeDefined()
        expect(Array.isArray(tools)).toBe(true)
        expect(tools.length).toBeGreaterThan(0)

        // Each tool should have the required structure
        for (const tool of tools) {
            expect(tool).toHaveProperty('name')
            expect(tool).toHaveProperty('description')
            expect(tool).toHaveProperty('inputSchema')
        }
    })

    it('should handle tool calls with invalid tool names', async () => {
        await initializeMcp(mockAuthToken)

        // Try to call a non-existent tool
        const response = await makeMcpRequest(
            'tools/call',
            {
                name: 'nonExistentTool',
                arguments: {},
            },
            mockAuthToken,
        )

        expect(response.error).toBeDefined()
        expect(response.error!.message).toBeDefined()
    })

    it('should validate tool arguments', async () => {
        await initializeMcp(mockAuthToken)

        // Try to call a tool with invalid arguments
        const response = await makeMcpRequest(
            'tools/call',
            {
                name: 'mockTool',
                arguments: {
                    invalidParam: 'value',
                },
            },
            mockAuthToken,
        )

        // Should return an error for invalid arguments to a known tool
        expect(response.error).toBeDefined()
        expect(response.error!.message).toBeDefined()
    })

    it('should handle different authentication tokens', async () => {
        const alternativeToken = 'alternative-mock-token'

        await initializeMcp(alternativeToken)
        const tools = await listTools(alternativeToken)

        // Should still return tools regardless of token in mock
        expect(tools.length).toBeGreaterThan(0)

        const toolNames = tools.map((tool) => tool.name)
        expect(toolNames).toContain('mockTool')
    })

    it('should return consistent tool list across multiple calls', async () => {
        await initializeMcp(mockAuthToken)

        // Make multiple calls to tools/list
        const [tools1, tools2, tools3] = await Promise.all([
            listTools(mockAuthToken),
            listTools(mockAuthToken),
            listTools(mockAuthToken),
        ])

        // Should return consistent results
        expect(tools1.length).toBe(tools2.length)
        expect(tools2.length).toBe(tools3.length)

        const names1 = tools1.map((t) => t.name).sort()
        const names2 = tools2.map((t) => t.name).sort()
        const names3 = tools3.map((t) => t.name).sort()

        expect(names1).toEqual(names2)
        expect(names2).toEqual(names3)
    })

    it('should handle tools/call with missing arguments', async () => {
        await initializeMcp(mockAuthToken)

        const response = await makeMcpRequest(
            'tools/call',
            {
                // Missing name and arguments
            },
            mockAuthToken,
        )

        expect(response.error).toBeDefined()
        expect(response.error!.code).toBeDefined()
        expect(typeof response.error!.code).toBe('number')
    })

    it('should provide tools with consistent naming', async () => {
        await initializeMcp(mockAuthToken)
        const tools = await listTools(mockAuthToken)

        // Verify tool naming conventions
        for (const tool of tools) {
            expect(tool.name).toBeDefined()
            expect(typeof tool.name).toBe('string')
            expect(tool.name.length).toBeGreaterThan(0)

            // Tool names should not have spaces
            expect(tool.name).not.toMatch(/\s/)

            // Tool names should be camelCase or similar
            expect(tool.name).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/)
        }
    })
})
