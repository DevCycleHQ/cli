import {
    createEnvironment,
    CreateEnvironmentParams
} from '../../api/environments'
import {
    descriptionPrompt,
    keyPrompt,
    namePrompt,
    environmentTypePrompt
} from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class CreateEnvironment extends CreateCommand<CreateEnvironmentParams> {
    static hidden = false
    static description = 'Create a new Environment for an existing Feature.'
    
    prompts = [
        keyPrompt,
        namePrompt,
        descriptionPrompt,
        environmentTypePrompt,
    ]

    public async run(): Promise<void> {
        await this.requireProject()
        const params = await this.populateParameters(CreateEnvironmentParams)
        const result = await createEnvironment(this.token, this.projectKey, params)
        this.writer.showResults(result)
    }
}
