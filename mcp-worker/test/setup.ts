/**
 * Global test setup for DevCycle MCP Worker tests
 */

// Set up test environment
global.console = {
    ...console,
    // Suppress logs during tests unless needed
    log: process.env.VITEST_DEBUG ? console.log : () => {},
    info: process.env.VITEST_DEBUG ? console.info : () => {},
    warn: console.warn,
    error: console.error,
}
