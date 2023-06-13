import inquirer from 'inquirer'
import {
    updateEnvironment,
    CreateEnvironmentParams
} from '../../api/environments'
import {
    descriptionPrompt,
    namePrompt,
    environmentPrompt,
    EnvronmentPromptResult
} from '../../ui/prompts'
import UpdateCommand from '../updateCommand'

export default class UpdateEnvironment extends UpdateCommand<CreateEnvironmentParams> {
    static hidden = false
    static description = 'Update a Environment.'

    prompts = [
        namePrompt,
        descriptionPrompt
    ]

    public async run(): Promise<void> {
        await this.requireProject()
        const { _environment } = await inquirer.prompt<EnvronmentPromptResult>([environmentPrompt], {
            token: this.authToken,
            projectKey: this.projectKey
        })

        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(_environment, null, 2))
        this.writer.blankLine()

        const params = await this.populateParameters(CreateEnvironmentParams)
        const result = await updateEnvironment(
            this.authToken,
            this.projectKey,
            _environment,
            params
        )
        this.writer.showResults(result)
    }
}
