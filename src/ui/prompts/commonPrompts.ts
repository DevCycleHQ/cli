import chalk from 'chalk'
import { Prompt } from './types'
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
