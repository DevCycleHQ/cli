import inquirer from 'inquirer'
import { Args, Flags } from '@oclif/core'
import {
    featurePrompt,
    keyPrompt,
    namePrompt
} from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { createVariation } from '../../api/variations'
import { CreateVariationDto } from '../../api/schemas'
import { ZodError } from 'zod'
import { createVariation, CreateVariationParams } from '../../api/variations'
import { getVariationVariableValuePrompts, promptVariableAnswers } from "../../ui/prompts/variationPrompts";

export default class CreateVariation extends CreateCommand {
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

        try {
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
            const prompts = await getVariationVariableValuePrompts(this.authToken, this.projectKey, featureKey)
            variableAnswers = await promptVariableAnswers(prompts)
        }

            const variation = {
                key: params.key,
                name: params.name,
                variables: variables ? JSON.parse(variables) : variableAnswers
            }

            const result = await createVariation(this.authToken, this.projectKey, featureKey, variation)
            this.writer.showResults(result)

        } catch (e) {
            if (e instanceof ZodError) {
                this.reportZodValidationErrors(e)
                return
            }
        }
    }
}
