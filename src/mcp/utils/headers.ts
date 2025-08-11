import { setDVCReferrer } from '../../api/apiClient'

// Store the version for reuse in tool commands
let mcpVersion: string = ''

/**
 * Sets up MCP-specific headers for all API requests
 * This ensures that API calls made from the MCP server are properly identified
 * and can be tracked separately from CLI commands
 */
export function setMCPHeaders(version: string): void {
    // Store version for later use in tool commands
    mcpVersion = version

    // Set the referrer to identify this as an MCP request
    // Command will be set dynamically for each tool call
    // Caller is 'mcp' to distinguish from 'cli' and other callers
    setDVCReferrer('mcp', version, 'mcp')
}

/**
 * Updates the command in the headers for a specific MCP tool call
 * This allows tracking of individual MCP operations (e.g., "list_features", "create_project")
 * @param toolName - The name of the MCP tool being called
 */
export function setMCPToolCommand(toolName: string): void {
    // Update the command to be the tool name, keeping version and caller the same
    setDVCReferrer(toolName, mcpVersion, 'mcp')
}
