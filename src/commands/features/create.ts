import { Flags } from '@oclif/core'
import { createFeature, CreateFeatureParams } from '../../api/features'
import { createVariable, CreateVariableParams } from '../../api/variables'
import { fetchEnvironments } from '../../api/environments'
import { descriptionPrompt, keyPrompt, namePrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class CreateFeature extends CreateCommand<CreateFeatureParams> {
    static hidden = false
    static description = 'Create a new Feature'

    static flags = {
        ...CreateCommand.flags,
        withFlag: Flags.boolean({
            description:
                'Create a boolean variable with the same key as the feature',
        }),
    }

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateFeature)

        const params = await this.populateParameters(CreateFeatureParams, true)
        const feature: CreateFeatureParams = {
            name: params.name,
            description: params.description,
            key: params.key,
            variables: [
                {
                    key: params.key,
                    name: params.key,
                    type: 'Boolean',
                    defaultValue: false,
                },
            ],
            variations: [
                {
                    key: 'variation-on',
                    name: 'ON',
                    variables: {
                        [params.key]: true,
                    },
                },
                {
                    key: 'variation-off',
                    name: 'OFF',
                    variables: {
                        [params.key]: false,
                    },
                },
            ],
        }
        const result = await createFeature(this.token, this.projectKey, feature)
        if (!result) {
            this.warn('Failed to create the feature.')
            return
        }
        this.writer.showResults(result)
        if (flags.withFlag) {
            const variableParams: CreateVariableParams = {
                key: params.key,
                name: `Toggle ${params.name}`,
                description: `A boolean variable to toggle the ${params.name} feature.`,
                type: 'Boolean',
                _feature: result._id, // Assuming the result object contains the created feature's _id
            }
            const variableResult = await createVariable(
                this.token,
                this.projectKey,
                variableParams,
            )
            this.writer.showResults(variableResult)
        }

        // Fetch all environments
        const environments = await fetchEnvironments(
            this.token,
            this.projectKey,
        )

        // For each environment, create a targeting rule for all users and disable all environment rules
        for (const environment of environments) {
            // Create a targeting rule for all users
            // Add API call to create a targeting rule for all users
            // Disable all environment rules
            // Add API call to disable all environment rules
        }
    }

    public async createFeatureWithVariable(
        featureParams: CreateFeatureParams,
        variableParams: Omit<CreateVariableParams, 'type'> & {
            type: 'String' | 'Boolean' | 'Number' | 'JSON'
        },
        defaultValueOn: string | boolean | number | Record<string, unknown>,
        defaultValueOff: string | boolean | number | Record<string, unknown>,
    ): Promise<void> {
        const feature: CreateFeatureParams = {
            ...featureParams,
            variables: [
                {
                    ...variableParams,
                    defaultValue: defaultValueOff,
                },
            ],
            variations: [
                {
                    key: 'variation-on',
                    name: 'ON',
                    variables: {
                        [variableParams.key]: defaultValueOn,
                    },
                },
                {
                    key: 'variation-off',
                    name: 'OFF',
                    variables: {
                        [variableParams.key]: defaultValueOff,
                    },
                },
            ],
        }
        const result = await createFeature(this.token, this.projectKey, feature)
        if (!result) {
            this.warn('Failed to create the feature.')
            return
        }
        this.writer.showResults(result)
    }
}
