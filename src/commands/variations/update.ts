import inquirer from 'inquirer'
import UpdateCommand from '../updateCommand'
import { updateVariation, UpdateVariationParams } from '../../api/variations'
import { featurePrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import { Variable } from '../../api/schemas'

import {
    getVariationVariablePrompt,
    getVariationVariableValuePrompts,
    variationPrompt,
} from '../../ui/prompts/variationPrompts'
import { Args, Flags } from '@oclif/core'

export default class UpdateVariation extends UpdateCommand {
    static hidden = false
    authRequired = true
    static description = 'Update a Variation.'

    prompts = [
        keyPrompt,
        namePrompt
    ]

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id'
        }),
        ...UpdateCommand.args
    }

    static flags = {
        ...UpdateCommand.flags,
        'variables': Flags.string({
            description: 'The variables to create for the variation'
        }),
        'key': Flags.string({
            description: 'The variation key'
        }),
    }

    public async run(): Promise<void> {
        await this.requireProject()

        const { args, flags } = await this.parse(UpdateVariation)
        const { variables } = flags
        let featureKey
        if (!args.feature) {
            const { feature } = await inquirer.prompt([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            featureKey = feature
        } else {
            featureKey = args.feature
        }
        const { variation } = await inquirer.prompt([variationPrompt], {
            token: this.authToken,
            projectKey: this.projectKey,
            featureKey
        })

        this.prompts.push(await getVariationVariablePrompt(
            this.authToken,
            this.projectKey,
            featureKey,
        ))

        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(variation, null, 2))
        this.writer.blankLine()

        const data = await this.populateParameters(UpdateVariationParams, this.prompts, flags, true)
        console.error(`TEST: ${JSON.stringify(data)}`)
        console.error(`Variation: ${JSON.stringify(variation)}`)
        let variableAnswers: Record<string, unknown> = {}
        if (!variables && data.variables) {
            const variationVariableValuePrompts = await getVariationVariableValuePrompts(
                featureKey,
                data.variables as unknown as Variable[],
                variation.variables
            )
            variableAnswers = await inquirer.prompt(variationVariableValuePrompts)
        }

        const result = await updateVariation(
            this.authToken,
            this.projectKey,
            featureKey,
            variation.key,
            {
                ...data,
                variables: variables ? JSON.parse(variables) : variableAnswers
            }
        )
        this.writer.showResults(result)

    }
}
