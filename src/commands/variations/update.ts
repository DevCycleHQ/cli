import inquirer from 'inquirer'
import UpdateCommand from '../updateCommand'
import { updateVariation, UpdateVariationParams } from '../../api/variations'
import { featurePrompt, keyPrompt, namePrompt, variableChoices, variablePrompt } from '../../ui/prompts'
import { getUpdateVariablesPrompt, variationPrompt } from '../../ui/prompts/variationPrompts'
import { Args, Flags } from '@oclif/core'

export default class UpdateVariation extends UpdateCommand<UpdateVariationParams> {
    static hidden = false
    authRequired = true
    static description = 'Update a Variation.'

    prompts = [
        keyPrompt,
        namePrompt,
        variablePrompt
    ]

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id'
        })
    }

    static flags = {
        ...UpdateCommand.flags,
        'variables': Flags.string({
            description: 'The variables to create for the variation'
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
        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(variation, null, 2))
        this.writer.blankLine()

        // let variableAnswers: Record<string, unknown> = {}
        // if (this.chosenFields.includes(updateVariableValuePrompt.name)) {
        //     await getUpdateVariablesPrompt(this.authToken, this.projectKey, featureKey, variation.variables)
        //     variableAnswers = await promptVariableAnswers(this.authToken, this.projectKey, featureKey)
        // }
        const data = await this.populateParameters(UpdateVariationParams)
        console.error(`TEST: ${JSON.stringify(data)}`)
        const result = await updateVariation(
            this.authToken,
            this.projectKey,
            featureKey,
            variation.key,
            {
                ...data,
                variables: variables ? JSON.parse(variables) : {}
            }
        )
        this.writer.showResults(result)

    }
}
