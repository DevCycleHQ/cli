import { createFeature } from '../../api/features'
import { descriptionPrompt, getSdkVisibilityPrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { VariableListOptions } from '../../ui/prompts/listPrompts/variablesListPrompt'
import { Flags } from '@oclif/core'
import { CreateFeatureDto } from '../../api/schemas'
import { VariationListOptions } from '../../ui/prompts/listPrompts/variationsListPrompt'
import { CreateFeatureParams } from '../../api/schemas'
import { updateFeatureConfigForEnvironment } from '../../api/targeting'
import { fetchEnvironments } from '../../api/environments'

export default class CreateFeature extends CreateCommand {
    static hidden = false
    authRequired = true
    static description = 'Create a new Feature.'
    static flags = {
        ...CreateCommand.flags,
        variables: Flags.string({
            description: 'The variables to create for the feature'
        }),
        variations: Flags.string({
            description: 'The variations to set for the feature'
        }),
        sdkVisibility: Flags.string({
            description: 'The visibility of the feature for the SDKs'
        }),
        interactive: Flags.boolean({
            char: 'i',
            description: 'Interactive Feature Creation Mode'
        }),
    }

    prompts = [namePrompt, keyPrompt, descriptionPrompt]

    quickCreateFeatureParams(answers: Record<string, string>): CreateFeatureParams {
        return {
            name: answers.name,
            key: answers.key,
            description: answers.description,
            variables: [ 
                { 
                    name: answers.name, 
                    key: answers.key, 
                    type: 'Boolean' 
                } 
            ],
            variations: [
                { 
                    key: 'variation-on', 
                    name: 'Variation On', 
                    variables: { [answers.key]: true }
                },
                {
                    key: 'variation-off',
                    name: 'Variation Off',
                    variables: { [answers.key]: false }
                }
            ],
        }
    }
    
    async setupTargetingForEnvironments(featureKey: string) {
        const environmentKeys = await this.getEnvironmentKeys()
        Object.values(environmentKeys).forEach(async (environmentKey) => {
            await updateFeatureConfigForEnvironment(
                this.authToken, 
                this.projectKey, 
                featureKey, 
                environmentKey, {
                    targets: [{
                        distribution: [{
                            percentage: 1,
                            _variation: 'variation-on',
                        }],
                        audience: {
                            name: 'All Users',
                            filters: {
                                filters: [
                                    {
                                        type: 'all'
                                    }
                                ],
                                operator: 'and'
                            }
                        }
                    }],
                    status: environmentKey === 'development' ? 'active' : 'inactive'
                })
        })
    }

    async getEnvironmentKeys() {
        const configurations = await fetchEnvironments(this.authToken, this.projectKey)
        const findEnvironmentKey = (type: string) => configurations.find((env) => env.type === type)?.key || type
        return {
            developmentKey: findEnvironmentKey('development'),
            stagingKey: findEnvironmentKey('staging'),
            productionKey: findEnvironmentKey('production'),
        }
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateFeature)
        const { headless, key, name, description, variables, variations, sdkVisibility } = flags
        await this.requireProject()

        if (headless && (!key || !name)) {
            this.writer.showError('The key and name flags are required')
            return
        } 

        if (!flags.interactive && !headless) {
            const params = this.quickCreateFeatureParams(
                await this.populateParametersWithInquirer(this.prompts) as Record<string, string>
            )

            const result = await createFeature(this.authToken, this.projectKey, params)
            await this.setupTargetingForEnvironments(result.key)
            this.writer.showResults(result)
            return
        }

        this.prompts.push((new VariableListOptions([], this.writer)).getVariablesListPrompt())
        this.prompts.push(
            (new VariationListOptions([], this.writer)).getVariationListPrompt()
        )
        this.prompts.push(getSdkVisibilityPrompt())    
        const params = await this.populateParametersWithZod(CreateFeatureDto, this.prompts, {
            key,
            name,
            description,
            ...(variables ? { variables: JSON.parse(variables) } : {}),
            ...(variations ? { variations: JSON.parse(variations) } : {}),
            ...(sdkVisibility ? { sdkVisibility: JSON.parse(sdkVisibility) } : {}),
            headless
        })

        const result = await createFeature(this.authToken, this.projectKey, params)
        this.writer.showResults(result)
    }
}
