import { Environment } from '../../api/schemas'

const environmentsDisplayOrder = [
    'development',
    'staging',
    'production',
    'disaster_recovery',
]

export const getDisplayOrderedEnvironmentList = (
    environments: Environment[],
): string[] => {
    return environments
        .sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name)
            }
            return (
                environmentsDisplayOrder.indexOf(a.type) -
                environmentsDisplayOrder.indexOf(b.type)
            )
        })
        .map((env) => env._id)
}
