import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
    test: {
        poolOptions: {
            workers: {
                wrangler: {
                    configPath: './wrangler.test.toml',
                    environment: 'test',
                },
                isolatedStorage: true,
            },
        },
        testTimeout: 30000,
        include: ['test/**/*.test.ts'],
    },
})
