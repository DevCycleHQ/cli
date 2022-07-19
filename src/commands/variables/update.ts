import inquirer from 'inquirer'
import {
    updateVariable,
    CreateVariableParams
} from '../../api/variables'
import {
    descriptionPrompt,
    featurePrompt,
    namePrompt,
    variablePrompt
} from '../../ui/prompts'
import UpdateCommand from '../updateCommand'

export default class UpdateVariable extends UpdateCommand<CreateVariableParams> {
    static hidden = false
    static description = 'Update a Variable.'

    prompts = [
        namePrompt,
        descriptionPrompt,
        featurePrompt
    ]

    public async run(): Promise<void> {
        await this.requireProject()
        const { variable } = await inquirer.prompt([variablePrompt], {
            token: this.token,
            projectKey: this.projectKey
        })

        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(variable, null, 2))
        this.writer.blankLine()

        const params = await this.populateParameters(CreateVariableParams)
        const result = await updateVariable(
            this.token,
            this.projectKey,
            variable.key,
            params
        )
        this.writer.showResults(result)
    }
}
