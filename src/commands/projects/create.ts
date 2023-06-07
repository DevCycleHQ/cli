import { createProject, CreateProjectParams } from '../../api/projects'
import { descriptionPrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class CreateProject extends CreateCommand<CreateProjectParams> {
    static hidden = false
    static description = 'Create a new Project'

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateProject)
        const { headless, key, name, description } = flags
        if (headless && (!key || !name)) {
            this.writer.showError('In headless mode, the key and name flags are required')
            return
        }
        const params = await this.populateParameters(CreateProjectParams, false, {
            key,
            name,
            description,
            headless
        })
        const result = await createProject(this.authToken, params)
        this.writer.showResults(result)
    }
}
