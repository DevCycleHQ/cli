import { Flags } from '@oclif/core'
import {
    createEnvironment,
} from '../../api/environments'
import {
    descriptionPrompt,
    keyPrompt,
    namePrompt,
    environmentTypePrompt
} from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { CreateEnvironmentDto } from '../../api/schemas'
import { ZodError } from 'zod'

export default class CreateEnvironment extends CreateCommand {
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
            options: CreateEnvironmentDto.shape.type.options,
        }),
        'description': Flags.string({
            description: 'Description for the dashboard',
        }),
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateEnvironment)
        const { key, name, type, headless } = flags

        if (headless && (!type || !key || !name)) {
            this.writer.showError('The type, key, and name flags are required')
            return
        }

        try {
            const params = await this.populateParametersWithZod(
                CreateEnvironmentDto,
                this.prompts,
                flags,
            )
            const result = await createEnvironment(this.authToken, this.projectKey, params)
            this.writer.showResults(result)
        } catch (e) {
            if (e instanceof ZodError) {
                this.writer.showError(`Input failed validation with the following errors:\n${e.message}`)    
            }
        }
    }
}
