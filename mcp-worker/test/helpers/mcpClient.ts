/**
 * MCP test client for making protocol requests
 */

export interface McpRequest {
    jsonrpc: '2.0'
    method: string
    params?: Record<string, unknown>
    id: number | string
}

export interface McpResponse {
    jsonrpc: '2.0'
    id: number | string
    result?: unknown
    error?: {
        code: number
        message: string
        data?: unknown
    }
}

export interface McpTool {
    name: string
    description: string
    inputSchema: Record<string, unknown>
}

/**
 * Creates an MCP protocol request
 */
export function createMcpRequest(
    method: string,
    params?: Record<string, unknown>,
    id: number | string = 1,
): McpRequest {
    const request: McpRequest = {
        jsonrpc: '2.0',
        method,
        id,
    }

    if (params) {
        request.params = params
    }

    return request
}

/**
 * Makes an MCP protocol request to the worker
 */
export async function makeMcpRequest(
    method: string,
    params?: Record<string, unknown>,
    authToken?: string,
): Promise<McpResponse> {
    const { SELF } = await import('cloudflare:test')
    const request = createMcpRequest(method, params)

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
    }

    const httpRequest = new Request('http://localhost/mcp', {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    })

    const response = await SELF.fetch(httpRequest)

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return (await response.json()) as McpResponse
}

/**
 * Lists available tools from the MCP server
 */
export async function listTools(authToken?: string): Promise<McpTool[]> {
    const response = await makeMcpRequest('tools/list', undefined, authToken)

    if (response.error) {
        throw new Error(`MCP Error: ${response.error.message}`)
    }

    const result = response.result as { tools?: McpTool[] }
    return result.tools || []
}

/**
 * Calls an MCP tool
 */
export async function callTool(
    toolName: string,
    args: Record<string, unknown> = {},
    authToken?: string,
): Promise<unknown> {
    const response = await makeMcpRequest(
        'tools/call',
        { name: toolName, arguments: args },
        authToken,
    )

    if (response.error) {
        throw new Error(`Tool Error: ${response.error.message}`)
    }

    return response.result
}

/**
 * Performs MCP initialization handshake
 */
export async function initializeMcp(authToken?: string): Promise<unknown> {
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
        authToken,
    )

    if (response.error) {
        throw new Error(`Initialization Error: ${response.error.message}`)
    }

    return response.result
}
