import { Args } from '@oclif/core'
import { enableTargeting } from '../../api/targeting'
import { Variation } from '../../api/schemas'
import { renderTargetingTree } from '../../ui/targetingTree'
import Base from '../base'
import { getFeatureAndEnvironmentKeyFromArgs } from '../../utils/targeting'
import { fetchAudiences } from '../../api/audiences'

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
        const updatedTargeting = await enableTargeting(
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
