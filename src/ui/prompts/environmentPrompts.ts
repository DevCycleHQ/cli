import {
    Environment,
    environmentTypes,
    fetchEnvironments,
    sdkTypes,
} from '../../api/environments'

type EnvironmentChoice = {
    name: string
    value: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const environmentChoices = async (
    input: Record<string, any>,
): Promise<EnvironmentChoice[]> => {
    const environments = await fetchEnvironments(input.token, input.projectKey)
    const choices = environments.map((environment: Environment) => {
        return {
            name: environment.name || environment.key,
            value: environment._id,
        }
    })
    return choices
}

export const environmentPrompt = {
    name: '_environment',
    message: 'Which environment?',
    type: 'list',
    choices: environmentChoices,
}

export const environmentTypePrompt = {
    name: 'type',
    message: 'The type of environment',
    type: 'list',
    choices: environmentTypes,
}

export const sdkKeyTypePrompt = {
    name: 'sdkType',
    message: 'Which SDK?',
    type: 'list',
    choices: sdkTypes.concat(['all']),
}
