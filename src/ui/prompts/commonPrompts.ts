import chalk from 'chalk'

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

export const keyPrompt = {
    name: 'key',
    message: 'Key',
    suffix: ':',
    transformer: hintTextTransformer('(Unique ID)'),
    type: 'input'
}

export const namePrompt = {
    name: 'name',
    message: 'Name',
    suffix: ':',
    transformer: hintTextTransformer('(Human readable name)'),
    type: 'input'
}

export const descriptionPrompt = {
    name: 'description',
    message: 'Description',
    suffix: ':',
    transformer: hintTextTransformer('(Optional)'),
    type: 'input'
}
