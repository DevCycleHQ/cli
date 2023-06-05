import { Flags } from '@oclif/core'
import inquirer from 'inquirer'
import {
    createEnvironment,
    environmentTypes
} from '../../api/environments'
import {
    descriptionPrompt,
    keyPrompt,
    namePrompt,
    environmentTypePrompt
} from '../../ui/prompts'
import Base from '../base'

export default class CreateEnvironment extends Base {
    static hidden = false
    static description = 'Create a new Environment for an existing Feature.'

    prompts = [
        keyPrompt,
        namePrompt,
        descriptionPrompt,
        environmentTypePrompt,
    ]
    static flags = {
        ...Base.flags,
        'key': Flags.string({
            description: 'Unique ID to refer to the environment.'
        }),
        'name': Flags.string({
            description: 'Human readable name of the environment.',
        }),
        'description': Flags.string({
            description: 'Description for display in the dashboard.',
        }),
        'type': Flags.string({
            description: 'The type of environment',
            options: environmentTypes
        }),
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateEnvironment)

        await this.requireProject()
        if (flags.headless && (!flags.type || !flags.key || !flags.name)) {
            this.writer.showError('In headless mode, the environment, key, and name flags are required')
            return
        }
        const key = await this.getKey()
        const name = await this.getName()
        const type = await this.getEnv()
        const description = await this.getDescription()

        const result = await createEnvironment(this.authToken, this.projectKey, {
            key,
            name,
            description,
            type
        }
        )
        this.writer.showResults(result)
    }
    private async getKey(): Promise<string> {
        const { flags } = await this.parse(CreateEnvironment)
        if (flags.key) {
            return flags.key
        }
        const responses = await inquirer.prompt([keyPrompt])
        return responses.key
    }
    private async getName(): Promise<string> {
        const { flags } = await this.parse(CreateEnvironment)
        if (flags.name) {
            return flags.name
        }
        const responses = await inquirer.prompt([namePrompt])
        return responses.name
    }
    private async getEnv(): Promise<string> {
        const { flags } = await this.parse(CreateEnvironment)
        if (flags.type) {
            return flags.type
        }
        const responses = await inquirer.prompt([environmentTypePrompt],
            {
                token: this.authToken,
                projectKey: this.projectKey
            })
        return responses.type
    }
    private async getDescription(): Promise<string> {
        const { flags } = await this.parse(CreateEnvironment)
        if (flags.description) {
            return flags.description
        }
        if (flags.headless) {
            return ''
        }
        const responses = await inquirer.prompt([descriptionPrompt])
        return responses.description
    }

}
