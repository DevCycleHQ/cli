import inquirer from 'inquirer'
import {
    updateVariable,
    CreateVariableParams
} from '../../api/variables'
import { showResults } from '../../ui/output'
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

        console.log('')
        console.log('Current values:')
        console.log(JSON.stringify(variable, null, 2))
        console.log('')

        const params = await this.populateParameters(CreateVariableParams)
        const result = await updateVariable(
            this.token,
            this.projectKey,
            variable.key,
            params
        )
        showResults(result)
    }
}
