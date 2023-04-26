import { createFeature, CreateFeatureParams } from '../../api/features'
import { descriptionPrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class CreateFeature extends CreateCommand<CreateFeatureParams> {
    static hidden = false
    static description = 'Create a new Feature'

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const params = await this.populateParameters(CreateFeatureParams, true)
        const feature: CreateFeatureParams = {
            name: params.name,
            description: params.description,
            key: params.key,
        }
        const result = await createFeature(this.token, this.projectKey, feature)
        this.writer.showResults(result)
    }
}
