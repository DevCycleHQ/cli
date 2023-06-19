import { ClassConstructor } from 'class-transformer'
import { Prompt } from '../ui/prompts'
import { ValidatorOptions, validateSync } from 'class-validator'
import { reportValidationErrors } from './reportValidationErrors'

export function validateParams<ResourceType>(
    paramClass: ClassConstructor<ResourceType>,
    params: ResourceType,
    validatorOptions?: ValidatorOptions
){
    const errors = validateSync(params as Record<string, unknown>, { ...validatorOptions })
    reportValidationErrors(errors)
}

// Filter out prompts that already have values provided by flags
export function filterPrompts(prompts: Prompt[], flags: Record<string, unknown>) {
    let filteredPrompts: Prompt[] = [ ...prompts ]
    Object.keys(flags).forEach((key) => {
        if (flags[key]) {
            filteredPrompts = filteredPrompts.filter((prompt) => prompt.name !== key)
        }
    })
    return filteredPrompts
}

// Merge answers from prompts with values provided by flags
export function mergeFlagsAndAnswers(flags: Record<string, unknown>, answers: Record<string, unknown>) {
    const updatedFlags = { ...flags }
    Object.keys(answers).forEach((key) => {
        if (updatedFlags[key] === undefined) {
            updatedFlags[key] = answers[key]
        }
    })
    return updatedFlags
}
