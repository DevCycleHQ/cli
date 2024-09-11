import { Args } from '@oclif/core'
import Base from '../base'
import {
    fetchFeatures,
    fetchStaticConfigurationByKey,
} from '../../api/features'

export default class Prompt extends Base {
    static hidden = false

    static description =
        'Replace a DevCycle variable with a static value in the current version of your code. ' +
        'Currently only JavaScript is supported.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> my-variable-key --value true --type Boolean',
        '<%= config.bin %> <%= command.id %> some-var --value "My Custom Name" --type String',
    ]

    static args = {
        key: Args.string({
            name: 'key',
            description: 'Key of variable to replace.',
        }),
    }

    static flags = {
        ...Base.flags,
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(Prompt)
        const { project, headless } = flags
        await this.requireProject(project, headless)
        const features = await fetchFeatures(this.authToken, this.projectKey, {
            page: 1,
            perPage: 10,
            status: 'complete',
        })
        const completedStaticConfigurations = await Promise.all(
            features
                .filter((f) => f.status === 'complete')
                .map((f) =>
                    fetchStaticConfigurationByKey(
                        this.authToken,
                        this.projectKey,
                        f.key,
                    ),
                ),
        )

        const variablesWithStaticValues = completedStaticConfigurations.map(
            (sc) =>
                sc
                    ? Object.entries(sc.variables).map(
                          ([key, value]) =>
                              `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`,
                      )
                    : '',
        )
        const result = `Cleanup feature flags: ${variablesWithStaticValues} using instructions from @dvc-ff-cleanup.md`
        this.writer.showResults(result)
    }
}
