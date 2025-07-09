import inquirer from '../../ui/autocomplete'
import { updateVariable } from '../../api/variables'
import {
    VariablePromptResult,
    descriptionPrompt,
    namePrompt,
    variablePrompt,
} from '../../ui/prompts'
import { Flags } from '@oclif/core'
import { UpdateVariableDto } from '../../api/schemas'
import UpdateCommandWithCommonProperties from '../updateCommandWithCommonProperties'

export default class UpdateVariable extends UpdateCommandWithCommonProperties {
    static hidden = false
    static description = 'Update a Variable.'

    prompts = [namePrompt, descriptionPrompt]

    static flags = {
        ...UpdateCommandWithCommonProperties.flags,
        description: Flags.string({
            description: 'Description for the variable',
        }),
    }

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(UpdateVariable)
        const { key } = args
        const { headless, project } = flags

        await this.requireProject(project, headless)
        let variableKey = key
        if (headless && !variableKey) {
            this.writer.showError('The key argument is required')
            return
        } else if (!variableKey) {
            this.writer.showError('Variable key is required')
            return
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
            params,
        )
        this.writer.showResults(result)
    }
}
