import { Flags } from '@oclif/core'
import { fetchFeatures } from '../../api/features'
import Base from '../base'

export default class DetailedFeatures extends Base {
    static hidden = false
    static description = 'Retrieve Features from the management API'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --keys=feature-one,feature-two'
    ]
    static flags = {
        ...Base.flags,
        'keys': Flags.string({
            description: 'Comma-separated list of feature keys to fetch details for',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(DetailedFeatures)
        const keys = flags['keys']?.split(',')

        await this.requireProject()

        let features = await fetchFeatures(this.token, this.projectKey)
        if (keys) {
            features = features.filter((feature) => keys.includes(feature.key))
        }
        this.writer.showResults(features)
    }
}