import { ValidationError } from 'class-validator'

export function reportValidationErrors(errors: ValidationError[]): void {
    if (errors.length) {
        let error = errors[0]
        while (error.children?.length) {
            error = error.children[0]
        }

        throw new Error(`Failed validation at property "${error.property}": ` +
            `${Object.values(error.constraints ?? {})[0]}`)
    }
}