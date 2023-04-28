import inquirer from 'inquirer'
import {
    updateEnvironment,
    CreateEnvironmentParams,
} from '../../api/environments'
import {
    descriptionPrompt,
    featurePrompt,
    namePrompt,
    environmentIdPrompt,
} from '../../ui/prompts'
import UpdateCommand from '../updateCommand'

export default class UpdateEnvironment extends UpdateCommand<CreateEnvironmentParams> {
    static hidden = false
    static description = 'Update a Environment.'

    prompts = [namePrompt, descriptionPrompt, featurePrompt]

    public async run(): Promise<void> {
        await this.requireProject()
        const { environment } = await inquirer.prompt([environmentIdPrompt], {
            token: this.token,
            projectKey: this.projectKey,
        })

        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(environment, null, 2))
        this.writer.blankLine()

        const params = await this.populateParameters(CreateEnvironmentParams)
        const result = await updateEnvironment(
            this.token,
            this.projectKey,
            environment.key,
            params,
        )
        this.writer.showResults(result)
    }
}
