import { Environment, UserOverride } from '../../api/schemas'
import { getDisplayOrderedEnvironmentList } from '../environments'

export const orderOverridesForDisplay = (overrides: UserOverride[], environments: Environment[]) => {
    const environmentsOrder = getDisplayOrderedEnvironmentList(environments)

    return overrides.sort((a, b) => {
        if (a._feature === b._feature) {
            return environmentsOrder.indexOf(a._environment) - environmentsOrder.indexOf(b._environment)
        }
        return a.featureName.localeCompare(b.featureName)
    })
}