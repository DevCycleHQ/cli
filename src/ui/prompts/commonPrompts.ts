import chalk from 'chalk'
import { ListPrompt, Prompt } from './types'
import { partition } from 'lodash'
import inquirer from '../autocomplete'

export const hintTextTransformer = (hint: string) =>
    (value: string, answers: unknown, { isFinal }: { isFinal: boolean }) => {
        let newValue = value
        const styledHint = chalk.dim(hint)
        if (!value) {
            newValue = styledHint
        }
        if (isFinal) {
            return newValue !== chalk.dim(`${hint}`) ? chalk.cyan(`${newValue}`) : ''
        }
        return newValue
    }

export const keyPrompt: Prompt = {
    name: 'key',
    message: 'Key',
    suffix: ':',
    transformer: hintTextTransformer('(Unique ID)'),
    type: 'input'
}

export const namePrompt: Prompt = {
    name: 'name',
    message: 'Name',
    suffix: ':',
    transformer: hintTextTransformer('(Human readable name)'),
    type: 'input'
}

export const descriptionPrompt: Prompt = {
    name: 'description',
    message: 'Description',
    suffix: ':',
    transformer: hintTextTransformer('(Optional)'),
    type: 'input'
}

export const transformResponse = (answers: Record<string, unknown>, prompts: Prompt[]) => {
    const result = answers
    prompts.forEach((prompt) => {
        if (result[prompt.name] && prompt.transformResponse) {
            result[prompt.name] = prompt.transformResponse(result[prompt.name])
        }
    })
    return result
}

export const handleCustomPrompts = async (prompts: Prompt[], authToken: string, projectKey: string) => {
    const [listOptionsPrompts, standardPrompts] = partition(prompts, (prompt) => !!prompt.listOptionsPrompt)

    const result = await inquirer.prompt(standardPrompts, {
        token: authToken,
        projectKey: projectKey
    })
    for (const prompt of listOptionsPrompts as ListPrompt[]) {
        const carryForward: Record<string, any> = {}
        prompt.previousReponseFields?.forEach((field) => carryForward[field] = result[field])
        result[prompt.name] = await prompt.listOptionsPrompt(carryForward)
    }

    return transformResponse(result, prompts)
}