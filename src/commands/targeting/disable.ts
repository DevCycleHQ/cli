import { Args } from '@oclif/core'
import { disableTargeting } from '../../api/targeting'
import { Variation } from '../../api/schemas'
import Base from '../base'
import { renderTargetingTree } from '../../ui/targetingTree'
import { getFeatureAndEnvironmentKeyFromArgs } from '../../utils/targeting'
import { fetchAudiences } from '../../api/audiences'

export default class DisableTargeting extends Base {
    static hidden = false
    static description = 'Disable the Targeting for the specified Environment on a Feature'
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
        const { args, flags } = await this.parse(DisableTargeting)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        const {
            feature,
            environment,
            environmentKey,
            featureKey
        } = await getFeatureAndEnvironmentKeyFromArgs(
            this.authToken,
            this.projectKey,
            args,
            flags,
        )
        const updatedTargeting = await disableTargeting(
            this.authToken,
            this.projectKey,
            featureKey,
            environmentKey
        )

        if (flags.headless) {
            this.writer.showResults(updatedTargeting)
        } else {
            const audiences = await fetchAudiences(this.authToken, this.projectKey)
            renderTargetingTree(
                [updatedTargeting], 
                [environment],
                feature.variations as Variation[],
                audiences
            )
        }
    }
}
