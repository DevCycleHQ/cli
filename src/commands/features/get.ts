import { Flags } from '@oclif/core'
import { fetchFeatures, fetchFeatureByKey } from '../../api/features'
import Base from '../base'
import { batchRequests } from '../../utils/batchRequests'

export default class DetailedFeatures extends Base {
    static hidden = false
    static description = 'Retrieve Features from the Management API'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --keys=feature-one,feature-two'
    ]
    static flags = {
        ...Base.flags,
        'keys': Flags.string({
            description: 'Comma-separated list of feature keys to fetch details for',
        }),
        'search': Flags.string({
            description: 'Filter features by search query'
        }),
        'page': Flags.integer({
            description: 'Page number to fetch'
        }),
        'per-page': Flags.integer({
            description: 'Number of features to fetch per page'
        })
    }
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(DetailedFeatures)
        const keys = flags['keys']?.split(',')
        const { project, headless } = flags
        await this.requireProject(project, headless)
        let features
        if (keys) {
            features = await batchRequests(
                keys,
                (key) => fetchFeatureByKey(this.authToken, this.projectKey, key)
            )
        } else {
            const query = {
                page: flags['page'],
                perPage: flags['per-page'],
                search: flags['search'],
            }
            features = await fetchFeatures(this.authToken, this.projectKey, query)
        }

        this.writer.showResults(features)
    }
}
