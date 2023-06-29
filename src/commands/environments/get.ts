import { Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { fetchEnvironmentByKey, fetchEnvironments } from '../../api/environments'
import { EnvironmentPromptResult, environmentPrompt } from '../../ui/prompts'
import Base from '../base'

export default class DetailedEnvironments extends Base {
    static hidden = false
    static description = 'Retrieve Environments from the management API'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --keys=environment-one,environment-two'
    ]
    static flags = {
        ...Base.flags,
        'keys': Flags.string({
            description: 'Comma-separated list of environment keys to fetch details for',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        if (this.checkAuthExpired()) {
            return
        }
        const { flags } = await this.parse(DetailedEnvironments)
        const keys = flags['keys']?.split(',')

        await this.requireProject()

        if (flags.headless && !keys) {
            throw (new Error('In headless mode, the keys flag is required'))
        }

        if (keys) {
            let environments = await fetchEnvironments(this.authToken, this.projectKey)
            environments = environments.filter((environment) => keys.includes(environment.key))
            this.writer.showResults(environments)
        } else {
            const responses = await inquirer.prompt<EnvironmentPromptResult>(
                [environmentPrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
            const environment = await fetchEnvironmentByKey(this.authToken, this.projectKey, responses.environment._id)
            this.writer.showResults(environment)
        }
    }
}
