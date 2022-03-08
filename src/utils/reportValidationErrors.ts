import { ValidationError } from 'class-validator'

export function reportValidationErrors(name: string, errors: ValidationError[]): void {
    if (errors.length) {
        let error = errors[0]
        while (error.children?.length) {
            error = error.children[0]
        }

        throw new Error(`${name} file failed validation at property "${error.property}": ` +
            `${Object.values(error.constraints ?? {})[0]}`)
    }
}