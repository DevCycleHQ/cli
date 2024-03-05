import { ValidationError } from 'class-validator'
import { ZodError } from 'zod'
import Writer from '../ui/writer'
import { ValidatorOptions, validateSync } from 'class-validator'

export function validateParams<ResourceType>(
    params: ResourceType,
    validatorOptions?: ValidatorOptions,
) {
    const errors = validateSync(params as Record<string, unknown>, {
        ...validatorOptions,
    })
    reportValidationErrors(errors)
}

export function reportValidationErrors(errors: ValidationError[]): void {
    if (errors.length) {
        let error = errors[0]
        while (error.children?.length) {
            error = error.children[0]
        }

        throw new Error(
            `Failed validation at property "${error.property}": ` +
                `${Object.values(error.constraints ?? {})[0]}`,
        )
    }
}

export function reportZodValidationErrors(
    error: ZodError,
    writer: Writer,
): void {
    const errorsByKey = error.flatten().fieldErrors
    for (const issues of Object.values(errorsByKey)) {
        issues?.[0] && writer.showError(issues[0])
    }
}
