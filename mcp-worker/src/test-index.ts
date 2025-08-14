/**
 * Test-specific worker entry point that mocks MCP SDK
 * This avoids the AJV compatibility issues during testing
 */

// Mock MCP Server for testing
class MockMcpServer {
    constructor(config: any) {
        // Mock MCP Server initialized silently for testing
    }

    registerTool(name: string, config: any, handler: any) {
        // Tool registration handled silently in mock
    }
}

// Mock McpAgent for testing
class MockMcpAgent {
    server = new MockMcpServer({
        name: 'DevCycle MCP Test Server',
        version: '1.0.0',
    })

    static serveSSE(path: string) {
        return async (request: Request) => {
            return new Response('Mock SSE endpoint', { status: 200 })
        }
    }

    static serve(path: string) {
        return async (request: Request) => {
            const url = new URL(request.url)

            // Mock MCP protocol responses
            if (request.method === 'POST' && url.pathname === path) {
                // Check for Authorization header in MCP requests
                const authHeader = request.headers.get('Authorization')
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return new Response(
                        JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            error: {
                                code: 401,
                                message: 'Unauthorized - Bearer token required',
                            },
                        }),
                        {
                            status: 401,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                try {
                    const raw = await request.json()

                    const isRecord = (
                        v: unknown,
                    ): v is Record<string, unknown> =>
                        v !== null && typeof v === 'object'

                    const method =
                        isRecord(raw) && typeof raw.method === 'string'
                            ? raw.method
                            : undefined
                    const id =
                        isRecord(raw) && 'id' in raw
                            ? (raw as Record<string, unknown>).id
                            : undefined

                    // Mock tools/list response
                    if (method === 'tools/list') {
                        return new Response(
                            JSON.stringify({
                                jsonrpc: '2.0',
                                id: id ?? 1,
                                result: {
                                    tools: [
                                        {
                                            name: 'mockTool',
                                            description:
                                                'A mock tool for testing',
                                            inputSchema: { type: 'object' },
                                        },
                                    ],
                                },
                            }),
                            {
                                headers: { 'Content-Type': 'application/json' },
                            },
                        )
                    }

                    // Mock initialize response
                    if (method === 'initialize') {
                        return new Response(
                            JSON.stringify({
                                jsonrpc: '2.0',
                                id: id ?? 1,
                                result: {
                                    protocolVersion: '2024-11-05',
                                    capabilities: { tools: {} },
                                    serverInfo: {
                                        name: 'DevCycle MCP Test Server',
                                        version: '1.0.0',
                                    },
                                },
                            }),
                            {
                                headers: { 'Content-Type': 'application/json' },
                            },
                        )
                    }

                    // Mock notifications/initialized (should succeed silently)
                    if (method === 'notifications/initialized') {
                        return new Response(
                            JSON.stringify({
                                jsonrpc: '2.0',
                                id: id ?? 1,
                                result: {},
                            }),
                            {
                                headers: { 'Content-Type': 'application/json' },
                            },
                        )
                    }

                    // Default response for unknown methods
                    return new Response(
                        JSON.stringify({
                            jsonrpc: '2.0',
                            id: id ?? 1,
                            error: {
                                code: -32601,
                                message: 'Method not found',
                            },
                        }),
                        {
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                } catch (error) {
                    return new Response('Invalid JSON', { status: 400 })
                }
            }

            return new Response('Not found', { status: 404 })
        }
    }
}

// Create a simple test app that mimics the OAuth provider structure
function createTestApp() {
    return {
        async fetch(request: Request, env: any, ctx: any): Promise<Response> {
            const url = new URL(request.url)

            // Handle different endpoints
            switch (url.pathname) {
                case '/':
                    return new Response('DevCycle MCP Worker Test', {
                        status: 200,
                    })

                case '/health':
                    return new Response('OK', { status: 200 })

                case '/oauth/authorize':
                    return new Response('Mock OAuth authorize', { status: 200 })

                case '/sse':
                    return MockMcpAgent.serveSSE('/sse')(request)

                case '/mcp':
                    return MockMcpAgent.serve('/mcp')(request)

                default:
                    return new Response('Not Found', { status: 404 })
            }
        },
    }
}

// Export the test worker
export default createTestApp()
