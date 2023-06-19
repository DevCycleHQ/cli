import { Args, Flags } from '@oclif/core'
import Base from './base'
import { Prompt } from '../ui/prompts'
import inquirer from 'inquirer'

type namedObject = {
    name: string
}

export default abstract class UpdateCommand extends Base {
    authRequired = true
    chosenFields: string[] = []
    promptsToHandle: Array<namedObject> = []

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
        let filteredPrompts = [ ...prompts ]
        const whichFields = await this.chooseFields(prompts)
        filteredPrompts = prompts.filter((prompt) => whichFields.includes(prompt.name))

        return inquirer.prompt(filteredPrompts, {
            token: this.authToken,
            projectKey: this.projectKey
        })
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
