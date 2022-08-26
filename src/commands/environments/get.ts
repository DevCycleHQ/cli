import { Flags } from '@oclif/core'
import inquirer from 'inquirer'
import { fetchEnvironmentByKey, fetchEnvironments } from '../../api/environments'
import { environmentPrompt } from '../../ui/prompts'
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
        const { flags } = await this.parse(DetailedEnvironments)
        const keys = flags['keys']?.split(',')

        await this.requireProject()

        if (flags.headless && !keys) {
            throw (new Error('In headless mode, the keys flag is required'))
        }

        if (keys) {
            let environments = await fetchEnvironments(this.token, this.projectKey)
            environments = environments.filter((environment) => keys.includes(environment.key))
            this.writer.showResults(environments)
        } else {
            const responses = await inquirer.prompt(
                [environmentPrompt],
                {
                    token: this.token,
                    projectKey: this.projectKey
                }
            )
            const environment = await fetchEnvironmentByKey(this.token, this.projectKey, responses._environment)   
            this.writer.showResults(environment)
        }
    }
}