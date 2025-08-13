import { Audience, Filter } from '../../api/schemas'

export const buildAudienceNameMap = (audiences?: Audience[]) => {
    return (
        audiences?.reduce(
            (acc, audience) => {
                acc[audience._id] =
                    audience.name || audience.key || audience._id
                return acc
            },
            {} as Record<string, string>,
        ) || {}
    )
}

export const replaceAudienceIdInFilter = (
    filter: Filter,
    audienceNameMap: Record<string, string>,
) => {
    const newFilter = structuredClone(filter) as typeof filter
    if (newFilter.type === 'audienceMatch') {
        const audienceIds = newFilter._audiences!
        const audienceNames = audienceIds.map(
            (audienceId) => audienceNameMap[audienceId] || audienceId,
        )
        newFilter._audiences = audienceNames
    }
    return newFilter
}
