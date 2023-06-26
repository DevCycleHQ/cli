import { Args, Flags } from '@oclif/core'
import Base from './base'
import { Prompt, handleCustomPrompts } from '../ui/prompts'
import inquirer from 'inquirer'
import { chooseFields } from '../utils/prompts'

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
        const whichFields = await chooseFields(prompts, this.authToken, this.projectKey)
        filteredPrompts = prompts.filter((prompt) => whichFields.includes(prompt.name))
        return handleCustomPrompts(filteredPrompts, this.authToken, this.projectKey)
    }
}
