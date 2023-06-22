import inquirer from '../../ui/autocomplete'
import {
    updateVariable,
} from '../../api/variables'
import {
    VariablePromptResult,
    descriptionPrompt,
    variableFeaturePrompt,
    namePrompt,
    variablePrompt,
} from '../../ui/prompts'
import UpdateCommand from '../updateCommand'
import { Flags } from '@oclif/core'
import { UpdateVariableDto } from '../../api/schemas'
import { ZodError } from 'zod'

export default class UpdateVariable extends UpdateCommand {
    static hidden = false
    static description = 'Update a Variable.'

    prompts = [
        namePrompt,
        descriptionPrompt,
        variableFeaturePrompt
    ]

    static flags = {
        ...UpdateCommand.flags,
        'description': Flags.string({
            description: 'Description for the variable',
        }),
        'feature': Flags.string({
            description: 'The ID of the feature to associate the variable to'
        }),
    }

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(UpdateVariable)
        const { key } = args
        const { headless } = flags
        flags._feature = flags.feature

        await this.requireProject()
        let variableKey = key
        if (headless && !variableKey) {
            this.writer.showError('The key argument is required')
            return
        } else if (!variableKey) {
            const { variable } = await inquirer.prompt<VariablePromptResult>([variablePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            variableKey = variable.key
            this.writer.blankLine()
            this.writer.statusMessage('Current values:')
            this.writer.statusMessage(JSON.stringify(variable, null, 2))
            this.writer.blankLine()
        }

        const params = await this.populateParametersWithZod(
            UpdateVariableDto,
            this.prompts,
            flags,
        )
        const result = await updateVariable(
            this.authToken,
            this.projectKey,
            variableKey,
            params
        )
        this.writer.showResults(result)
    }
}
