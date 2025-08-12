import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
    test: {
        poolOptions: {
            workers: {
                wrangler: {
                    configPath: './wrangler.test.toml',
                    environment: 'test',
                },
                miniflare: {
                    // Enhanced Node.js compatibility for AJV and MCP SDK
                    compatibilityDate: '2024-12-30',
                    compatibilityFlags: ['nodejs_compat', 'nodejs_compat_v2'],
                },
                isolatedStorage: true,
            },
        },
        // Test timeout configuration
        testTimeout: 30000,
        // Test pattern matching
        include: ['test/**/*.test.ts'],
        // Remove setup files for now to avoid global scope issues
    },
})
