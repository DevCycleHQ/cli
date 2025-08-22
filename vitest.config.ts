import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./test/setup.ts', './test-utils/init.js'],
        include: ['src/**/*.test.ts'],
        watch: false,
        passWithNoTests: false,
        reporters: 'default',
        testTimeout: 20000,
        hookTimeout: 20000,
    },
})
