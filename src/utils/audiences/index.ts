import { fetchAudiences } from '../../api/audiences'
import { FeatureConfig } from '../../api/schemas'

export const replaceIdsInTargetingWithNames = async (
    featureConfigs: FeatureConfig[],
    token: string,
    project_id: string
) => {
    const audiences = await fetchAudiences(token, project_id)
    return featureConfigs.map((featureConfig) => {
        const newFeatureConfig = { ...featureConfig }
        newFeatureConfig.targets.map((target) => {
            const filters = target.audience.filters.filters.map((filter) => {
                const newFilter = { ...filter }
                if (newFilter.type === 'audienceMatch') {
                    const audienceIds = newFilter._audiences!
                    const audienceNames = audienceIds.map((audienceId) => {
                        const audience = audiences.find((audience) => audience._id === audienceId)
                        return audience?.name || ''
                    })
                    newFilter._audiences = audienceNames
                }
                return newFilter
            })
            target.audience.filters.filters = filters
        })
        return newFeatureConfig
    })
}