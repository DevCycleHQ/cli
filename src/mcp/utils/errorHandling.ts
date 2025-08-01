/**
 * Shared error handling utilities for MCP servers
 */
import { AxiosError } from 'axios'

/**
 * Extract meaningful error message from various error types, especially API errors
 */
function extractMeaningfulErrorMessage(error: unknown): string {
    // Handle AxiosError specifically to get API error messages
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError
        const apiError = axiosError.response?.data

        if (apiError && typeof apiError === 'object') {
            // Handle DevCycle API error response format
            const apiErrorObj = apiError as Record<string, unknown>

            if (apiErrorObj.message) {
                if (Array.isArray(apiErrorObj.message)) {
                    return apiErrorObj.message.join('; ')
                } else if (typeof apiErrorObj.message === 'object') {
                    // Extract validation errors from object like {0: "error message"}
                    const messages = Object.values(
                        apiErrorObj.message as Record<string, unknown>,
                    )
                    return messages.join('; ')
                } else {
                    return String(apiErrorObj.message)
                }
            } else if (apiErrorObj.error) {
                return String(apiErrorObj.error)
            } else if (apiErrorObj.detail) {
                return String(apiErrorObj.detail)
            }
        }

        // Fall back to axios error message
        if (axiosError.message) {
            return axiosError.message
        }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return error.message
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error
    }

    // Handle other objects
    if (error && typeof error === 'object') {
        return JSON.stringify(error)
    }

    return 'Unknown error'
}

export function handleToolError(error: unknown, toolName: string) {
    const errorMessage = extractMeaningfulErrorMessage(error)
    const errorType = categorizeError(errorMessage)
    const suggestions = getErrorSuggestions(errorType)

    const errorResponse = {
        errorType,
        errorMessage,
        toolName,
        suggestions,
        timestamp: new Date().toISOString(),
    }
    console.error(`Error in tool handler ${toolName}:`, {
        error,
        errorResponse,
    })

    return {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify(errorResponse, null, 2),
            },
        ],
    }
}

export function categorizeError(errorMessage: string): string {
    const lowerMessage = errorMessage.toLowerCase()

    switch (true) {
        case lowerMessage.includes('zodios: invalid response') ||
            lowerMessage.includes('invalid_type') ||
            lowerMessage.includes('expected object, received'):
            return 'SCHEMA_VALIDATION_ERROR'

        case lowerMessage.includes('401') ||
            lowerMessage.includes('unauthorized'):
            return 'AUTHENTICATION_ERROR'

        case lowerMessage.includes('403') || lowerMessage.includes('forbidden'):
            return 'PERMISSION_ERROR'

        case lowerMessage.includes('project') &&
            lowerMessage.includes('not found'):
            return 'PROJECT_ERROR'

        case lowerMessage.includes('404') || lowerMessage.includes('not found'):
            return 'RESOURCE_NOT_FOUND'

        case lowerMessage.includes('400') ||
            lowerMessage.includes('bad request') ||
            lowerMessage.includes('should not exist') ||
            lowerMessage.includes('is required') ||
            lowerMessage.includes('invalid format') ||
            lowerMessage.includes('must be'):
            return 'VALIDATION_ERROR'

        case lowerMessage.includes('429') ||
            lowerMessage.includes('rate limit'):
            return 'RATE_LIMIT_ERROR'

        case lowerMessage.includes('enotfound') ||
            lowerMessage.includes('network'):
            return 'NETWORK_ERROR'

        default:
            return 'UNKNOWN_ERROR'
    }
}

export function getErrorSuggestions(errorType: string): string[] {
    switch (errorType) {
        case 'SCHEMA_VALIDATION_ERROR':
            return [
                'The API response format has changed or is unexpected',
                'This may be a temporary API issue - try again in a moment',
                'Contact DevCycle support if the issue persists',
            ]

        case 'AUTHENTICATION_ERROR':
            return [
                'Re-authenticate with DevCycle (run "dvc login sso" for CLI for local MCP or re-login through OAuth for remote MCP)',
                'Verify your API credentials are correct',
                'Check if your token has expired',
            ]

        case 'PERMISSION_ERROR':
            return [
                'Verify your account has permissions for this operation',
                'Check if you have access to the selected project',
                'Contact your DevCycle admin for permissions',
            ]

        case 'RESOURCE_NOT_FOUND':
            return [
                'Verify the resource key/ID is correct',
                'Check if the resource exists in the selected project',
                "Ensure you're in the correct environment",
            ]

        case 'VALIDATION_ERROR':
            return [
                'Check the provided parameters are valid',
                'Verify required fields are not missing',
                'Review parameter format and constraints',
            ]

        case 'RATE_LIMIT_ERROR':
            return [
                'Wait a moment before trying again',
                'Consider reducing the frequency of requests',
            ]

        case 'NETWORK_ERROR':
            return [
                'Check your internet connection',
                'Verify firewall settings allow DevCycle API access',
                'Try again in a few moments',
            ]

        case 'PROJECT_ERROR':
            return [
                'Select a valid project (use "dvc projects select" in CLI or project selection tools in workers)',
                'Verify the project key is correct',
                'Check if you have access to this project',
            ]

        default:
            return []
    }
}
