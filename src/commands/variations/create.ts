import inquirer from 'inquirer'
import { Args, Flags } from '@oclif/core'
import {
    featurePrompt,
    keyPrompt,
    namePrompt
} from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { CreateVariationDto } from '../../api/schemas'
import { createVariation } from '../../api/variations'
import { promptForVariationVariableValues } from '../../ui/prompts/variationPrompts'
import { fetchVariables } from '../../api/variables'
import {fetchFeatureByKey} from "../../api/features";

export default class CreateVariation extends CreateCommand {
    static hidden = false
    static description = 'Create a new Variation for an existing Feature.'

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id'
        })
    }

    static flags = {
        ...CreateCommand.flags,
        'variables': Flags.string({
            description: 'The variables to create for the variation'
        }),
    }

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --variables=\'{ "bool-var": true, "num-var": 80, "string-var": "test" }\''
    ]

    prompts = [namePrompt, keyPrompt]

    public async run(): Promise<void> {
        await this.requireProject()

        const { args, flags } = await this.parse(CreateVariation)
        const { headless, key, name, variables } = flags

        let featureKey
        let feature_id
        if (!args.feature) {
            const { feature } = await inquirer.prompt([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            featureKey = feature.key
            feature_id = feature._id
        } else {
            featureKey = args.feature
        }

        const params = await this.populateParametersWithZod(
            CreateVariationDto,
            this.prompts, {
                key,
                name,
                headless
            }
        )

        let variableAnswers: Record<string, unknown> = {}
        if (!variables) {
            if (!feature_id) {
                const feature = await fetchFeatureByKey(this.authToken, this.projectKey, featureKey)
                if (!feature) {
                    throw new Error(`Feature not found for key ${featureKey}`)
                }
                feature_id = feature._id
            }
            const variablesForFeature = await fetchVariables(this.authToken, this.projectKey, feature_id)
            variableAnswers = await promptForVariationVariableValues(
                variablesForFeature
            )
        }

        const variation = {
            key: params.key,
            name: params.name,
            variables: variables ? JSON.parse(variables) : variableAnswers
        }

        const result = await createVariation(this.authToken, this.projectKey, featureKey, variation)
        this.writer.showResults(result)
    }
}
