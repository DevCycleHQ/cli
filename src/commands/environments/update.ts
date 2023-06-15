import inquirer from 'inquirer'
import {
    updateEnvironment,
    CreateEnvironmentParams,
    environmentTypes
} from '../../api/environments'
import {
    descriptionPrompt,
    namePrompt,
    environmentPrompt,
    EnvironmentPromptResult
} from '../../ui/prompts'
import UpdateCommand from '../updateCommand'
import { Flags } from '@oclif/core'

export default class UpdateEnvironment extends UpdateCommand {
    static hidden = false
    static description = 'Update a Environment.'

    prompts = [
        namePrompt,
        descriptionPrompt
    ]
    static flags = {
        ...UpdateCommand.flags,
        'key': Flags.string({
            description: 'Unique ID'
        }),
        'type': Flags.string({
            description: 'The type of environment',
            options: environmentTypes
        }),
        'description': Flags.string({
            description: 'Description for the environment',
        }),
    }

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(UpdateEnvironment)
        const { key } = args
        const { headless } = flags

        await this.requireProject()
        let envKey = key
        if (headless && !envKey) {
            this.writer.showError('The key argument is required')
            return
        } else if (!envKey) {
            const { environment } = await inquirer.prompt<EnvironmentPromptResult>([environmentPrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            envKey = environment._id
            this.writer.blankLine()
            this.writer.statusMessage('Current values:')
            this.writer.statusMessage(JSON.stringify(environment, null, 2))
            this.writer.blankLine()
        }

        const params = await this.populateParameters(
            CreateEnvironmentParams,
            this.prompts,
            flags,
            true
        )

        const result = await updateEnvironment(
            this.authToken,
            this.projectKey,
            envKey,
            params
        )
        this.writer.showResults(result)
    }
}
