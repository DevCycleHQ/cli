import { Project, Environment } from '../../api/schemas'

// Helper function to transform SDK keys to only include key and createdAt
export const transformSdkKeys = (sdkKeys: Environment['sdkKeys']) => {
    if (!sdkKeys) return { mobile: [], client: [], server: [] }

    return Object.fromEntries(
        Object.entries(sdkKeys).map(([keyType, keys]) => [
            keyType,
            keys?.map((sdk) => ({
                key: sdk.key,
                createdAt: sdk.createdAt,
            })) || [],
        ]),
    )
}

// Common function to format project with environments
export const formatProjectWithEnvironments = (
    project: Project,
    environments: Environment[],
    message?: string,
) => {
    return {
        selectedProject: {
            key: project.key,
            name: project.name,
            description: project.description || '',
            environments: environments.map((env: Environment) => ({
                key: env.key,
                name: env.name,
                description: env.description || '',
                color: env.color || '',
                type: env.type,
                sdkKeys: transformSdkKeys(env.sdkKeys),
            })),
        },
        message:
            message ||
            `Project '${project.name}' (${project.key}) found with ${environments.length} environment(s).`,
    }
}
