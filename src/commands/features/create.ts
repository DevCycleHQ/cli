import { Args } from '@oclif/core'
import { createFeature, CreateFeatureParams } from '../../api/features'
import { descriptionPrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class CreateFeature extends CreateCommand<CreateFeatureParams> {
    static hidden = false
    authRequired = true
    static description = 'Create a new Feature.'

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(CreateFeature)
        const { headless, key, name, description } = flags
        await this.requireProject()

        if (headless && (!key || !name)) {
            this.writer.showError('In headless mode, the key and name flags are required')
            return
        }

        const params = await this.populateParameters(CreateFeatureParams, false, {
            key,
            name,
            description,
            headless
        })

        await createFeature(this.authToken, this.projectKey, params)
        this.writer.successMessage('Feature successfully created')
    }
}
