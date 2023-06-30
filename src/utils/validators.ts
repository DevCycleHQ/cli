export const isRequired = (inputName: string, value: string) => {
    if (!value || value.trim().length === 0) {
        return `${inputName} is required.`
    }
    return true
}

export const isValidKey = (inputName: string, value: string) => {
    if (!/^[\w-.]+$/.test(value)) {
        return `${inputName} can only contain letters, dashes, dots and underscores.`
    }
    return true
}

export const maxLength = (inputName: string, value: string, max: number) => {
    if (value.length > max) {
        return `${inputName} cannot be longer than ${max} characters.`
    }
    return true
}
