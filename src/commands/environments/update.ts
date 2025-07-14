import inquirer from '../../ui/autocomplete'
import { updateEnvironment } from '../../api/environments'
import {
    descriptionPrompt,
    namePrompt,
    environmentPrompt,
    EnvironmentPromptResult,
} from '../../ui/prompts'
import { Flags } from '@oclif/core'
import { CreateEnvironmentDto, UpdateEnvironmentDto } from '../../api/schemas'
import UpdateCommandWithCommonProperties from '../updateCommandWithCommonProperties'
import { fetchEnvironmentByKey } from '../../api/environments'

export default class UpdateEnvironment extends UpdateCommandWithCommonProperties {
    static hidden = false
    static description = 'Update a Environment.'

    prompts = [namePrompt, descriptionPrompt]
    static flags = {
        ...UpdateCommandWithCommonProperties.flags,
        key: Flags.string({
            description: 'Unique ID',
        }),
        type: Flags.string({
            description: 'The type of environment',
            options: CreateEnvironmentDto.shape.type.options,
        }),
        description: Flags.string({
            description: 'Description for the environment',
        }),
    }

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(UpdateEnvironment)
        const { key } = args
        const { headless, project } = flags

        await this.requireProject(project, headless)
        let envKey = key
        if (!envKey) {
            this.writer.showError('Environment key is required')
            return
        }

        const environment = await fetchEnvironmentByKey(
            this.authToken,
            this.projectKey,
            envKey,
        )

        if (!environment) {
            this.writer.showError(`Environment with key "${envKey}" not found.`)
            return
        }

        this.writer.printCurrentValues(environment)

        const params = await this.populateParametersWithZod(
            UpdateEnvironmentDto,
            this.prompts,
            flags,
        )
        const result = await updateEnvironment(
            this.authToken,
            this.projectKey,
            envKey,
            params,
        )
        this.writer.showResults(result)
    }
}
