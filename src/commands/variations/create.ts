import inquirer from 'inquirer'
import { Args, Flags } from '@oclif/core'
import {
    featurePrompt,
    keyPrompt,
    namePrompt,
    variableValueBooleanPrompt,
    variableValueJSONPrompt,
    variableValueNumberPrompt,
    variableValueStringPrompt
} from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { createVariation, CreateVariationParams } from '../../api/variations'
import { fetchVariables } from '../../api/variables'

export default class CreateVariation extends CreateCommand<CreateVariationParams> {
    static hidden = false
    static description = 'Create a new Variation'

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

    prompts = [keyPrompt, namePrompt]

    public async run(): Promise<void> {
        await this.requireProject()

        const { args, flags } = await this.parse(CreateVariation)
        const { headless, key, name, variables } = flags
        if (headless && (!key || !name)) {
            this.writer.showError('In headless mode, the key and name flags are required')
            return
        }

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

        const params = await this.populateParameters(CreateVariationParams, false, {
            key,
            name,
            headless
        })

        let variableAnswers: Record<string, unknown> = {}
        if (!variables) {
            const variablesForFeature = await fetchVariables(this.authToken, this.projectKey, featureKey)
            const variablePrompts = []
            for (const variable of variablesForFeature) {
                switch (variable.type) {
                    case 'Boolean':
                        variablePrompts.push(variableValueBooleanPrompt(variable.key))
                        break
                    case 'Number':
                        variablePrompts.push(variableValueNumberPrompt(variable.key))
                        break
                    case 'JSON':
                        variablePrompts.push(variableValueJSONPrompt(variable.key))
                        break
                    default:
                        variablePrompts.push(variableValueStringPrompt(variable.key))
                }
            }

            variableAnswers = await inquirer.prompt(variablePrompts, {})

            for (const [key, value] of Object.entries(variableAnswers)) {
                const variable = variablesForFeature.find((variable) => variable.key === key)
                if (variable && variable.type === 'JSON') {
                    variableAnswers[key] = JSON.parse(value as string)
                }
            }
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
