import { Flags } from '@oclif/core'
import {
    createVariable,
} from '../../api/variables'
import CreateCommand from '../createCommand'
import { createVariablePrompts, variableFeaturePrompt } from '../../ui/prompts'
import { CreateVariableDto } from '../../api/schemas'
import inquirer from '../../ui/autocomplete'

export default class CreateVariable extends CreateCommand {
    static hidden = false
    static description = 'Create a new Variable for an existing Feature.'

    static flags = {
        ...CreateCommand.flags,
        'type': Flags.string({
            description: 'The type of variable',
            options: CreateVariableDto.shape.type.options
        }),
        'feature': Flags.string({
            description: 'The key or id of the feature to create the variable for'
        }),
        'description': Flags.string({
            description: 'Description for the dashboard',
        }),
    }

    prompts = createVariablePrompts

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateVariable)
        const { key, name, type, feature, headless, project } = flags
        await this.requireProject(project, headless)

        if (headless && (!key || !name || !type || !feature)) {
            this.writer.showError('The key, name, feature, and type flags are required')
            return
        }
        flags._feature = feature

        let params = await this.populateParametersWithZod(CreateVariableDto, this.prompts, flags)
        if (!headless) {
            const { associateToFeature } = await inquirer.prompt([{
                name: 'associateToFeature',
                message: 'Would you like to associate this variable to a feature?',
                type: 'confirm',
                default: false
            }])
    
            if (associateToFeature) {
                params = await this.populateParametersWithZod(CreateVariableDto, [variableFeaturePrompt], params)
            }
        }
        const result = await createVariable(this.authToken, this.projectKey, params)
        this.writer.showResults(result)
    }
}
