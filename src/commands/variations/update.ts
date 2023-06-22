import inquirer from 'inquirer'
import UpdateCommand from '../updateCommand'
import { fetchVariationByKey, updateVariation, UpdateVariationParams } from '../../api/variations'
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
        const { variables, name, key, headless } = flags
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
        let selectedVariation
        if (!args.key) {
            const { variation } = await inquirer.prompt([variationPrompt], {
                token: this.authToken,
                projectKey: this.projectKey,
                featureKey
            })
            selectedVariation = variation
        } else {
            selectedVariation = await fetchVariationByKey(this.authToken, this.projectKey, featureKey, args.key)
        }

        this.prompts.push(await getVariationVariablePrompt(
            this.authToken,
            this.projectKey,
            featureKey,
        ))

        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(selectedVariation, null, 2))
        this.writer.blankLine()

        const data = await this.populateParameters(UpdateVariationParams, this.prompts, {
            name,
            key,
            ...(variables ? { variables: JSON.parse(variables) } : {}),
            headless
        }, true)
        let variableAnswers: Record<string, unknown> = {}
        if (!variables && data.variables) {
            variableAnswers = await getVariationVariableValuePrompts(
                featureKey,
                // This is a hack that's needed since the output from the variable prompt is different
                // from the input for the --variable flag. That variation variable value data comes from
                // this prompt.
                data.variables as unknown as Variable[],
                selectedVariation.variables
            )
        }

        const result = await updateVariation(
            this.authToken,
            this.projectKey,
            featureKey,
            selectedVariation.key,
            {
                key: data.key,
                name: data.name,
                variables: variables ? JSON.parse(variables) : variableAnswers
            }
        )
        this.writer.showResults(result)
    }
}
