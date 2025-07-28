/**
 * MCP Tool Registry for DevCycle CLI
 *
 * This registry pattern allows the same tool implementations to be shared
 * between both local (stdio) and remote (SSE/Cloudflare Worker) MCP servers.
 */

import { IDevCycleApiClient } from '../api/interface'

/**
 * Definition of an MCP tool that can be registered and executed
 */
export interface MCPToolDefinition {
    /** Unique tool name */
    name: string
    /** Human-readable description */
    description: string
    /** JSON schema for input validation */
    inputSchema: any
    /** Optional JSON schema for output validation */
    outputSchema?: any
    /** Tool handler function */
    handler: (args: unknown, client: IDevCycleApiClient) => Promise<any>
}

/**
 * Registry for managing MCP tools that can be used by both local and remote servers
 */
export class MCPToolRegistry {
    private tools = new Map<string, MCPToolDefinition>()

    /**
     * Register a tool with the registry
     */
    register(tool: MCPToolDefinition): void {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool '${tool.name}' is already registered`)
        }
        this.tools.set(tool.name, tool)
    }

    /**
     * Register multiple tools at once
     */
    registerMany(tools: MCPToolDefinition[]): void {
        for (const tool of tools) {
            this.register(tool)
        }
    }

    /**
     * Get all registered tools
     */
    getAll(): MCPToolDefinition[] {
        return Array.from(this.tools.values())
    }

    /**
     * Get a specific tool by name
     */
    get(name: string): MCPToolDefinition | undefined {
        return this.tools.get(name)
    }

    /**
     * Check if a tool is registered
     */
    has(name: string): boolean {
        return this.tools.has(name)
    }

    /**
     * Execute a tool by name
     */
    async execute(
        name: string,
        args: unknown,
        client: IDevCycleApiClient,
    ): Promise<any> {
        const tool = this.tools.get(name)
        if (!tool) {
            throw new Error(`Unknown tool: ${name}`)
        }
        console.error('Executing tool:', name)
        return await tool.handler(args, client)
    }

    /**
     * Get all tool names
     */
    getToolNames(): string[] {
        return Array.from(this.tools.keys())
    }

    /**
     * Get the count of registered tools
     */
    size(): number {
        return this.tools.size
    }

    /**
     * Clear all registered tools
     */
    clear(): void {
        this.tools.clear()
    }
}

/**
 * Function type for tool registration functions
 */
export type ToolRegistrationFunction = (registry: MCPToolRegistry) => void
