import { Flags } from '@oclif/core'
import {
    createEnvironment,
    CreateEnvironmentParams,
    environmentTypes
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
    static flags = {
        ...CreateCommand.flags,
        'type': Flags.string({
            description: 'The type of environment',
            options: environmentTypes
        }),
        'description': Flags.string({
            description: 'Description for the dashboard',
        }),
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateEnvironment)

        const { key, name, type, description, headless } = flags

        await this.requireProject()
        if (headless && (!type || !key || !name)) {
            this.writer.showError('In headless mode, the type, key, and name flags are required')
            return
        }

        const params = await this.populateParameters(CreateEnvironmentParams, false, {
            key,
            name,
            description,
            type,
            headless
        })

        const result = await createEnvironment(this.authToken, this.projectKey, params)
        this.writer.showResults(result)
    }

}
