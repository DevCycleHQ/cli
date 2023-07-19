import { Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { fetchEnvironments } from '../../api/environments'
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
        const { flags } = await this.parse(DetailedEnvironments)
        const keys = flags['keys']?.split(',') || []
        const { headless, project } = flags
        await this.requireProject(project, headless)

        let environments = await fetchEnvironments(this.authToken, this.projectKey)
        if (keys.length) {
            environments = environments.filter((environment) => 
                keys.includes(environment.key) || keys.includes(environment._id))
            this.writer.showResults(environments)
            return
        } 

        // show all environments if no keys flag provided in headless mode
        if (flags.headless) {
            this.writer.showResults(environments)
            return
        }

        // prompt for keys in interactive mode 
        const responses = await inquirer.prompt<EnvironmentPromptResult>(
            [environmentPrompt],
            {
                token: this.authToken,
                projectKey: this.projectKey
            }
        )
        const environment = environments.find((environment) => environment._id === responses.environment._id)
        this.writer.showResults(environment)
        
    }
}
