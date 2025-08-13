/**
 * Centralized dashboard link generation for DevCycle
 */
const BASE_URL = 'https://app.devcycle.com'

function requireProjectKey(
    projectKey: string | undefined,
    operation: string,
): asserts projectKey is string {
    if (!projectKey) {
        throw new Error(
            `Project key required for ${operation}. Please select a project using the select_project tool first.`,
        )
    }
}

export const dashboardLinks = {
    project: {
        dashboard: (orgId: string, projectKey: string | undefined): string => {
            requireProjectKey(projectKey, 'project dashboard')
            return `${BASE_URL}/o/${orgId}/p/${projectKey}`
        },
        edit: (orgId: string, projectKey: string | undefined): string => {
            requireProjectKey(projectKey, 'project edit')
            return `${BASE_URL}/o/${orgId}/settings/projects/${projectKey}/edit`
        },
        list: (orgId: string): string =>
            `${BASE_URL}/o/${orgId}/settings/projects`,
    },

    feature: {
        list: (orgId: string, projectKey: string | undefined): string => {
            requireProjectKey(projectKey, 'features list')
            return `${BASE_URL}/o/${orgId}/p/${projectKey}/features`
        },
        dashboard: (
            orgId: string,
            projectKey: string | undefined,
            featureKey: string,
            page: 'overview' | 'manage-feature' | 'audit-log' = 'overview',
        ): string => {
            requireProjectKey(projectKey, 'feature dashboard')
            return `${BASE_URL}/o/${orgId}/p/${projectKey}/features/${featureKey}/${page}`
        },
    },

    environment: {
        settings: (orgId: string, projectKey: string | undefined): string => {
            requireProjectKey(projectKey, 'environment settings')
            return `${BASE_URL}/o/${orgId}/settings/p/${projectKey}/environments`
        },
    },

    variable: {
        list: (orgId: string, projectKey: string | undefined): string => {
            requireProjectKey(projectKey, 'variables list')
            return `${BASE_URL}/o/${orgId}/p/${projectKey}/variables`
        },
    },

    analytics: {
        feature: (
            orgId: string,
            projectKey: string | undefined,
            featureKey: string,
        ): string => {
            requireProjectKey(projectKey, 'feature analytics')
            return `${BASE_URL}/o/${orgId}/p/${projectKey}/features/${featureKey}/analytics`
        },
        project: (orgId: string, projectKey: string | undefined): string => {
            requireProjectKey(projectKey, 'project analytics')
            return `${BASE_URL}/o/${orgId}/p/${projectKey}/analytics`
        },
    },

    organization: {
        settings: (orgId: string): string => `${BASE_URL}/o/${orgId}/settings`,
        profileOverrides: (orgId: string): string =>
            `${BASE_URL}/o/${orgId}/settings/profile-overrides`,
    },

    customProperties: {
        list: (orgId: string, projectKey: string | undefined): string => {
            requireProjectKey(projectKey, 'custom properties')
            return `${BASE_URL}/o/${orgId}/p/${projectKey}/custom-properties`
        },
    },
}
