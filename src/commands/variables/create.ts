import { Flags } from '@oclif/core'
import {
    createVariable,
    CreateVariableParams,
    variableTypes
} from '../../api/variables'
import {
    descriptionPrompt,
    keyPrompt,
    namePrompt,
    variableTypePrompt,
    featurePrompt
} from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class CreateVariable extends CreateCommand<CreateVariableParams> {
    static hidden = false
    static description = 'Create a new Variable for an existing Feature.'

    static flags = {
        ...CreateCommand.flags,
        'type': Flags.string({
            description: 'The type of variable',
            options: variableTypes
        }),
        'feature': Flags.string({
            description: 'The key or id of the feature to create the variable for'
        }),
        'description': Flags.string({
            description: 'Description for the dashboard',
        }),
    }

    prompts = [
        keyPrompt,
        namePrompt,
        descriptionPrompt,
        variableTypePrompt,
        featurePrompt
    ]

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateVariable)

        const { key, name, description, type, feature, headless } = flags

        if (headless && (!key || !name || !type)) {
            this.writer.showError('In headless mode, the key, name and type are required')
            return
        }
        await this.requireProject()
        const params = await this.populateParameters(CreateVariableParams, true, {
            key,
            name,
            description,
            type,
            feature,
            headless
        })
        const result = await createVariable(this.authToken, this.projectKey, params)
        this.writer.showResults(result)
    }
}
