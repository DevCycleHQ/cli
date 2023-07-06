import { Audience, FeatureConfig } from '../../api/schemas'

export const replaceIdsInTargetingWithNames = async (
    featureConfigs: FeatureConfig[],
    audiences: Audience[]
) => {
    return featureConfigs.map((featureConfig) => {
        const newFeatureConfig = structuredClone(featureConfig) as typeof featureConfig
        newFeatureConfig.targets = newFeatureConfig.targets.map((target) => {
            const newTarget = structuredClone(target) as typeof target
            const filters = newTarget.audience.filters.filters.map((filter) => {
                const newFilter = { ...filter }
                if (newFilter.type === 'audienceMatch') {
                    const audienceIds = newFilter._audiences!
                    const audienceNames = audienceIds.map((audienceId) => {
                        const audience = audiences.find((audience) => audience._id === audienceId)
                        return audience?.name || audienceId
                    })
                    newFilter._audiences = audienceNames
                }
                return newFilter
            })
            newTarget.audience.filters.filters = filters
            return newTarget
        })
        return newFeatureConfig
    })
}