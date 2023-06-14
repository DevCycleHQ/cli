import inquirer from 'inquirer'
import {
    updateEnvironment,
    CreateEnvironmentParams
} from '../../api/environments'
import {
    descriptionPrompt,
    namePrompt,
    environmentPrompt,
    EnvironmentPromptResult
} from '../../ui/prompts'
import UpdateCommand from '../updateCommand'
import { promptListOptions } from '../../ui/prompts/listPrompt'

export default class UpdateEnvironment extends UpdateCommand<CreateEnvironmentParams> {
    static hidden = false
    static description = 'Update a Environment.'

    prompts = [
        namePrompt,
        descriptionPrompt
    ]

    public async run(): Promise<void> {
        await this.requireProject()
        const { environment } = await inquirer.prompt<EnvironmentPromptResult>([environmentPrompt], {
            token: this.authToken,
            projectKey: this.projectKey
        })

        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(environment, null, 2))
        this.writer.blankLine()

        const params = await this.populateParameters(CreateEnvironmentParams)
        const result = await updateEnvironment(
            this.authToken,
            this.projectKey,
            environment._id,
            params
        )
        this.writer.showResults(result)
    }
}
