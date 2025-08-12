/**
 * Test fixtures and mock data
 */

import type { DevCycleJWTClaims } from '../../src/types'

/**
 * Common test user claims
 */
export const testUserClaims: DevCycleJWTClaims = {
    sub: 'test-user-123',
    email: 'test.user@devcycle.com',
    name: 'Test User',
    org_id: 'org_test_123',
    project_key: 'test-project-key',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: 'https://api-test.devcycle.com/',
    iss: 'https://test-auth.devcycle.com/',
}

/**
 * Test user without project
 */
export const testUserWithoutProject: DevCycleJWTClaims = {
    ...testUserClaims,
    project_key: undefined,
}

/**
 * Expected tool names that should be available
 */
export const expectedToolNames = [
    // Project selection tools
    'selectDevCycleProject',

    // Core DevCycle tools (from main CLI)
    'listDevCycleProjects',
    'getDevCycleProject',
    'listDevCycleEnvironments',
    'getDevCycleEnvironment',
    'listDevCycleFeatures',
    'getDevCycleFeature',
    'createDevCycleFeature',
    'updateDevCycleFeature',
    'listDevCycleVariables',
    'getDevCycleVariable',
    'createDevCycleVariable',
    'updateDevCycleVariable',
    'listDevCycleVariations',
    'getDevCycleVariation',
    'createDevCycleVariation',
    'updateDevCycleVariation',
]

/**
 * Mock API responses
 */
export const mockApiResponses = {
    projects: [
        {
            id: 'project-123',
            key: 'test-project',
            name: 'Test Project',
            description: 'A test project for E2E tests',
        },
    ],
    environments: [
        {
            id: 'env-123',
            key: 'development',
            name: 'Development',
            type: 'development',
        },
    ],
    features: [
        {
            id: 'feature-123',
            key: 'test-feature',
            name: 'Test Feature',
            description: 'A test feature flag',
            type: 'release',
            variations: [],
        },
    ],
}
