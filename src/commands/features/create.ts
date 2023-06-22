import { createFeature } from '../../api/features'
import { descriptionPrompt, keyPrompt, namePrompt, sdkVisibilityPrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { VariableListOptions } from '../../ui/prompts/listPrompts/variablesListPrompt'
import { Flags } from '@oclif/core'
import { CreateFeatureDto } from '../../api/schemas'
import { ZodError } from 'zod'

export default class CreateFeature extends CreateCommand {
    static hidden = false
    authRequired = true
    static description = 'Create a new Feature.'
    static flags = {
        ...CreateCommand.flags,
        variables: Flags.string({
            description: 'The variables to create for the feature'
        }),
        sdkVisibility: Flags.string({
            description: 'The visibility of the feature for the SDKs'
        })
    }

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateFeature)
        const { headless, key, name, description, variables, variations, sdkVisibility } = flags
        await this.requireProject()

        if (headless && (!key || !name)) {
            this.writer.showError('The key and name flags are required')
            return
        }

        const params = await this.populateParametersWithZod(CreateFeatureDto, this.prompts, {
            key,
            name,
            description,
            ...(variables ? { variables: JSON.parse(variables) } : {}),
            ...(variations ? { variations: JSON.parse(variations) } : {}),
            ...(sdkVisibility ? { sdkVisibility: JSON.parse(sdkVisibility) } : {}),
            headless
        })

        if (!headless) {
            if (!variables) {
                params.variables = await (new VariableListOptions([], this.writer)).prompt()
            }

            // TODO: Add variation prompt

            if (!params.sdkVisibility) {
                params.sdkVisibility = await sdkVisibilityPrompt()
            }
        }

        const result = await createFeature(this.authToken, this.projectKey, params)
        this.writer.showResults(result)

    }
}
