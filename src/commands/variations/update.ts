import inquirer from 'inquirer'
import UpdateCommand from '../updateCommand'
import { CreateVariationParams, updateVariation } from '../../api/variations'
import { featurePrompt, keyPrompt, namePrompt, variablePrompt } from '../../ui/prompts'
import { updateVariableValuePrompt, variationPrompt } from '../../ui/prompts/variationPrompts'
import { Args } from '@oclif/core'

export default class UpdateVariation extends UpdateCommand<CreateVariationParams> {
    static hidden = false
    authRequired = true
    static description = 'Update a Variation.'

    prompts = [
        keyPrompt,
        namePrompt,
        updateVariableValuePrompt
    ]

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id'
        })
    }

    
    public async run(): Promise<void> {
        await this.requireProject()

        const { args } = await this.parse(UpdateVariation)

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

        const data = await this.populateParameters(CreateVariationParams)

        if (this.chosenFields.includes(updateVariableValuePrompt.name)) {
            const { variable } = await inquirer.prompt([updateVariableValuePrompt], {
                token: this.authToken,
                projectKey: this.projectKey,
                variables: variation.variables
            })
        }
        
        const result = await updateVariation(
            this.authToken,
            this.projectKey,
            featureKey,
            variation.key,
            data
        )
        this.writer.showResults(result)

    }
}
