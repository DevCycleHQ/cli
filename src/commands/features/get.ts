import { Args, Flags } from '@oclif/core'
import { fetchFeatures, fetchFeatureByKey } from '../../api/features'
import Base from '../base'
import { batchRequests } from '../../utils/batchRequests'
import { parseKeysFromArgs } from '../../utils/parseKeysFromArgs'

export default class DetailedFeatures extends Base {
    static hidden = false
    static description = 'Retrieve Features from the Management API'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> feature-one',
        '<%= config.bin %> <%= command.id %> feature-one feature-two',
        '<%= config.bin %> <%= command.id %> feature-one,feature-two',
        '<%= config.bin %> <%= command.id %> --keys=feature-one,feature-two',
    ]
    static args = {
        keys: Args.string({
            description:
                'Feature keys to fetch (space-separated or comma-separated)',
            required: false,
        }),
    }
    static strict = false
    static flags = {
        ...Base.flags,
        keys: Flags.string({
            description:
                'Comma-separated list of feature keys to fetch details for',
        }),
        search: Flags.string({
            description: 'Filter features by search query',
        }),
        page: Flags.integer({
            description: 'Page number to fetch',
        }),
        'per-page': Flags.integer({
            description: 'Number of features to fetch per page',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        const { args, argv, flags } = await this.parse(DetailedFeatures)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        const keys = parseKeysFromArgs(args, argv, flags)

        let features
        if (keys && keys.length > 0) {
            features = await batchRequests(keys, (key) =>
                fetchFeatureByKey(this.authToken, this.projectKey, key),
            )
        } else {
            const query = {
                page: flags['page'],
                perPage: flags['per-page'],
                search: flags['search'],
            }
            features = await fetchFeatures(
                this.authToken,
                this.projectKey,
                query,
            )
        }

        this.writer.showResults(features)
    }
}
