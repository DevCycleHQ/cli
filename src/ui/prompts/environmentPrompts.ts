import chalk from 'chalk'
import {
    environmentTypes,
    fetchEnvironments,
    sdkTypes
} from '../../api/environments'
import { PromptResult } from '.'
import { Environment } from '../../api/schemas'
type EnvironmentChoice = {
    name: string,
    value: Environment
}

export type EnvironmentPromptResult = {
    environment: EnvironmentChoice['value']
} & PromptResult

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const environmentChoices = async (input: Record<string, any>):Promise<EnvironmentChoice[]> => {
    const environments = await fetchEnvironments(input.token, input.projectKey)
    const choices = environments.map((environment) => {
        const name = environment.name ? `${environment.name} ${chalk.gray(`(${environment.key})`)}` : environment.key
        return {
            name,
            value: environment,
        }
    })
    return choices
}

export const environmentPrompt = {
    name: 'environment',
    message: 'Which environment?',
    type: 'list',
    choices: environmentChoices
}

export const environmentTypePrompt = {
    name: 'type',
    message: 'The type of environment',
    type: 'list',
    choices: environmentTypes
}

export const sdkKeyTypePrompt = {
    name: 'sdkType',
    message: 'Which SDK?',
    type: 'list',
    choices: sdkTypes.concat(['all'])
}