import { Args, Flags } from '@oclif/core'
import Base from './base'
import { Prompt, handleCustomPrompts } from '../ui/prompts'
import inquirer from 'inquirer'

export default abstract class UpdateCommand extends Base {
    authRequired = true

    static args = {
        key: Args.string({
            'key': Flags.string({
                description: 'Unique ID'
            })
        }),
    }

    static flags = {
        ...Base.flags,
        'name': Flags.string({
            description: 'Human readable name',
        }),
    }

    protected async populateParametersWithInquirer(prompts: Prompt[]) {
        if (!prompts.length) return {}
        let filteredPrompts = [ ...prompts ]
        const whichFields = await this.chooseFields(prompts)
        filteredPrompts = prompts.filter((prompt) => whichFields.includes(prompt.name))
        return handleCustomPrompts(filteredPrompts, this.authToken, this.projectKey)
    }

    private async chooseFields(prompts: Prompt[]): Promise<string[]> {
        const responses = await inquirer.prompt([{
            name: 'whichFields',
            type: 'checkbox',
            message: 'Which fields are you updating',
            choices: prompts.map((prompt) => {
                return {
                    name: prompt.name
                }
            })
        }], {
            token: this.authToken,
            projectKey: this.projectKey
        })

        return responses.whichFields
    }
}
