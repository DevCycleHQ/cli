import { createProject, CreateProjectParams } from '../../api/projects'
import { descriptionPrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class CreateProject extends CreateCommand<CreateProjectParams> {
    static hidden = false
    static description = 'Create a new Project'

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const params = await this.populateParameters(CreateProjectParams, false)
        const result = await createProject(this.authToken, params)
        this.writer.showResults(result)
    }
}
