import { Args, Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import {
    fetchEnvironments,
    fetchEnvironmentByKey,
} from '../../api/environments'
import { EnvironmentPromptResult, environmentPrompt } from '../../ui/prompts'
import Base from '../base'
import { batchRequests } from '../../utils/batchRequests'
import { parseKeysFromArgs } from '../../utils/parseKeysFromArgs'

export default class DetailedEnvironments extends Base {
    static hidden = false
    static description = 'Retrieve Environments from the management API'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> environment-one',
        '<%= config.bin %> <%= command.id %> environment-one environment-two',
        '<%= config.bin %> <%= command.id %> environment-one,environment-two',
        '<%= config.bin %> <%= command.id %> --keys=environment-one,environment-two',
    ]
    static args = {
        keys: Args.string({
            description:
                'Environment keys to fetch (space-separated or comma-separated)',
            required: false,
        }),
    }
    static strict = false
    static flags = {
        ...Base.flags,
        keys: Flags.string({
            description:
                'Comma-separated list of environment keys to fetch details for',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        const { args, argv, flags } = await this.parse(DetailedEnvironments)
        const { headless, project } = flags
        await this.requireProject(project, headless)

        const keys = parseKeysFromArgs(args, argv, flags)

        if (keys && keys.length > 0) {
            const environments = await batchRequests(keys, (key) =>
                fetchEnvironmentByKey(this.authToken, this.projectKey, key),
            )
            this.writer.showResults(environments)
            return
        }

        // show all environments if no keys flag provided in headless mode
        if (flags.headless) {
            const environments = await fetchEnvironments(
                this.authToken,
                this.projectKey,
            )
            this.writer.showResults(environments)
            return
        }

        // prompt for key in interactive mode
        const responses = await inquirer.prompt<EnvironmentPromptResult>(
            [environmentPrompt],
            {
                token: this.authToken,
                projectKey: this.projectKey,
            },
        )
        this.writer.showResults(responses.environment)
    }
}
