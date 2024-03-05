import { chunk } from 'lodash'

export const batchRequests = async (
    values: string[],
    mapFunction: (value: string) => Promise<unknown>,
) => {
    const result = []
    const batches = chunk(values, 10)
    for (const batch of batches) {
        const batchResults = await Promise.all(batch.map(mapFunction))
        result.push(...batchResults.filter(Boolean))
    }
    return result
}
