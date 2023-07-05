import { Args } from '@oclif/core'
import { enableTargeting } from '../../api/targeting'
import { renderTargetingTree } from '../../ui/targetingTree'
import Base from '../base'
import { fetchVariations } from '../../api/variations'
import { getFeatureAndEnvironmentKeyFromArgs } from '../../utils/targeting'
import { fetchEnvironmentByKey } from '../../api/environments'

export default class EnableTargeting extends Base {
    static hidden = false
    static description = 'Enable the Targeting for the specified Environment on a Feature'
    static examples = [
        '<%= config.bin %> <%= command.id %> feature-one environment-one',
    ]
    static flags = Base.flags
    static args = {
        feature: Args.string({ description: 'The Feature for the Targeting Rules' }),
        environment: Args.string({ description: 'The Environment where the Targeting Rules will be enabled' })
    }

    authRequired = true

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(EnableTargeting)

        await this.requireProject()

        const responses = await getFeatureAndEnvironmentKeyFromArgs(
            this.authToken,
            this.projectKey,
            args,
            flags,
        )
        const updatedTargeting = await enableTargeting(
            this.authToken,
            this.projectKey,
            responses.featureKey,
            responses.environmentKey
        )

        if (flags.headless) {
            this.writer.showResults(updatedTargeting)
        } else {
            renderTargetingTree(
                [updatedTargeting],
                [responses.environment],
                responses.feature.variations
            )
        }
    }
}
