#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { DevCycleMCPServer } from './server'

async function main() {
    const server = new Server(
        {
            name: 'devcycle',
            version: '0.0.1',
        },
        {
            capabilities: {
                tools: {},
            },
        },
    )

    const mcpServer = new DevCycleMCPServer(server)
    await mcpServer.initialize()

    const transport = new StdioServerTransport()
    await server.connect(transport)

    console.error('DevCycle MCP server running on stdio')
}

main().catch((error) => {
    console.error('Failed to start DevCycle MCP server:', error)
    process.exit(1)
})
