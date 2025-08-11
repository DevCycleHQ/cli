#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { DevCycleMCPServer } from './server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { initializeMCPHeaders } from './utils/headers'

// Get version for MCP server
function getVersion(): string {
    try {
        const packagePath = join(__dirname, '..', '..', 'package.json')
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
        return packageJson.version
    } catch {
        return 'unknown version'
    }
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--version') || args.includes('-v')) {
    console.log(getVersion())
    process.exit(0)
}

if (args.includes('--help') || args.includes('-h')) {
    console.log('DevCycle MCP Server')
    console.log('')
    console.log(
        'A Model Context Protocol server for DevCycle feature flag management.',
    )
    console.log(
        'Designed to be used with AI coding assistants like Cursor and Claude.',
    )
    console.log('')
    console.log('Usage:')
    console.log('  dvc-mcp              Start the MCP server')
    console.log('  dvc-mcp --version    Show version information')
    console.log('  dvc-mcp --help       Show this help message')
    console.log('')
    console.log(
        'For setup instructions, see: https://github.com/DevCycleHQ/cli#mcp-server-for-ai-assistants',
    )
    process.exit(0)
}

async function main() {
    const version = getVersion()

    // Set up MCP-specific headers for all API requests
    // This ensures that requests from the MCP server are properly identified
    initializeMCPHeaders(version)

    const mcpServer = new McpServer({
        name: 'DevCycle MCP Local Server',
        version,
    })

    const dvcMCPServer = new DevCycleMCPServer(mcpServer)
    await dvcMCPServer.initialize()

    const transport = new StdioServerTransport()
    await mcpServer.connect(transport)

    console.error('DevCycle MCP server running on stdio')
}

main().catch((error) => {
    console.error('❌ Failed to start DevCycle MCP server')
    console.error('')

    if (error instanceof Error) {
        // Check for common error patterns and provide helpful guidance
        if (
            error.message.includes('authentication') ||
            error.message.includes('DEVCYCLE_CLIENT_ID')
        ) {
            console.error('🔐 Authentication Error:')
            console.error(`   ${error.message}`)
            console.error('')
            console.error('💡 To fix this:')
            console.error('   1. Run: dvc login sso')
            console.error('   2. Or set environment variables:')
            console.error('      export DEVCYCLE_CLIENT_ID="your-client-id"')
            console.error(
                '      export DEVCYCLE_CLIENT_SECRET="your-client-secret"',
            )
        } else if (
            error.message.includes('project') ||
            error.message.includes('DEVCYCLE_PROJECT_KEY')
        ) {
            console.error('📁 Project Configuration Error:')
            console.error(`   ${error.message}`)
            console.error('')
            console.error('💡 To fix this:')
            console.error('   1. Run: dvc projects select')
            console.error('   2. Or set environment variable:')
            console.error(
                '      export DEVCYCLE_PROJECT_KEY="your-project-key"',
            )
        } else {
            console.error('⚠️  Unexpected Error:')
            console.error(`   ${error.message}`)
            console.error('')
            console.error('💡 For help:')
            console.error('   - Run: dvc status')
            console.error('   - Check: https://docs.devcycle.com')
            console.error('   - Contact: support@devcycle.com')
        }
    } else {
        console.error('⚠️  Unknown error occurred')
        console.error(`   ${error}`)
    }

    console.error('')
    process.exit(1)
})
