import { createFeature, CreateFeatureParams } from '../../api/features'
import { descriptionPrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { VariableListOptions } from '../../ui/prompts/listPrompts/variableListPrompts'

export default class CreateFeature extends CreateCommand<CreateFeatureParams> {
    static hidden = false
    authRequired = true
    static description = 'Create a new Feature.'

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateFeature)
        const { headless, key, name, description, variables, variations } = flags
        await this.requireProject()

        if (headless && (!key || !name)) {
            this.writer.showError('In headless mode, the key and name flags are required')
            return
        }

        const params = await this.populateParameters(CreateFeatureParams, false, {
            key,
            name,
            description,
            variables,
            variations,
            headless
        })

        if (!variables) {
            params.variables = await (new VariableListOptions([], this.writer)).prompt()
        }

        await createFeature(this.authToken, this.projectKey, params)
        this.writer.successMessage('Feature successfully created')
    }
}
