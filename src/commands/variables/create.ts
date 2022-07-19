import {
    createVariable,
    CreateVariableParams
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
    
    prompts = [
        keyPrompt,
        namePrompt,
        descriptionPrompt,
        variableTypePrompt,
        featurePrompt
    ]

    public async run(): Promise<void> {
        await this.requireProject()
        const params = await this.populateParameters(CreateVariableParams)
        const result = await createVariable(this.token, this.projectKey, params)
        this.writer.showResults(result)
    }
}
